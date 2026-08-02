import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Box, Typography, Chip, ThemeProvider, createTheme, CssBaseline,
  InputBase, Paper, IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon  from "@mui/icons-material/Close";
import {
  MapContainer, TileLayer, CircleMarker, Marker, Tooltip as LTooltip, Popup, useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

function makeTheme(isDark) {
  return createTheme({
    palette: {
      mode: isDark ? "dark" : "light",
      primary: { main: "#990000" },
      background: {
        default: isDark ? "#0d0f14" : "#f4f5f7",
        paper:   isDark ? "#141720" : "#ffffff",
      },
      text: {
        primary:   isDark ? "#f0f0f0" : "#1a1a2e",
        secondary: isDark ? "#8a8fa8" : "#5a6075",
      },
    },
    typography: {
      fontFamily: "'DM Sans', sans-serif",
      h6: { fontFamily: "'Syne', sans-serif", fontWeight: 700 },
    },
    shape: { borderRadius: 14 },
    components: { MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } } },
  });
}

const STATUS_COLORS = {
  Active: "#f44336",
  Idle: "#ff9800",
  New: "#1565c0",
  Canceled: "#9e9e9e",
  Plugged: "#7b1fa2",
  Unknown: "#9e9e9e",
  NotCalGEMJurisdiction: "#9e9e9e",
};
function statusColor(status) {
  return STATUS_COLORS[status] || "#9e9e9e";
}

// Cap DOM rows rendered in the right-panel list so huge counties (LA has 8k+ wells) don't freeze the tab.
const LIST_CAP = 300;

function featuresToWells(geojson) {
  return geojson.features
    .filter((f) => f.geometry?.type === "Point")
    .map((f) => {
      const p = f.properties;
      const [lng, lat] = f.geometry.coordinates;
      return {
        id: p.OBJECTID ?? p.API,
        api: p.API,
        name: p.WellDesignation || [p.LeaseName, p.WellNumber].filter(Boolean).join(" "),
        leaseName: p.LeaseName,
        wellNumber: p.WellNumber,
        status: p.WellStatus,
        type: p.WellTypeLabel || p.WellType,
        operator: p.OperatorName,
        field: p.FieldName,
        area: p.AreaName,
        county: p.CountyName,
        district: p.District,
        section: p.Section,
        township: p.Township,
        range: p.Range,
        baseMeridian: p.BaseMeridian,
        spudDate: p.SpudDate,
        directionallyDrilled: p.isDirectionallyDrilled,
        lat, lng,
      };
    });
}

const DESTINATION_ICON = new L.DivIcon({
  html: `<div style="width:22px;height:22px;background:#FFCC00;border:3px solid #990000;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px rgba(153,0,0,0.5);">
    <svg viewBox="0 0 24 24" width="12" height="12" fill="#990000">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
  </div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  className: "",
});

function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, 13, { duration: 1.0 });
  }, [target, map]);
  return null;
}

export default function OilWellsMap({ title, subtitle, accent, geojson, center, zoom, destination }) {
  const [isDark, setIsDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const theme = makeTheme(isDark);

  useEffect(() => {
    if (title) document.title = title;
  }, [title]);

  const wells = useMemo(() => featuresToWells(geojson), [geojson]);
  const statuses = useMemo(
    () => [...new Set(wells.map((w) => w.status).filter(Boolean))].sort(),
    [wells]
  );

  const [search, setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [selected, setSelected]   = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);

  const filteredWells = useMemo(() => {
    let list = wells;
    if (statusFilter) list = list.filter((w) => w.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (w) =>
          w.name?.toLowerCase().includes(q) ||
          w.operator?.toLowerCase().includes(q) ||
          w.field?.toLowerCase().includes(q) ||
          w.api?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [wells, search, statusFilter]);

  const handleSelect = useCallback((well) => {
    setSelected(well);
    setFlyTarget([well.lat, well.lng]);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        html,body,#root{margin:0;padding:0;height:100%;overflow:hidden;}
        .leaflet-container{background:#e8f0e8;}
        .leaflet-control-attribution{background:rgba(255,255,255,0.75)!important;color:#666!important;font-size:10px;}
        *{box-sizing:border-box;}
      `}</style>

      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", bgcolor: "background.default" }}>
        <Header isDark={isDark} onToggleDark={() => setIsDark((d) => !d)}>
          <Box sx={{ position: "relative", flex: "0 1 280px", mx: 2 }}>
            <Paper elevation={0} sx={{
              display: "flex", alignItems: "center", gap: 0.5, px: 1.2, py: 0.4,
              border: `1px solid ${search ? accent : (isDark ? "#2a2d3a" : "#d0d4e0")}`,
              borderRadius: 2,
              bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
              transition: "border-color .2s",
            }}>
              <SearchIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <InputBase
                placeholder="Search lease, operator, field, API…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Escape") setSearch(""); }}
                sx={{ flex: 1, fontSize: "0.82rem", color: "text.primary", "& input": { p: 0 } }}
              />
              {search && (
                <IconButton size="small" onClick={() => setSearch("")} sx={{ p: 0.2, color: "text.secondary" }}>
                  <CloseIcon sx={{ fontSize: 14 }} />
                </IconButton>
              )}
            </Paper>
          </Box>

          <Box sx={{ display: "flex", gap: 0.7, alignItems: "center", flex: 1, overflowX: "auto" }}>
            {["All", ...statuses].map((s) => {
              const val = s === "All" ? null : s;
              const active = statusFilter === val;
              return (
                <Chip
                  key={s}
                  label={s}
                  size="small"
                  onClick={() => setStatusFilter(active ? null : val)}
                  sx={{
                    bgcolor: active ? accent : "rgba(255,255,255,0.05)",
                    color: active ? "#fff" : "#888",
                    border: `1px solid ${active ? accent : "#2a2d3a"}`,
                    fontWeight: active ? 600 : 400,
                    fontSize: "0.75rem", cursor: "pointer", flexShrink: 0,
                    transition: "all .2s",
                    "&:hover": { bgcolor: accent, color: "#fff", borderColor: accent },
                    "& .MuiChip-label": { px: 1.2 },
                  }}
                />
              );
            })}
          </Box>
        </Header>

        <Box sx={{ flex: 1, display: "flex", flexDirection: { xs: "column", md: "row" }, overflow: "hidden" }}>
          {/* MAP */}
          <Box sx={{ flex: { xs: "none", md: 1 }, height: { xs: "45%", md: "auto" }, position: "relative", overflow: "hidden" }}>
            <MapContainer
              center={center}
              zoom={zoom}
              preferCanvas
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              {flyTarget && <FlyTo target={flyTarget} />}

              {destination && (
                <Marker position={[destination.lat, destination.lng]} icon={DESTINATION_ICON}>
                  <LTooltip direction="top" permanent={false}>
                    <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 700 }}>
                      ★ {destination.name}
                    </span>
                  </LTooltip>
                  <Popup>
                    <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13 }}>
                      <strong>{destination.name}</strong><br />{destination.address}
                    </div>
                  </Popup>
                </Marker>
              )}

              {filteredWells.map((w) => {
                const isActive = selected?.id === w.id;
                return (
                  <CircleMarker
                    key={w.id}
                    center={[w.lat, w.lng]}
                    radius={isActive ? 8 : 5}
                    pathOptions={{
                      color: "#fff",
                      weight: isActive ? 2 : 1,
                      fillColor: statusColor(w.status),
                      fillOpacity: 0.9,
                    }}
                    eventHandlers={{ click: () => handleSelect(w) }}
                  >
                    <LTooltip direction="top" offset={[0, -4]}>
                      <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, lineHeight: 1.5, maxWidth: 200 }}>
                        <strong style={{ fontSize: 13 }}>{w.name || "Unnamed well"}</strong><br />
                        {w.status && <>● {w.status}</>}
                        {w.operator && <><br />{w.operator}</>}
                      </div>
                    </LTooltip>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </Box>

          {/* RIGHT PANEL */}
          <Box sx={{
            width: { xs: "100%", md: 380 },
            height: { xs: "55%", md: "auto" },
            display: "flex", flexDirection: "column",
            bgcolor: "background.paper",
            borderLeft: { md: `1px solid ${isDark ? "#1e2130" : "#e8eaf0"}` },
            overflow: "hidden",
          }}>
            {selected && (
              <Box sx={{
                p: 2, borderBottom: `1px solid ${isDark ? "#1e2130" : "#e8eaf0"}`,
                flexShrink: 0,
              }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "text.primary", lineHeight: 1.3, flex: 1 }}>
                    {selected.name || "Unnamed well"}
                  </Typography>
                  <IconButton size="small" onClick={() => setSelected(null)} sx={{ color: "text.secondary", p: 0.3, ml: 1 }}>
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>

                <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap", mb: 1.5 }}>
                  {selected.status && (
                    <Box sx={{ px: 1, py: 0.2, borderRadius: 1, bgcolor: `${statusColor(selected.status)}22`, border: `1px solid ${statusColor(selected.status)}55`, fontSize: "0.72rem", color: statusColor(selected.status), fontWeight: 600 }}>
                      ● {selected.status}
                    </Box>
                  )}
                  {selected.type && (
                    <Box sx={{ px: 1, py: 0.2, borderRadius: 1, bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", border: `1px solid ${isDark ? "#2a2d3a" : "#d0d4e0"}`, fontSize: "0.72rem", color: "text.secondary" }}>
                      {selected.type}
                    </Box>
                  )}
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                  {[
                    ["Operator", selected.operator],
                    ["Field", selected.field],
                    ["Area", selected.area],
                    ["County", selected.county],
                    ["District", selected.district],
                    ["API", selected.api],
                    ["Section / Township / Range", [selected.section, selected.township, selected.range].filter(Boolean).join(" / ")],
                    ["Base Meridian", selected.baseMeridian],
                    ["Spud Date", selected.spudDate],
                    ["Directionally Drilled", selected.directionallyDrilled === "Y" ? "Yes" : selected.directionallyDrilled === "N" ? "No" : null],
                    ["Coordinates", `${selected.lat.toFixed(5)}, ${selected.lng.toFixed(5)}`],
                  ].filter(([, v]) => v).map(([label, value]) => (
                    <Box key={label} sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                      <Typography sx={{ fontSize: "0.72rem", color: "text.secondary" }}>{label}</Typography>
                      <Typography sx={{ fontSize: "0.72rem", color: "text.primary", fontWeight: 500, textAlign: "right" }}>{value}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            <Box sx={{ flex: 1, overflow: "auto" }}>
              <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${isDark ? "#1e2130" : "#e8eaf0"}`, flexShrink: 0 }}>
                <Typography sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
                  {filteredWells.length} well{filteredWells.length !== 1 ? "s" : ""}
                  {filteredWells.length > LIST_CAP && ` · showing first ${LIST_CAP} — refine your search to see more`}
                </Typography>
              </Box>
              {filteredWells.slice(0, LIST_CAP).map((w) => {
                const isActive = selected?.id === w.id;
                return (
                  <Box
                    key={w.id}
                    onClick={() => handleSelect(w)}
                    sx={{
                      px: 2, py: 1.2,
                      borderBottom: `1px solid ${isDark ? "#1a1d28" : "#f0f2f7"}`,
                      cursor: "pointer",
                      bgcolor: isActive
                        ? (isDark ? "rgba(153,0,0,0.12)" : "rgba(153,0,0,0.06)")
                        : "transparent",
                      borderLeft: isActive ? `3px solid ${accent}` : "3px solid transparent",
                      transition: "all .15s",
                      "&:hover": {
                        bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(153,0,0,0.04)",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "text.primary", lineHeight: 1.3, flex: 1, mr: 1 }}>
                        {w.name || "Unnamed well"}
                      </Typography>
                      {w.status && (
                        <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: statusColor(w.status), flexShrink: 0 }}>
                          ● {w.status}
                        </Typography>
                      )}
                    </Box>
                    {w.operator && (
                      <Typography sx={{ fontSize: "0.7rem", color: "text.secondary", mt: 0.4 }}>
                        {w.operator}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>

        <Footer
          rightContent={
            <Typography sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
              {subtitle} · {wells.length} total wells
            </Typography>
          }
        />
      </Box>
    </ThemeProvider>
  );
}
