import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Box, Typography, Chip, ThemeProvider, createTheme, CssBaseline,
  InputBase, Paper, IconButton, Tooltip,
} from "@mui/material";
import SearchIcon        from "@mui/icons-material/Search";
import CloseIcon         from "@mui/icons-material/Close";
import OpenInNewIcon     from "@mui/icons-material/OpenInNew";
import ThumbUpAltIcon         from "@mui/icons-material/ThumbUpAlt";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbDownAltIcon         from "@mui/icons-material/ThumbDownAlt";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
import { useVotes } from "./utils/votes.js";
import { downloadCSV } from "./utils/download.js";
import {
  MapContainer, TileLayer, Marker, Tooltip as LTooltip, Popup, useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import aptsRaw from "./data/apts.json";

// ── USC theme ─────────────────────────────────────────────────────────────────
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

// ── Olin Hall destination ─────────────────────────────────────────────────────
const OLIN = { lat: 34.0195, lng: -118.2879, name: "Olin Hall (USC)" };

// ── Marker colors by rating ───────────────────────────────────────────────────
function ratingColor(r) {
  if (r == null) return "#9e9e9e";
  if (r >= 4.5) return "#4caf50";
  if (r >= 4.0) return "#8bc34a";
  if (r >= 3.5) return "#ff9800";
  return "#f44336";
}

function makeAptIcon(color, selected = false) {
  const s = selected ? 36 : 28;
  const border = selected ? "3px solid #fff" : "2.5px solid #fff";
  const shadow = selected
    ? `0 0 12px ${color}aa, 0 2px 8px rgba(0,0,0,0.5)`
    : "0 2px 8px rgba(0,0,0,0.45)";
  return new L.DivIcon({
    html: `<div style="position:relative;width:${s}px;height:${s}px;background:${color};border:${border};border-radius:8px;display:flex;align-items:center;justify-content:center;box-shadow:${shadow};cursor:pointer;">
      <svg viewBox="0 0 24 24" width="${Math.round(s*0.62)}" height="${Math.round(s*0.62)}" fill="rgba(255,255,255,0.95)">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
      </svg>
    </div>`,
    iconSize: [s, s],
    iconAnchor: [s / 2, s / 2],
    className: "",
  });
}

const OLIN_ICON = new L.DivIcon({
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
    if (target) map.flyTo(target, 15, { duration: 1.0 });
  }, [target, map]);
  return null;
}

// ── Rating filter chips ───────────────────────────────────────────────────────
const RATING_CHIPS = [
  { label: "All",   min: null },
  { label: "4.5+",  min: 4.5  },
  { label: "4.0+",  min: 4.0  },
  { label: "3.5+",  min: 3.5  },
];

// ── Main component ────────────────────────────────────────────────────────────
export default function Apts() {
  const [isDark, setIsDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const theme = makeTheme(isDark);

  const [search, setSearch]         = useState("");
  const [ratingMin, setRatingMin]   = useState(null);
  const [selected, setSelected]     = useState(null); // apt object
  const [flyTarget, setFlyTarget]   = useState(null);
  const { votes, vote } = useVotes();

  const filteredApts = useMemo(() => {
    let apts = aptsRaw;
    if (ratingMin != null) apts = apts.filter((a) => a.rating != null && a.rating >= ratingMin);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      apts = apts.filter(
        (a) => a.name.toLowerCase().includes(q) || (a.exactAddress || a.address).toLowerCase().includes(q)
      );
    }
    return [...apts].sort((a, b) => {
      const da = a.distanceMiles ?? 999, db = b.distanceMiles ?? 999;
      return da - db;
    });
  }, [search, ratingMin]);

  const mapMarkers = useMemo(
    () => filteredApts.filter((a) => a.lat != null && a.lng != null),
    [filteredApts]
  );

  const handleSelectApt = useCallback((apt) => {
    setSelected(apt);
    if (apt.lat && apt.lng) setFlyTarget([apt.lat, apt.lng]);
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

        <Header isDark={isDark} onToggleDark={() => setIsDark((d) => !d)} onDownload={downloadCSV}>
          {/* Search */}
          <Box sx={{ position: "relative", flex: "0 1 280px", mx: 2 }}>
            <Paper elevation={0} sx={{
              display: "flex", alignItems: "center", gap: 0.5, px: 1.2, py: 0.4,
              border: `1px solid ${search ? "#990000" : (isDark ? "#2a2d3a" : "#d0d4e0")}`,
              borderRadius: 2,
              bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
              transition: "border-color .2s",
            }}>
              <SearchIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <InputBase
                placeholder="Search apartments…"
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

          {/* Rating chips */}
          <Box sx={{ display: "flex", gap: 0.7, alignItems: "center", flex: 1, overflowX: "auto" }}>
            {RATING_CHIPS.map((chip) => {
              const active = ratingMin === chip.min;
              return (
                <Chip
                  key={chip.label}
                  label={chip.label}
                  size="small"
                  onClick={() => setRatingMin(active ? null : chip.min)}
                  sx={{
                    bgcolor: active ? "#990000" : "rgba(255,255,255,0.05)",
                    color: active ? "#fff" : "#888",
                    border: `1px solid ${active ? "#990000" : "#2a2d3a"}`,
                    fontWeight: active ? 600 : 400,
                    fontSize: "0.75rem", cursor: "pointer", flexShrink: 0,
                    transition: "all .2s",
                    "&:hover": { bgcolor: "#990000", color: "#fff", borderColor: "#990000" },
                    "& .MuiChip-label": { px: 1.2 },
                  }}
                />
              );
            })}
          </Box>
        </Header>

        {/* Body: MAP | LIST PANEL */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: { xs: "column", md: "row" }, overflow: "hidden" }}>

          {/* MAP */}
          <Box sx={{ flex: { xs: "none", md: 1 }, height: { xs: "45%", md: "auto" }, position: "relative", overflow: "hidden" }}>
            <MapContainer
              center={[OLIN.lat, OLIN.lng]}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              {flyTarget && <FlyTo target={flyTarget} />}

              {/* Olin Hall star marker */}
              <Marker position={[OLIN.lat, OLIN.lng]} icon={OLIN_ICON}>
                <LTooltip direction="top" permanent={false}>
                  <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 700 }}>
                    ★ Olin Hall (Destination)
                  </span>
                </LTooltip>
                <Popup>
                  <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13 }}>
                    <strong>Olin Hall</strong><br />3650 McClintock Ave, USC
                  </div>
                </Popup>
              </Marker>

              {/* Apartment markers */}
              {mapMarkers.map((apt) => (
                <Marker
                  key={apt.name}
                  position={[apt.lat, apt.lng]}
                  icon={makeAptIcon(ratingColor(apt.rating), selected?.name === apt.name)}
                  eventHandlers={{ click: () => handleSelectApt(apt) }}
                >
                  <LTooltip direction="top" offset={[0, -6]}>
                    <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, lineHeight: 1.5, maxWidth: 200 }}>
                      <strong style={{ fontSize: 13 }}>{apt.name}</strong><br />
                      {apt.rating != null && <>⭐ {apt.rating.toFixed(1)}</>}
                      {apt.rent && apt.rent !== "N/A" && <><br />💰 {apt.rent}</>}
                      {apt.distanceMiles != null && <><br />📍 {apt.distanceMiles} mi · {apt.drivingTime}</>}
                    </div>
                  </LTooltip>
                </Marker>
              ))}
            </MapContainer>
          </Box>

          {/* RIGHT PANEL */}
          <Box sx={{
            width: { xs: "100%", md: 360 },
            height: { xs: "55%", md: "auto" },
            display: "flex", flexDirection: "column",
            bgcolor: "background.paper",
            borderLeft: { md: `1px solid ${isDark ? "#1e2130" : "#e8eaf0"}` },
            overflow: "hidden",
          }}>
            {/* Selected apt detail card */}
            {selected && (
              <Box sx={{
                p: 2, borderBottom: `1px solid ${isDark ? "#1e2130" : "#e8eaf0"}`,
                flexShrink: 0,
              }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "text.primary", lineHeight: 1.3, flex: 1 }}>
                    {selected.name}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, ml: 1 }}>
                    <Tooltip title="Interested">
                      <IconButton size="small" onClick={() => vote(selected.name, "up")} sx={{ p: 0.4, color: votes[selected.name] === "up" ? "#4caf50" : "text.disabled" }}>
                        {votes[selected.name] === "up" ? <ThumbUpAltIcon sx={{ fontSize: 16 }} /> : <ThumbUpAltOutlinedIcon sx={{ fontSize: 16 }} />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Not interested">
                      <IconButton size="small" onClick={() => vote(selected.name, "down")} sx={{ p: 0.4, color: votes[selected.name] === "down" ? "#f44336" : "text.disabled" }}>
                        {votes[selected.name] === "down" ? <ThumbDownAltIcon sx={{ fontSize: 16 }} /> : <ThumbDownAltOutlinedIcon sx={{ fontSize: 16 }} />}
                      </IconButton>
                    </Tooltip>
                    <IconButton size="small" onClick={() => setSelected(null)} sx={{ color: "text.secondary", p: 0.3 }}>
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap", mb: 1.5 }}>
                  {selected.rating != null && (
                    <Box sx={{ px: 1, py: 0.2, borderRadius: 1, bgcolor: `${ratingColor(selected.rating)}22`, border: `1px solid ${ratingColor(selected.rating)}55`, fontSize: "0.72rem", color: ratingColor(selected.rating), fontWeight: 600 }}>
                      ⭐ {selected.rating.toFixed(1)}
                    </Box>
                  )}
                  {selected.rent && selected.rent !== "N/A" && (
                    <Box sx={{ px: 1, py: 0.2, borderRadius: 1, bgcolor: "rgba(76,175,80,0.12)", border: "1px solid rgba(76,175,80,0.35)", fontSize: "0.72rem", color: "#4caf50", fontWeight: 600 }}>
                      {selected.rent}
                    </Box>
                  )}
                  {selected.distanceMiles != null && (
                    <Box sx={{ px: 1, py: 0.2, borderRadius: 1, bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", border: `1px solid ${isDark ? "#2a2d3a" : "#d0d4e0"}`, fontSize: "0.72rem", color: "text.secondary" }}>
                      📍 {selected.distanceMiles} mi
                    </Box>
                  )}
                  {selected.drivingTime && selected.drivingTime !== "N/A" && (
                    <Box sx={{ px: 1, py: 0.2, borderRadius: 1, bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", border: `1px solid ${isDark ? "#2a2d3a" : "#d0d4e0"}`, fontSize: "0.72rem", color: "text.secondary" }}>
                      🚗 {selected.drivingTime} (Mon 8AM)
                    </Box>
                  )}
                </Box>

                {selected.exactAddress && (
                  <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", mb: 0.8 }}>
                    {selected.exactAddress}
                  </Typography>
                )}

                {selected.comments && (
                  <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", lineHeight: 1.5, mb: 1 }}>
                    {selected.comments}
                  </Typography>
                )}

                {selected.website && selected.website !== "N/A" && (
                  <a
                    href={selected.website}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: "0.75rem", color: "#1565c0", display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none" }}
                  >
                    <OpenInNewIcon sx={{ fontSize: 13 }} /> Visit website
                  </a>
                )}
              </Box>
            )}

            {/* Apartment list */}
            <Box sx={{ flex: 1, overflow: "auto" }}>
              <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${isDark ? "#1e2130" : "#e8eaf0"}`, flexShrink: 0 }}>
                <Typography sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
                  {filteredApts.length} apartment{filteredApts.length !== 1 ? "s" : ""} · sorted by distance
                </Typography>
              </Box>
              {filteredApts.map((apt) => {
                const isActive = selected?.name === apt.name;
                return (
                  <Box
                    key={apt.name}
                    onClick={() => handleSelectApt(apt)}
                    sx={{
                      px: 2, py: 1.2,
                      borderBottom: `1px solid ${isDark ? "#1a1d28" : "#f0f2f7"}`,
                      cursor: "pointer",
                      bgcolor: isActive
                        ? (isDark ? "rgba(153,0,0,0.12)" : "rgba(153,0,0,0.06)")
                        : "transparent",
                      borderLeft: isActive ? "3px solid #990000" : "3px solid transparent",
                      transition: "all .15s",
                      "&:hover": {
                        bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(153,0,0,0.04)",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "text.primary", lineHeight: 1.3, flex: 1, mr: 1 }}>
                        {apt.name}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.1, flexShrink: 0 }}>
                        {apt.rating != null && (
                          <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: ratingColor(apt.rating), mr: 0.8 }}>
                            ⭐ {apt.rating.toFixed(1)}
                          </Typography>
                        )}
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); vote(apt.name, "up"); }} sx={{ p: 0.25, color: votes[apt.name] === "up" ? "#4caf50" : "text.disabled" }}>
                          {votes[apt.name] === "up" ? <ThumbUpAltIcon sx={{ fontSize: 13 }} /> : <ThumbUpAltOutlinedIcon sx={{ fontSize: 13 }} />}
                        </IconButton>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); vote(apt.name, "down"); }} sx={{ p: 0.25, color: votes[apt.name] === "down" ? "#f44336" : "text.disabled" }}>
                          {votes[apt.name] === "down" ? <ThumbDownAltIcon sx={{ fontSize: 13 }} /> : <ThumbDownAltOutlinedIcon sx={{ fontSize: 13 }} />}
                        </IconButton>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1, mt: 0.4, flexWrap: "wrap" }}>
                      {apt.rent && apt.rent !== "N/A" && (
                        <Typography sx={{ fontSize: "0.7rem", color: "#4caf50", fontWeight: 500 }}>
                          {apt.rent}
                        </Typography>
                      )}
                      {apt.distanceMiles != null && (
                        <Typography sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
                          {apt.distanceMiles} mi · {apt.drivingTime}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>

        <Footer
          isDark={isDark}
          rightContent={
            <Typography sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
              {mapMarkers.length} pins on map · {filteredApts.length - mapMarkers.length} without coordinates
            </Typography>
          }
        />
      </Box>
    </ThemeProvider>
  );
}
