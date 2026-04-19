"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

import { processorTitle } from "@/lib/display";
import type { Processor } from "@/lib/types";
import type { GeneratorPoint } from "@/lib/harvest-data";

// Leaflet colors tuned to match the Unspoiled palette.
const STATUS_COLOR: Record<GeneratorPoint["thresholdStatus"], string> = {
  above: "#c93823", // un-tomato
  near: "#edbd5c", // un-gold-400
  below: "#7a9154", // un-sage-500
};

interface Props {
  points: GeneratorPoint[];
  processors: Processor[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/**
 * Full-map Leaflet view. Renders ~11k generator circle markers + ~180
 * processor diamond markers on a canvas layer for performance, plus a
 * haversine polyline between the currently-selected generator and its
 * nearest processor. No external API keys: tiles come from CartoDB Positron
 * (free, attribution shown).
 */
export function GeneratorsMap({
  points,
  processors,
  selectedId,
  onSelect,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const genLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const procLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const routeRef = useRef<import("leaflet").Polyline | null>(null);
  const highlightRef = useRef<import("leaflet").CircleMarker | null>(null);
  const markersIndexRef = useRef<Map<string, import("leaflet").CircleMarker>>(
    new Map(),
  );
  const processorsByIdRef = useRef<Map<string, Processor>>(new Map());
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);
  // Tracks the last (points reference, layerMode) we auto-fit for. Only refit
  // when one of those genuinely changes — never on selection, which must not
  // move the map.
  const fitSignatureRef = useRef<string | null>(null);

  const [ready, setReady] = useState(false);
  const [layerMode, setLayerMode] = useState<
    "all" | "above" | "near" | "enforcement"
  >("all");
  const [basemapStatus, setBasemapStatus] = useState<
    "ok" | "fallback" | "offline"
  >("ok");

  const maxEnforcement = useMemo(
    () =>
      points.reduce(
        (m, p) => Math.max(m, p.townEnforcementActions || 0),
        0,
      ),
    [points],
  );

  const processorsById = useMemo(
    () => new Map(processors.map((p) => [p.id, p])),
    [processors],
  );
  useEffect(() => {
    processorsByIdRef.current = processorsById;
  }, [processorsById]);

  // Mount the map once.
  useEffect(() => {
    let disposed = false;
    const markersIndex = markersIndexRef.current;

    (async () => {
      const L = await import("leaflet");
      if (disposed || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: [43.2, -72.0],
        zoom: 7,
        preferCanvas: true,
        worldCopyJump: false,
      });

      // Primary basemap. If it starts failing (bad wifi, blocked CDN, carto
      // rate limit) we'll add OSM as a fallback and surface a banner.
      const carto = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 18,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        },
      ).addTo(map);

      let cartoErrors = 0;
      let fallbackAdded = false;
      let osm: import("leaflet").TileLayer | null = null;
      carto.on("tileerror", () => {
        cartoErrors++;
        if (!fallbackAdded && cartoErrors >= 4) {
          fallbackAdded = true;
          osm = L.tileLayer(
            "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
              maxZoom: 19,
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            },
          );
          osm.addTo(map);
          if (!disposed) setBasemapStatus("fallback");

          let osmErrors = 0;
          osm.on("tileerror", () => {
            osmErrors++;
            if (osmErrors >= 6 && !disposed) setBasemapStatus("offline");
          });
          osm.on("tileload", () => {
            if (!disposed) setBasemapStatus("fallback");
          });
        }
      });
      carto.on("tileload", () => {
        if (!fallbackAdded && !disposed) setBasemapStatus("ok");
      });

      const genLayer = L.layerGroup().addTo(map);
      const procLayer = L.layerGroup().addTo(map);

      mapRef.current = map;
      genLayerRef.current = genLayer;
      procLayerRef.current = procLayer;
      setReady(true);
    })();

    return () => {
      disposed = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersIndex.clear();
    };
  }, []);

  // Render/refresh generator markers whenever data or filter mode changes.
  useEffect(() => {
    if (!ready) return;
    (async () => {
      const L = await import("leaflet");
      const layer = genLayerRef.current;
      if (!layer) return;
      layer.clearLayers();
      markersIndexRef.current.clear();

      const bounds: Array<[number, number]> = [];
      for (const g of points) {
        if (layerMode === "above" && g.thresholdStatus !== "above") continue;
        if (
          layerMode === "near" &&
          !(g.thresholdStatus === "above" || g.thresholdStatus === "near")
        )
          continue;
        if (layerMode === "enforcement" && g.stateId !== "MA") continue;

        let color: string;
        let radius: number;
        let fillOpacity: number;

        if (layerMode === "enforcement") {
          const n = g.townEnforcementActions || 0;
          const t = maxEnforcement > 0 ? n / maxEnforcement : 0;
          color =
            n === 0
              ? "#c9c4b4"
              : n >= 40
                ? "#c93823"
                : n >= 15
                  ? "#e8623d"
                  : n >= 5
                    ? "#edbd5c"
                    : "#7a9154";
          radius = 2.5 + t * 6;
          fillOpacity = 0.4 + t * 0.5;
        } else {
          color = STATUS_COLOR[g.thresholdStatus];
          radius = g.thresholdStatus === "above" ? 4.5 : 3;
          fillOpacity = g.thresholdStatus === "above" ? 0.85 : 0.6;
        }

        const marker = L.circleMarker([g.lat, g.lon], {
          radius,
          color,
          weight: 0.75,
          fillColor: color,
          fillOpacity,
        });
        marker.on("click", () => onSelectRef.current(g.id));
        marker.bindTooltip(
          `<div style="font:12px var(--font-body, sans-serif);">
            <b>${g.stateId} · ${g.id}</b><br/>
            ${g.category} · ${g.tonsPerYear.toFixed(1)} t/yr<br/>
            ${g.thresholdStatus} threshold${
              g.stateId === "MA"
                ? `<br/><span style="color:#c93823">${g.townEnforcementActions.toLocaleString()} enforcement action${g.townEnforcementActions === 1 ? "" : "s"} mention this town</span>`
                : ""
            }
          </div>`,
          { direction: "top", offset: [0, -4] },
        );
        marker.addTo(layer);
        markersIndexRef.current.set(g.id, marker);
        bounds.push([g.lat, g.lon]);
      }

      const sig = `${points.length}:${layerMode}`;
      if (
        bounds.length &&
        mapRef.current &&
        fitSignatureRef.current !== sig
      ) {
        mapRef.current.fitBounds(bounds as [number, number][], {
          padding: [32, 32],
          animate: false,
        });
        fitSignatureRef.current = sig;
      }
    })();
  }, [points, layerMode, ready, maxEnforcement]);

  // Render processors once (they don't change with filters).
  useEffect(() => {
    if (!ready) return;
    (async () => {
      const L = await import("leaflet");
      const layer = procLayerRef.current;
      if (!layer) return;
      layer.clearLayers();

      for (const p of processors) {
        const icon = L.divIcon({
          className: "",
          html: `<div style="width:14px;height:14px;background:#1f3018;transform:rotate(45deg);border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.25);"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        const procDisplay = processorTitle(p);
        const marker = L.marker([p.lat, p.lon], {
          icon,
          title: `${procDisplay} · ${p.town}, ${p.stateId}`,
          zIndexOffset: 200,
        });
        marker.bindTooltip(
          `<div style="font:12px var(--font-body, sans-serif);">
            <b>${procDisplay}</b><br/>
            <span style="font-family:var(--font-mono, monospace);color:#7a776d">${p.id}</span><br/>
            ${p.town}, ${p.stateId}
          </div>`,
          { direction: "top", offset: [0, -6] },
        );
        marker.addTo(layer);
      }
    })();
  }, [processors, ready]);

  // Draw a route line from the selected generator to its nearest processor.
  useEffect(() => {
    if (!ready) return;
    (async () => {
      const L = await import("leaflet");
      const map = mapRef.current;
      if (!map) return;

      if (routeRef.current) {
        routeRef.current.remove();
        routeRef.current = null;
      }
      if (highlightRef.current) {
        highlightRef.current.remove();
        highlightRef.current = null;
      }

      if (!selectedId) return;
      const gen = points.find((g) => g.id === selectedId);
      if (!gen) return;
      const proc = processorsByIdRef.current.get(gen.nearestProcessorId);
      if (!proc) return;

      routeRef.current = L.polyline(
        [
          [gen.lat, gen.lon],
          [proc.lat, proc.lon],
        ],
        {
          color: "#e8623d",
          weight: 2.5,
          dashArray: "6 4",
          opacity: 0.9,
        },
      ).addTo(map);

      highlightRef.current = L.circleMarker([gen.lat, gen.lon], {
        radius: 10,
        color: "#1f3018",
        weight: 2.5,
        fillColor: "#f3ead2",
        fillOpacity: 0.55,
      }).addTo(map);

      // Smart focus:
      //   - If both the generator and its nearest processor are already in
      //     view, don't move the map at all (avoids the jarring "zooms way
      //     in" or "zooms way out" problem).
      //   - Otherwise fit them with a reasonable pixel padding and a maxZoom
      //     cap so very-nearby pairs don't slam to street level.
      const genPt = L.latLng(gen.lat, gen.lon);
      const procPt = L.latLng(proc.lat, proc.lon);
      const viewBounds = map.getBounds();
      const alreadyVisible =
        viewBounds.contains(genPt) && viewBounds.contains(procPt);
      if (!alreadyVisible) {
        const bounds = L.latLngBounds(genPt, procPt);
        map.flyToBounds(bounds, {
          maxZoom: 11,
          padding: [80, 80],
          duration: 0.6,
        });
      }
    })();
  }, [selectedId, points, ready]);

  const above = points.filter((p) => p.thresholdStatus === "above").length;
  const near = points.filter((p) => p.thresholdStatus === "near").length;
  const below = points.filter((p) => p.thresholdStatus === "below").length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-un-line bg-white p-3">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-un-sage-700">
          Layer
          <div className="flex items-center gap-1 rounded-full border border-un-line bg-un-cream-50 p-0.5">
            <ModeButton
              active={layerMode === "all"}
              onClick={() => setLayerMode("all")}
            >
              All
            </ModeButton>
            <ModeButton
              active={layerMode === "near"}
              onClick={() => setLayerMode("near")}
            >
              At or near ban
            </ModeButton>
            <ModeButton
              active={layerMode === "above"}
              onClick={() => setLayerMode("above")}
            >
              Above only
            </ModeButton>
            <ModeButton
              active={layerMode === "enforcement"}
              onClick={() => setLayerMode("enforcement")}
            >
              Enforcement (MA)
            </ModeButton>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[12px] text-un-ink">
          {layerMode === "enforcement" ? (
            <>
              <LegendDot color="#c9c4b4" label="0 mentions" />
              <LegendDot color="#7a9154" label="1–4" />
              <LegendDot color="#edbd5c" label="5–14" />
              <LegendDot color="#e8623d" label="15–39" />
              <LegendDot color="#c93823" label={`40+ (max ${maxEnforcement})`} />
              <LegendDiamond label={`Processors (${processors.length})`} />
            </>
          ) : (
            <>
              <LegendDot color={STATUS_COLOR.above} label={`Above (${above.toLocaleString()})`} />
              <LegendDot color={STATUS_COLOR.near} label={`Near (${near.toLocaleString()})`} />
              <LegendDot color={STATUS_COLOR.below} label={`Below (${below.toLocaleString()})`} />
              <LegendDiamond label={`Processors (${processors.length.toLocaleString()})`} />
            </>
          )}
        </div>
      </div>

      <div className="relative">
        <div
          ref={containerRef}
          className="h-[640px] w-full overflow-hidden rounded-2xl border border-un-line"
          style={{
            backgroundColor: "#f5eedd",
            backgroundImage:
              "linear-gradient(rgba(31,48,24,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(31,48,24,0.06) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        {basemapStatus !== "ok" && (
          <div
            className={`pointer-events-auto absolute left-3 top-3 flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold shadow-sm ring-1 ${
              basemapStatus === "fallback"
                ? "bg-un-gold-200 text-un-forest ring-un-gold-400/60"
                : "bg-un-tomato/15 text-un-tomato ring-un-tomato/30"
            }`}
            style={{ zIndex: 1100 }}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                basemapStatus === "fallback" ? "bg-un-coral-500" : "bg-un-tomato"
              }`}
            />
            {basemapStatus === "fallback"
              ? "Primary tiles rate-limited — switched to OpenStreetMap"
              : "Basemap offline — showing markers only (check connection)"}
          </div>
        )}
      </div>

      <div className="text-[11px] text-un-ink-soft">
        Coordinates come from <span className="font-mono">food_generators_MA.csv</span>{" "}
        (Lat/Long), <span className="font-mono">food_generators_VT.csv</span> via{" "}
        <span className="font-mono">towns_coordinates_VT.csv</span>, and{" "}
        <span className="font-mono">food_processors_list_*</span>. Click a
        generator to highlight its nearest permitted processor.
      </div>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide transition ${
        active
          ? "bg-un-forest text-white"
          : "text-un-ink-soft hover:text-un-forest"
      }`}
    >
      {children}
    </button>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}

function LegendDiamond({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="h-2.5 w-2.5 border border-white"
        style={{
          background: "#1f3018",
          transform: "rotate(45deg)",
          boxShadow: "0 1px 2px rgba(0,0,0,.2)",
        }}
      />
      {label}
    </span>
  );
}
