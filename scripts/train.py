"""Unspoiled tonnage regressor and dataset-backed evidence exports.

Trains a small PyTorch MLP to predict annual food-waste tonnage for commercial
generators from their category, state, town population, geolocation, and
distance to the nearest permitted processor. Harmonizes the MA generator
dataset (annual tons) with the VT generator dataset (tons/week -> *52).

All numeric fields written to disk trace back to the Dryad dataset or to the
model's own outputs:

  - tonsPerYear              -> MA "tons" column  /  VT "TonsPerWeek" * 52
  - predictedTonsPerYear     -> trained model inference
  - residualTons             -> predicted - actual
  - nearestProcessorKm/Miles -> haversine over the dataset's lat/long columns
  - coveredByBan             -> tons >= threshold AND within distance_threshold,
                                where both thresholds come from the dataset
                                (bans_thresholds.csv)
  - thresholdStatus          -> "above" | "near" | "below", grounded in the
                                dataset's per-state ban threshold
  - compostingEffect         -> from composting_effect.csv
  - disposalEffect           -> from disposal_effect_size2.csv
  - divertedTonsPerYear      -> tonsPerYear * compostingEffect
                                (no $, no GHG multipliers, no invented constants)

Extra CSV files in the dataset are surfaced as honest side evidence rather
than as testimonials:

  - wb_enforcements.csv      -> count of MassDEP enforcement actions
  - boulder_waste.csv        -> Boulder's year-by-year diversion rate history
  - seattle_composting.csv   -> Seattle monthly composting tonnage history
"""

from __future__ import annotations

import csv
import json
import math
import random
import re
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
OUT_DATA = ROOT / "src" / "lib" / "data"
MODELS = ROOT / "models"
OUT_DATA.mkdir(parents=True, exist_ok=True)
MODELS.mkdir(parents=True, exist_ok=True)

SEED = 42
random.seed(SEED)
np.random.seed(SEED)
torch.manual_seed(SEED)

# ---------------------------------------------------------------------------
# Category harmonization
# ---------------------------------------------------------------------------

CATEGORIES = [
    "Restaurant",
    "Grocery",
    "Cafeteria",
    "School",
    "College",
    "Hospital",
    "Prison",
    "FoodService",
    "Bakery",
    "FoodManufacturer",
    "Warehouse",
    "Lodging",
    "Other",
]

MA_TYPE_MAP = {
    "R": "Restaurant",
    "F": "FoodService",
    "G": "Grocery",
    "IH": "Hospital",
    "W": "Warehouse",
    "C": "Cafeteria",
    "IC": "College",
    "IS": "School",
    "IP": "Prison",
}

VT_TYPE2_MAP = {
    "Restaurant": "Restaurant",
    "Caterer": "FoodService",
    "Grocery": "Grocery",
    "Bakery": "Bakery",
    "School": "School",
    "Convenience Store": "Grocery",
    "Lodging": "Lodging",
    "Food Processor": "FoodManufacturer",
    "Home-based Business": "Other",
    "Residential Facility": "Hospital",
}

VT_TYPE1_MAP = {
    "Food Manufacturer": "FoodManufacturer",
    "Nursing/Assisted Living": "Hospital",
    "School": "School",
    "Hospital": "Hospital",
    "Correctional Facility": "Prison",
    "Food Establishment": "Restaurant",
}


# ---------------------------------------------------------------------------
# Loaders
# ---------------------------------------------------------------------------

def load_cities() -> pd.DataFrame:
    df = pd.read_csv(RAW / "uscities.csv")
    df = df[["city_ascii", "state_id", "population", "lat", "lng"]].copy()
    df["city_key"] = df["city_ascii"].str.upper().str.strip()
    df = df.sort_values("population", ascending=False).drop_duplicates(
        ["city_key", "state_id"], keep="first"
    )
    return df


def load_vt_towns() -> pd.DataFrame:
    df = pd.read_csv(RAW / "towns_coordinates_VT.csv")
    df["town_key"] = df["town_name"].str.upper().str.strip()
    return df[["town_key", "lat_gen", "long_gen"]]


def load_ma_generators(cities: pd.DataFrame) -> pd.DataFrame:
    df = pd.read_csv(RAW / "food_generators_MA.csv")
    df = df[df["Status"] == "M"].copy()
    df = df.dropna(subset=["tons", "Lat", "Long", "Type"])
    df = df[df["tons"] > 0]
    df["category"] = df["Type"].map(MA_TYPE_MAP).fillna("Other")
    df["state_id"] = "MA"
    df["tons_per_year"] = df["tons"].astype(float)
    df["lat"] = df["Lat"].astype(float)
    df["lon"] = df["Long"].apply(lambda x: -abs(float(x)))
    df["city_key"] = df["Town_City"].str.upper().str.strip()
    df = df.merge(
        cities[["city_key", "state_id", "population"]],
        on=["city_key", "state_id"],
        how="left",
    )
    df["town"] = df["Town_City"]
    df["name"] = df["Name"].fillna("Redacted Generator")
    df["source"] = "MA"
    df["id"] = "MA-" + df["DEP_Code"].astype(str)
    return df[
        [
            "id",
            "name",
            "state_id",
            "town",
            "category",
            "tons_per_year",
            "lat",
            "lon",
            "population",
            "source",
        ]
    ]


def _vt_category(row: pd.Series) -> str:
    t2 = str(row.get("TYPE2") or "").strip()
    if t2 in VT_TYPE2_MAP:
        return VT_TYPE2_MAP[t2]
    t1 = str(row.get("TYPE1") or "").strip()
    return VT_TYPE1_MAP.get(t1, "Other")


def load_vt_generators(cities: pd.DataFrame, towns: pd.DataFrame) -> pd.DataFrame:
    df = pd.read_csv(RAW / "food_generators_VT.csv")
    df = df[df["Active"].astype(str) == "1"].copy()
    df = df.dropna(subset=["TonsPerWeek", "Town"])
    df = df[df["TonsPerWeek"] > 0]
    df["category"] = df.apply(_vt_category, axis=1)
    df["state_id"] = "VT"
    df["tons_per_year"] = df["TonsPerWeek"].astype(float) * 52.0
    df["town_key"] = df["Town"].str.upper().str.strip()
    df = df.merge(towns, on="town_key", how="left")
    df["lat"] = df["lat_gen"].astype(float)
    df["lon"] = df["long_gen"].astype(float)
    df = df.merge(
        cities[cities["state_id"] == "VT"][["city_key", "population"]].rename(
            columns={"city_key": "town_key"}
        ),
        on="town_key",
        how="left",
    )
    df["town"] = df["Town"].str.title()
    df["name"] = df["FSGName"].fillna("Redacted Generator")
    df["source"] = "VT"
    df["id"] = "VT-" + df["ID"].astype(str)
    df = df.dropna(subset=["lat", "lon"])
    return df[
        [
            "id",
            "name",
            "state_id",
            "town",
            "category",
            "tons_per_year",
            "lat",
            "lon",
            "population",
            "source",
        ]
    ]


def load_processors() -> pd.DataFrame:
    ma = pd.read_csv(RAW / "food_processors_list_MA.csv")
    ma = ma.rename(
        columns={
            "Company": "name",
            "Category": "processor_type",
            "Cit": "town",
            "long": "lon",
        }
    )
    ma["state_id"] = "MA"
    ma["id"] = "MA-P-" + ma["Number"].astype(str)
    ma_out = ma[["id", "name", "processor_type", "town", "state_id", "lat", "lon"]]

    vt = pd.read_csv(RAW / "food_processors_list_VT.csv")
    vt = vt[vt["FOOD SCRAPS"].astype(str).str.upper() == "YES"].copy()
    vt["processor_type"] = vt["TYPE"].fillna("Composter")
    vt = vt.rename(
        columns={
            "NAME": "name",
            "TOWN": "town",
            "Latitude": "lat",
            "Longitude": "lon",
        }
    )
    vt["state_id"] = "VT"
    vt["id"] = "VT-P-" + vt["SWID"].astype(str)
    vt_out = vt[["id", "name", "processor_type", "town", "state_id", "lat", "lon"]]

    out = pd.concat([ma_out, vt_out], ignore_index=True)
    out = out.dropna(subset=["lat", "lon"])
    out["name"] = out["name"].fillna("Redacted Processor")
    out["town"] = out["town"].fillna("").astype(str).str.title()
    return out


# ---------------------------------------------------------------------------
# Feature engineering
# ---------------------------------------------------------------------------

def haversine_km(lat1, lon1, lat2, lon2) -> np.ndarray:
    r = 6371.0
    lat1r = np.radians(lat1)
    lat2r = np.radians(lat2)
    dlat = lat2r - lat1r
    dlon = np.radians(lon2 - lon1)
    a = np.sin(dlat / 2) ** 2 + np.cos(lat1r) * np.cos(lat2r) * np.sin(dlon / 2) ** 2
    return 2 * r * np.arcsin(np.sqrt(a))


def nearest_processor(gen: pd.DataFrame, proc: pd.DataFrame) -> pd.DataFrame:
    """For each generator, find the nearest processor and its identity."""
    gen_lat = gen["lat"].to_numpy()
    gen_lon = gen["lon"].to_numpy()
    proc_lat = proc["lat"].to_numpy()
    proc_lon = proc["lon"].to_numpy()
    block = 1000
    near_idx = np.zeros(len(gen), dtype=int)
    near_km = np.zeros(len(gen))
    for start in range(0, len(gen), block):
        stop = min(start + block, len(gen))
        la = gen_lat[start:stop][:, None]
        lo = gen_lon[start:stop][:, None]
        d = haversine_km(la, lo, proc_lat[None, :], proc_lon[None, :])
        idx = d.argmin(axis=1)
        near_idx[start:stop] = idx
        near_km[start:stop] = d[np.arange(stop - start), idx]
    gen = gen.copy()
    gen["nearest_processor_id"] = proc["id"].to_numpy()[near_idx]
    gen["nearest_processor_name"] = proc["name"].to_numpy()[near_idx]
    gen["nearest_processor_type"] = proc["processor_type"].to_numpy()[near_idx]
    gen["nearest_processor_km"] = near_km
    return gen


# ---------------------------------------------------------------------------
# Model
# ---------------------------------------------------------------------------

class TonnageMLP(nn.Module):
    def __init__(self, n_cat: int, n_state: int, n_num: int, hidden: int = 128):
        super().__init__()
        self.cat_emb = nn.Embedding(n_cat, 12)
        self.state_emb = nn.Embedding(n_state, 4)
        self.net = nn.Sequential(
            nn.Linear(12 + 4 + n_num, hidden),
            nn.ReLU(),
            nn.Dropout(0.15),
            nn.Linear(hidden, hidden),
            nn.ReLU(),
            nn.Dropout(0.15),
            nn.Linear(hidden, hidden // 2),
            nn.ReLU(),
            nn.Linear(hidden // 2, 1),
        )

    def forward(self, cat_idx, state_idx, num):
        x = torch.cat([self.cat_emb(cat_idx), self.state_emb(state_idx), num], dim=1)
        return self.net(x).squeeze(-1)


# ---------------------------------------------------------------------------
# Training
# ---------------------------------------------------------------------------

@dataclass
class TrainConfig:
    epochs: int = 300
    batch_size: int = 128
    lr: float = 2e-3
    weight_decay: float = 1e-5


def build_features(gens: pd.DataFrame):
    cat_to_idx = {c: i for i, c in enumerate(CATEGORIES)}
    states = sorted(gens["state_id"].unique().tolist())
    state_to_idx = {s: i for i, s in enumerate(states)}
    gens = gens.copy()

    cap = float(np.quantile(gens["tons_per_year"], 0.995))
    gens["tons_per_year_train"] = gens["tons_per_year"].clip(upper=cap)

    gens["population"] = gens["population"].fillna(gens["population"].median())
    gens["cat_idx"] = gens["category"].map(cat_to_idx).fillna(cat_to_idx["Other"]).astype(int)
    gens["state_idx"] = gens["state_id"].map(state_to_idx).astype(int)

    num_cols = ["population", "lat", "lon", "nearest_processor_km"]
    X_num_raw = gens[num_cols].to_numpy(dtype=np.float32)
    X_num_raw[:, 0] = np.log1p(X_num_raw[:, 0])
    X_num_raw[:, 3] = np.log1p(X_num_raw[:, 3])
    scaler = StandardScaler()
    X_num = scaler.fit_transform(X_num_raw).astype(np.float32)

    y = np.log1p(gens["tons_per_year_train"].to_numpy(dtype=np.float32))
    return gens, cat_to_idx, state_to_idx, num_cols, scaler, X_num, y, cap


def train_model(gens: pd.DataFrame):
    gens, cat_to_idx, state_to_idx, num_cols, scaler, X_num, y, cap = build_features(gens)
    cat = gens["cat_idx"].to_numpy()
    st = gens["state_idx"].to_numpy()

    idx = np.arange(len(gens))
    train_idx, val_idx = train_test_split(idx, test_size=0.2, random_state=SEED)

    device = torch.device("cpu")
    cfg = TrainConfig()
    model = TonnageMLP(len(cat_to_idx), len(state_to_idx), X_num.shape[1]).to(device)
    opt = torch.optim.Adam(model.parameters(), lr=cfg.lr, weight_decay=cfg.weight_decay)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=cfg.epochs)
    loss_fn = nn.SmoothL1Loss()

    def make_tensors(sel):
        return (
            torch.tensor(cat[sel], dtype=torch.long, device=device),
            torch.tensor(st[sel], dtype=torch.long, device=device),
            torch.tensor(X_num[sel], dtype=torch.float32, device=device),
            torch.tensor(y[sel], dtype=torch.float32, device=device),
        )

    tr = make_tensors(train_idx)
    va = make_tensors(val_idx)

    best_val = math.inf
    history = []
    for epoch in range(cfg.epochs):
        model.train()
        perm = torch.randperm(len(train_idx))
        total = 0.0
        for i in range(0, len(perm), cfg.batch_size):
            b = perm[i : i + cfg.batch_size]
            pred = model(tr[0][b], tr[1][b], tr[2][b])
            loss = loss_fn(pred, tr[3][b])
            opt.zero_grad()
            loss.backward()
            opt.step()
            total += loss.item() * len(b)
        tr_loss = total / len(train_idx)
        scheduler.step()

        model.eval()
        with torch.no_grad():
            vp = model(va[0], va[1], va[2])
            val_loss = loss_fn(vp, va[3]).item()
            val_mae_log = (vp - va[3]).abs().mean().item()
            y_true_log = va[3].cpu().numpy()
            y_pred_log = vp.cpu().numpy()
            y_true = np.expm1(y_true_log)
            y_pred = np.clip(np.expm1(y_pred_log), 0, None)
            mae_tons = float(np.mean(np.abs(y_true - y_pred)))
            mape = float(
                np.mean(np.abs((y_true - y_pred) / np.clip(y_true, 1e-3, None)))
            )
            ss_res = float(np.sum((y_true_log - y_pred_log) ** 2))
            ss_tot = float(np.sum((y_true_log - y_true_log.mean()) ** 2))
            r2_log = 1 - ss_res / ss_tot if ss_tot > 0 else float("nan")
            ss_res_raw = float(np.sum((y_true - y_pred) ** 2))
            ss_tot_raw = float(np.sum((y_true - y_true.mean()) ** 2))
            r2 = 1 - ss_res_raw / ss_tot_raw if ss_tot_raw > 0 else float("nan")

        history.append(
            {
                "epoch": epoch + 1,
                "train_loss": tr_loss,
                "val_loss": val_loss,
                "val_mae_log": val_mae_log,
                "val_mae_tons": mae_tons,
                "val_mape": mape,
                "val_r2": r2,
                "val_r2_log": r2_log,
            }
        )
        if val_loss < best_val:
            best_val = val_loss

    model.eval()
    with torch.no_grad():
        all_cat = torch.tensor(cat, dtype=torch.long)
        all_st = torch.tensor(st, dtype=torch.long)
        all_num = torch.tensor(X_num, dtype=torch.float32)
        preds_log = model(all_cat, all_st, all_num).cpu().numpy()
    gens["predicted_tons_per_year"] = np.clip(np.expm1(preds_log), 0, None)
    gens["residual_tons"] = gens["tons_per_year"] - gens["predicted_tons_per_year"]

    metrics = {
        "rows": int(len(gens)),
        "train_rows": int(len(train_idx)),
        "val_rows": int(len(val_idx)),
        "target_cap_tons_per_year": float(cap),
        "final_val_mae_tons": history[-1]["val_mae_tons"],
        "final_val_mape": history[-1]["val_mape"],
        "final_val_r2": history[-1]["val_r2"],
        "final_val_r2_log": history[-1]["val_r2_log"],
        "best_val_loss": best_val,
        "history": history[-60:],
        "categories": list(cat_to_idx.keys()),
        "states": list(state_to_idx.keys()),
        "feature_columns": num_cols,
    }

    torch.save(
        {
            "model_state_dict": model.state_dict(),
            "cat_to_idx": cat_to_idx,
            "state_to_idx": state_to_idx,
            "num_cols": num_cols,
            "scaler_mean": scaler.mean_.tolist(),
            "scaler_scale": scaler.scale_.tolist(),
        },
        MODELS / "unspoiled.pt",
    )

    return gens, metrics


# ---------------------------------------------------------------------------
# Compliance labels (strictly from bans_thresholds.csv and composting_effect.csv)
# ---------------------------------------------------------------------------

def latest_bans() -> pd.DataFrame:
    df = pd.read_csv(RAW / "bans_thresholds.csv")
    df = df.sort_values(["state_id", "year"]).groupby("state_id").tail(1)
    return df.reset_index(drop=True)


def latest_effects() -> pd.DataFrame:
    comp = pd.read_csv(RAW / "composting_effect.csv")
    disp = pd.read_csv(RAW / "disposal_effect_size2.csv")
    comp = comp.sort_values(["state_id", "year"]).groupby("state_id").tail(1)
    disp = disp.sort_values(["state_id", "year"]).groupby("state_id").tail(1)
    merged = comp[["state_id", "composting_effect"]].merge(
        disp[["state_id", "effect_size"]].rename(columns={"effect_size": "disposal_effect"}),
        on="state_id",
        how="outer",
    )
    return merged


def parse_enforcement(ma_generators: pd.DataFrame) -> dict:
    """Parse wb_enforcements.csv.

    The dataset redacts SiteName, Municipality, and DocumentNumber on every
    row, so per-business linkage is impossible without fabrication. What IS
    available: the Comment field frequently names a MassDEP-listed town
    (e.g. 'OBS ... AT LYNN TS', 'WATERTOWN MA'), the IssuedDate, the
    EnforcementTypeDescription, the ProgramCategory, and the
    PenaltyCashAssessed.

    This function extracts everything honest:

      - Per-town enforcement counts and summed penalties, using only the
        MA towns that also appear in the MA generator roster (so we never
        match stray words that happen to share a town name).
      - Per-year aggregates.
      - Per-type and per-program-category aggregates.
      - A redaction-safe per-record payload (year, type, program, penalty,
        comment, mentionedTowns).

    Returns a dict ready to serialize to JSON.
    """

    rows = list(csv.DictReader(open(RAW / "wb_enforcements.csv")))

    # Build a gazetteer from the MA generator roster. Only towns that
    # actually have generators are candidates -- keeps false positives low.
    ma_towns = sorted(
        {
            str(t).strip()
            for t in ma_generators["town"].dropna().unique().tolist()
            if str(t).strip()
        }
    )
    # Pre-compile a single alternation regex on word boundaries.
    alt = "|".join(re.escape(t.upper()) for t in ma_towns)
    town_re = re.compile(r"\b(" + alt + r")\b") if alt else None

    def parse_year(date_str: str) -> int | None:
        if not date_str:
            return None
        for fmt in ("%m/%d/%y", "%m/%d/%Y", "%Y-%m-%d"):
            try:
                return datetime.strptime(date_str.strip(), fmt).year
            except ValueError:
                continue
        return None

    def parse_penalty(raw: str) -> float:
        if raw in (None, "", "redacted"):
            return 0.0
        try:
            return float(raw)
        except ValueError:
            return 0.0

    by_town_count: Counter[str] = Counter()
    by_town_penalty: defaultdict[str, float] = defaultdict(float)
    by_town_with_penalty: Counter[str] = Counter()
    by_year: Counter[int] = Counter()
    by_type: Counter[str] = Counter()
    by_program: Counter[str] = Counter()
    records: list[dict] = []

    total_penalty = 0.0
    years_seen: list[int] = []

    for r in rows:
        comment = (r.get("Comment") or "").strip()
        comment_up = comment.upper()
        mentioned = sorted(
            {
                t
                for t in (town_re.findall(comment_up) if town_re else [])
            }
        ) if town_re else []
        # Preserve the cased original town name so the UI reads naturally.
        case_lookup = {t.upper(): t for t in ma_towns}
        mentioned_cased = [case_lookup[m] for m in mentioned]

        year = parse_year(r.get("IssuedDate") or "")
        penalty = parse_penalty(r.get("PenaltyCashAssessed") or "")
        etype = (r.get("EnforcementTypeDescription") or "").strip() or "Unknown"
        prog = (r.get("ProgramCategory") or "").strip() or "Unknown"

        for town in mentioned_cased:
            by_town_count[town] += 1
            by_town_penalty[town] += penalty
            if penalty > 0:
                by_town_with_penalty[town] += 1
        if year is not None:
            by_year[year] += 1
            years_seen.append(year)
        by_type[etype] += 1
        by_program[prog] += 1
        total_penalty += penalty

        records.append(
            {
                "year": year,
                "enforcementType": etype,
                "programCategory": prog,
                "penaltyUsd": penalty,
                "comment": comment,
                "mentionedTowns": mentioned_cased,
            }
        )

    by_town = sorted(
        [
            {
                "town": t,
                "actions": int(c),
                "actionsWithPenalty": int(by_town_with_penalty.get(t, 0)),
                "penaltyUsd": round(by_town_penalty.get(t, 0.0), 2),
            }
            for t, c in by_town_count.items()
        ],
        key=lambda d: d["actions"],
        reverse=True,
    )

    return {
        "totalActions": len(rows),
        "totalPenaltyUsd": round(total_penalty, 2),
        "actionsWithPenalty": sum(1 for r in records if r["penaltyUsd"] > 0),
        "yearsCovered": [min(years_seen), max(years_seen)] if years_seen else None,
        "townsGazetteerSize": len(ma_towns),
        "townsMentioned": len(by_town),
        "byYear": [
            {"year": y, "actions": int(c)} for y, c in sorted(by_year.items())
        ],
        "byType": [
            {"type": t, "actions": int(c)} for t, c in by_type.most_common()
        ],
        "byProgram": [
            {"program": p, "actions": int(c)} for p, c in by_program.most_common()
        ],
        "byTown": by_town,
        "records": records,
    }


def compliance_layer(gens: pd.DataFrame) -> pd.DataFrame:
    bans = latest_bans()
    eff = latest_effects()
    gens = gens.merge(bans, on="state_id", how="left")
    gens = gens.merge(eff, on="state_id", how="left")

    gens["ban_threshold_tons_per_year"] = gens["threshold"].astype(float)
    gens["ban_distance_miles"] = gens["distance_threshold"].astype(float)
    gens["nearest_processor_miles"] = gens["nearest_processor_km"] * 0.621371
    gens["covered_by_ban"] = (
        (gens["tons_per_year"] >= gens["ban_threshold_tons_per_year"])
        & (gens["nearest_processor_miles"] <= gens["ban_distance_miles"])
    ).fillna(False)

    # Data-grounded label: purely function of the dataset's threshold.
    def label(row):
        thr = row["ban_threshold_tons_per_year"]
        if thr is None or pd.isna(thr):
            return "below"
        if row["covered_by_ban"]:
            return "above"
        if row["tons_per_year"] >= 0.5 * thr:
            return "near"
        return "below"

    gens["threshold_status"] = gens.apply(label, axis=1)

    # Diverted tons = tons * composting_effect. Both sides come from the Dryad
    # dataset. If a state has no effect size recorded in the study, we report
    # null rather than inventing a fallback.
    gens["diverted_tons_per_year"] = (
        gens["tons_per_year"] * gens["composting_effect"]
    )

    return gens


def attach_town_enforcement(
    gens: pd.DataFrame, enforcement: dict
) -> pd.DataFrame:
    """Attach per-town enforcement aggregates to every generator.

    This is strictly a town-level signal. The enforcement dataset redacts
    SiteName and Municipality, so we cannot claim any individual business
    received a notice. We simply surface the count of enforcement actions
    that mentioned the generator's town in their Comment field.
    """
    by_town = {t["town"]: t for t in enforcement["byTown"]}
    gens = gens.copy()
    gens["town_enforcement_actions"] = gens["town"].map(
        lambda t: int(by_town.get(str(t), {}).get("actions", 0))
    )
    gens["town_enforcement_penalty_usd"] = gens["town"].map(
        lambda t: float(by_town.get(str(t), {}).get("penaltyUsd", 0.0))
    )
    gens["town_enforcement_with_penalty"] = gens["town"].map(
        lambda t: int(by_town.get(str(t), {}).get("actionsWithPenalty", 0))
    )
    # Only MA generators get a non-zero value — VT has no enforcement log in
    # this dataset. Force VT to 0 explicitly so the UI is never ambiguous.
    vt_mask = gens["state_id"] != "MA"
    gens.loc[vt_mask, "town_enforcement_actions"] = 0
    gens.loc[vt_mask, "town_enforcement_penalty_usd"] = 0.0
    gens.loc[vt_mask, "town_enforcement_with_penalty"] = 0
    return gens


# ---------------------------------------------------------------------------
# Evidence exports (honest, dataset-only)
# ---------------------------------------------------------------------------

def export_evidence(gens: pd.DataFrame) -> dict:
    # Per-state effect sizes (joined on year = max year per state).
    eff = latest_effects().to_dict(orient="records")
    eff_clean = [
        {
            "stateId": r["state_id"],
            "compostingEffect": None if pd.isna(r.get("composting_effect")) else float(r["composting_effect"]),
            "disposalEffect": None if pd.isna(r.get("disposal_effect")) else float(r["disposal_effect"]),
        }
        for r in eff
    ]

    # Per-state tonnage totals that we actually have in this dataset.
    by_state = (
        gens.groupby("state_id")
        .agg(
            generators=("id", "count"),
            tons_per_year=("tons_per_year", "sum"),
            predicted_tons=("predicted_tons_per_year", "sum"),
            diverted_tons=("diverted_tons_per_year", "sum"),
        )
        .reset_index()
    )
    state_tonnage = [
        {
            "stateId": r["state_id"],
            "generators": int(r["generators"]),
            "tonsPerYear": float(r["tons_per_year"]),
            "predictedTonsPerYear": float(r["predicted_tons"]),
            "divertedTonsPerYear": (
                None
                if pd.isna(r["diverted_tons"])
                else float(r["diverted_tons"])
            ),
        }
        for _, r in by_state.iterrows()
    ]

    # MA enforcement count — every row in wb_enforcements.csv.
    enforcement_rows = 0
    with open(RAW / "wb_enforcements.csv") as f:
        next(f)
        enforcement_rows = sum(1 for _ in f)

    # Boulder year-by-year landfill vs organics. Aggregate across sectors per
    # year so it matches the city's total waste ledger.
    boulder = []
    with open(RAW / "boulder_waste.csv") as f:
        reader = csv.DictReader(f)
        by_year: dict[str, dict[str, float]] = {}
        for row in reader:
            y = row["Year"]
            a = by_year.setdefault(y, {"Landfill": 0.0, "Organics": 0.0, "Recycle": 0.0})
            for key in ("Landfill", "Organics", "Recycle"):
                try:
                    a[key] += float(row.get(key, "0") or 0)
                except ValueError:
                    pass
        for y in sorted(by_year.keys()):
            a = by_year[y]
            total = a["Landfill"] + a["Organics"] + a["Recycle"]
            boulder.append(
                {
                    "year": int(y),
                    "landfillTons": round(a["Landfill"], 1),
                    "organicsTons": round(a["Organics"], 1),
                    "recycleTons": round(a["Recycle"], 1),
                    "diversionRate": (
                        round((a["Organics"] + a["Recycle"]) / total, 4)
                        if total > 0
                        else None
                    ),
                }
            )

    # Seattle monthly composting. Roll to annual totals by sector.
    seattle: dict[int, dict[str, float]] = {}
    with open(RAW / "seattle_composting.csv") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                y = int(row["year"])
            except ValueError:
                continue
            a = seattle.setdefault(
                y, {"residential": 0.0, "commercial": 0.0, "self_haul": 0.0}
            )
            for k in ("residential", "commercial", "self_haul"):
                try:
                    a[k] += float(row.get(k, "0") or 0)
                except ValueError:
                    pass
    seattle_annual = [
        {
            "year": y,
            "residentialTons": round(seattle[y]["residential"], 1),
            "commercialTons": round(seattle[y]["commercial"], 1),
            "selfHaulTons": round(seattle[y]["self_haul"], 1),
        }
        for y in sorted(seattle.keys())
    ]

    # Per-state ban thresholds history (every row in bans_thresholds.csv).
    ban_hist: list[dict] = []
    with open(RAW / "bans_thresholds.csv") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                ban_hist.append(
                    {
                        "stateId": row["state_id"],
                        "year": int(row["year"]),
                        "phase": int(row["phase"]),
                        "material": row["material"],
                        "thresholdTonsPerYear": float(row["threshold"]),
                        "distanceThresholdMiles": float(row["distance_threshold"]),
                    }
                )
            except (ValueError, KeyError):
                continue

    # Generator counts by category (honest -- just rows in our merged frame).
    cat_counter = Counter(gens["category"].tolist())
    categories = [
        {"category": c, "generators": int(n)}
        for c, n in cat_counter.most_common()
    ]

    return {
        "maEnforcementActions": enforcement_rows,
        "stateEffects": eff_clean,
        "stateTonnage": state_tonnage,
        "boulderHistory": boulder,
        "seattleCompostingAnnual": seattle_annual,
        "banHistory": ban_hist,
        "categoryCounts": categories,
    }


# ---------------------------------------------------------------------------
# JSON export
# ---------------------------------------------------------------------------

def safe_float(x):
    try:
        if x is None or (isinstance(x, float) and math.isnan(x)):
            return None
        return float(x)
    except Exception:
        return None


def export_json(
    gens: pd.DataFrame,
    procs: pd.DataFrame,
    metrics: dict,
    evidence: dict,
    enforcement: dict,
) -> None:
    procs_json = [
        {
            "id": str(r.id),
            "name": str(r.name),
            "processorType": (
                str(r.processor_type) if pd.notna(r.processor_type) else "Composter"
            ),
            "town": str(r.town) if pd.notna(r.town) else "",
            "stateId": str(r.state_id),
            "lat": safe_float(r.lat),
            "lon": safe_float(r.lon),
        }
        for r in procs.itertuples(index=False)
    ]

    gens_json = []
    for r in gens.itertuples(index=False):
        gens_json.append(
            {
                "id": str(r.id),
                "name": str(r.name) if pd.notna(r.name) else "Redacted Generator",
                "stateId": str(r.state_id),
                "town": str(r.town) if pd.notna(r.town) else "",
                "category": str(r.category),
                "tonsPerYear": safe_float(r.tons_per_year),
                "predictedTonsPerYear": safe_float(r.predicted_tons_per_year),
                "residualTons": safe_float(r.residual_tons),
                "lat": safe_float(r.lat),
                "lon": safe_float(r.lon),
                "population": safe_float(r.population),
                "nearestProcessorId": str(r.nearest_processor_id),
                "nearestProcessorName": str(r.nearest_processor_name),
                "nearestProcessorType": str(r.nearest_processor_type),
                "nearestProcessorKm": safe_float(r.nearest_processor_km),
                "nearestProcessorMiles": safe_float(r.nearest_processor_miles),
                "banThresholdTonsPerYear": safe_float(r.ban_threshold_tons_per_year),
                "banDistanceMiles": safe_float(r.ban_distance_miles),
                "coveredByBan": bool(r.covered_by_ban),
                "thresholdStatus": str(r.threshold_status),
                "compostingEffect": safe_float(r.composting_effect),
                "disposalEffect": safe_float(r.disposal_effect),
                "divertedTonsPerYear": safe_float(r.diverted_tons_per_year),
                "townEnforcementActions": int(r.town_enforcement_actions),
                "townEnforcementPenaltyUsd": float(
                    r.town_enforcement_penalty_usd
                ),
                "townEnforcementWithPenalty": int(
                    r.town_enforcement_with_penalty
                ),
                "source": str(r.source),
            }
        )

    bans = latest_bans()
    bans_json = [
        {
            "stateId": r.state_id,
            "year": int(r.year),
            "phase": int(r.phase),
            "material": r.material,
            "thresholdTonsPerYear": safe_float(r.threshold),
            "distanceThresholdMiles": safe_float(r.distance_threshold),
        }
        for r in bans.itertuples(index=False)
    ]

    (OUT_DATA / "generators.json").write_text(json.dumps(gens_json))
    (OUT_DATA / "processors.json").write_text(json.dumps(procs_json))
    (OUT_DATA / "bans.json").write_text(json.dumps(bans_json, indent=2))
    (OUT_DATA / "model_metrics.json").write_text(json.dumps(metrics, indent=2))
    (OUT_DATA / "evidence.json").write_text(json.dumps(evidence, indent=2))
    (OUT_DATA / "enforcement.json").write_text(json.dumps(enforcement))
    print(
        f"Exported {len(gens_json)} generators, {len(procs_json)} processors, "
        f"{len(bans_json)} ban states, "
        f"{enforcement['totalActions']} enforcement rows "
        f"({enforcement['townsMentioned']} towns mentioned, "
        f"${enforcement['totalPenaltyUsd']:.0f} total penalty), "
        f"{len(evidence['boulderHistory'])} Boulder years, "
        f"{len(evidence['seattleCompostingAnnual'])} Seattle years -> {OUT_DATA}"
    )


def main():
    cities = load_cities()
    towns = load_vt_towns()
    procs = load_processors()

    ma = load_ma_generators(cities)
    vt = load_vt_generators(cities, towns)
    gens = pd.concat([ma, vt], ignore_index=True)
    print(f"Loaded generators: MA={len(ma)} VT={len(vt)} total={len(gens)}")

    gens = nearest_processor(gens, procs)
    gens = gens.dropna(subset=["lat", "lon", "tons_per_year"])
    gens = gens[gens["tons_per_year"] > 0]

    gens, metrics = train_model(gens)
    gens = compliance_layer(gens)
    print(
        "Val MAE tons:",
        round(metrics["final_val_mae_tons"], 2),
        "R2(raw):",
        round(metrics["final_val_r2"], 3),
        "R2(log):",
        round(metrics["final_val_r2_log"], 3),
    )

    enforcement = parse_enforcement(gens[gens["state_id"] == "MA"])
    gens = attach_town_enforcement(gens, enforcement)
    evidence = export_evidence(gens)
    export_json(gens, procs, metrics, evidence, enforcement)


if __name__ == "__main__":
    main()
