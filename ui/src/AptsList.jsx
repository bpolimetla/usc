import { useState, useMemo, useCallback, useRef } from "react";
import {
  Box, Typography, Chip, ThemeProvider, createTheme, CssBaseline,
  InputBase, Paper, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TableSortLabel, Tooltip, ClickAwayListener, List, ListItem, ListItemText,
} from "@mui/material";
import SearchIcon               from "@mui/icons-material/Search";
import CloseIcon                from "@mui/icons-material/Close";
import OpenInNewIcon            from "@mui/icons-material/OpenInNew";
import ThumbUpAltIcon           from "@mui/icons-material/ThumbUpAlt";
import ThumbUpAltOutlinedIcon   from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbDownAltIcon         from "@mui/icons-material/ThumbDownAlt";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
import { useVotes } from "./utils/votes.js";
import { downloadCSV } from "./utils/download.js";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import aptsRaw from "./data/apts.json";

function makeTheme(dark) {
  return createTheme({
    palette: {
      mode: dark ? "dark" : "light",
      background: {
        default: dark ? "#0f1117" : "#f5f6fa",
        paper:   dark ? "#161922" : "#ffffff",
      },
      divider: dark ? "#1e2130" : "#e8eaf0",
    },
    typography: { fontFamily: "'DM Sans', 'Segoe UI', sans-serif" },
  });
}

// ── Columns ───────────────────────────────────────────────────────────────────
const COLUMNS = [
  { id: "name",          label: "Apartment",      minWidth: 160 },
  { id: "rating",        label: "Rating",         minWidth: 70,  numeric: true },
  { id: "rent",          label: "Rent (2x2)",     minWidth: 110 },
  { id: "distanceMiles", label: "mi to Olin",     minWidth: 80,  numeric: true },
  { id: "drivingTime",   label: "Drive Mon 8AM",  minWidth: 110 },
  { id: "exactAddress",  label: "Address",        minWidth: 180 },
  { id: "comments",      label: "Comments",       minWidth: 160 },
  { id: "voteScore",     label: "Vote",           minWidth: 70,  numeric: true },
];

function descendingComparator(a, b, key) {
  const av = a[key] ?? (typeof a[key] === "number" ? -Infinity : "");
  const bv = b[key] ?? (typeof b[key] === "number" ? -Infinity : "");
  if (bv < av) return -1;
  if (bv > av) return 1;
  return 0;
}
function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function ratingColor(r) {
  if (r == null) return "#9e9e9e";
  if (r >= 4.5) return "#4caf50";
  if (r >= 4.0) return "#8bc34a";
  if (r >= 3.5) return "#ff9800";
  return "#f44336";
}

// ── Rating filter chips ───────────────────────────────────────────────────────
const RATING_CHIPS = [
  { label: "All",   min: null },
  { label: "4.5+",  min: 4.5  },
  { label: "4.0+",  min: 4.0  },
  { label: "3.5+",  min: 3.5  },
];

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AptsList() {
  const [isDark, setIsDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const theme = useMemo(() => makeTheme(isDark), [isDark]);

  const [order,      setOrder]      = useState("asc");
  const [orderBy,    setOrderBy]    = useState("distanceMiles");
  const [ratingMin,  setRatingMin]  = useState(null);
  const [search,     setSearch]     = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const { votes, vote } = useVotes();

  const handleSort = (col) => {
    const isAsc = orderBy === col && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(col);
  };

  // Suggestions for search dropdown
  const suggestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q.length < 1) return [];
    return aptsRaw
      .filter((a) => a.name.toLowerCase().includes(q) || (a.exactAddress || "").toLowerCase().includes(q))
      .slice(0, 8)
      .map((a) => a.name);
  }, [search]);

  const handleSearchSelect = useCallback((name) => {
    setSearch(name);
    setSearchOpen(false);
  }, []);

  // Visible rows
  const visibleRows = useMemo(() => {
    let rows = aptsRaw;
    if (ratingMin != null) rows = rows.filter((a) => a.rating != null && a.rating >= ratingMin);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (a) => a.name.toLowerCase().includes(q) || (a.exactAddress || a.address || "").toLowerCase().includes(q)
      );
    }
    // Augment with numeric voteScore so the Vote column is sortable (2=up, 1=none, 0=down)
    const augmented = rows.map((a) => ({
      ...a,
      voteScore: votes[a.name] === "up" ? 2 : votes[a.name] === "down" ? 0 : 1,
    }));
    return augmented.sort(getComparator(order, orderBy));
  }, [ratingMin, search, order, orderBy, votes]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');`}</style>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", bgcolor: "background.default" }}>

        <Header isDark={isDark} onToggleDark={() => setIsDark((d) => !d)} onDownload={downloadCSV}>
          {/* Search with suggestions */}
          <ClickAwayListener onClickAway={() => setSearchOpen(false)}>
            <Box sx={{ position: "relative", flex: "0 1 300px", mx: 2 }} ref={searchRef}>
              <Paper elevation={0} sx={{
                display: "flex", alignItems: "center", gap: 0.5, px: 1.2, py: 0.4,
                border: `1px solid ${searchOpen ? "#990000" : (isDark ? "#2a2d3a" : "#d0d4e0")}`,
                borderRadius: 2,
                bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                transition: "border-color .2s",
              }}>
                <SearchIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <InputBase
                  placeholder="Search apartments…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setSearchOpen(true); }}
                  onFocus={() => setSearchOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") { setSearch(""); setSearchOpen(false); }
                    if (e.key === "Enter" && suggestions[0]) handleSearchSelect(suggestions[0]);
                  }}
                  sx={{ flex: 1, fontSize: "0.82rem", "& input": { p: 0 } }}
                />
                {search && (
                  <IconButton size="small" onClick={() => { setSearch(""); setSearchOpen(false); }} sx={{ p: 0.2, color: "text.secondary" }}>
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                )}
              </Paper>

              {searchOpen && suggestions.length > 0 && (
                <Paper elevation={4} sx={{
                  position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
                  zIndex: 2000, maxHeight: 240, overflow: "auto",
                  bgcolor: "background.paper",
                  border: `1px solid ${isDark ? "#2a2d3a" : "#d0d4e0"}`,
                  borderRadius: 2,
                }}>
                  <List dense disablePadding>
                    {suggestions.map((name, idx) => (
                      <ListItem
                        key={idx}
                        onClick={() => handleSearchSelect(name)}
                        sx={{
                          cursor: "pointer", px: 1.5, py: 0.7,
                          "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)" },
                          borderBottom: idx < suggestions.length - 1 ? `1px solid ${isDark ? "#1e2130" : "#f0f0f4"}` : "none",
                        }}
                      >
                        <ListItemText
                          primary={name}
                          slotProps={{ primary: { sx: { fontSize: "0.82rem", fontWeight: 500 } } }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </Box>
          </ClickAwayListener>

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

        {/* TABLE */}
        <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <TableContainer sx={{ flex: 1, overflow: "auto" }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {COLUMNS.map((col) => (
                    <TableCell
                      key={col.id}
                      align={col.numeric ? "right" : "left"}
                      sortDirection={orderBy === col.id ? order : false}
                      sx={{
                        minWidth: col.minWidth,
                        bgcolor: isDark ? "#161922" : "#f8f9fc",
                        fontWeight: 700, fontSize: "0.69rem", color: "text.secondary",
                        borderBottom: `2px solid ${theme.palette.divider}`,
                        py: 0.5, px: 0.75, whiteSpace: "nowrap",
                      }}
                    >
                      <TableSortLabel
                        active={orderBy === col.id}
                        direction={orderBy === col.id ? order : "asc"}
                        onClick={() => handleSort(col.id)}
                      >
                        {col.label}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {visibleRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={COLUMNS.length} align="center" sx={{ py: 6, color: "text.secondary", fontSize: "0.82rem" }}>

                      No apartments match the current filters.
                    </TableCell>
                  </TableRow>
                ) : visibleRows.map((apt, idx) => (
                  <TableRow
                    key={apt.name}
                    hover
                    sx={{
                      bgcolor: idx % 2 === 1
                        ? (isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.012)")
                        : "transparent",
                      "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(153,0,0,0.04)" },
                    }}
                  >
                    {/* Name + link */}
                    <TableCell sx={{ fontSize: "0.75rem", py: 0.4, px: 0.75 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Typography sx={{ fontSize: "0.75rem", fontWeight: 500, color: "text.primary", lineHeight: 1.3 }}>
                          {apt.name}
                        </Typography>
                        {apt.website && apt.website !== "N/A" && (
                          <Tooltip title="Visit website">
                            <a href={apt.website} target="_blank" rel="noreferrer" style={{ lineHeight: 0 }}>
                              <OpenInNewIcon sx={{ fontSize: 12, color: "#1976d2", "&:hover": { color: "#1565c0" } }} />
                            </a>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>

                    {/* Rating */}
                    <TableCell align="right" sx={{ py: 0.4, px: 0.75 }}>
                      {apt.rating != null ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, justifyContent: "flex-end" }}>
                          <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#f9a825" }}>★</Typography>
                          <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: ratingColor(apt.rating) }}>
                            {apt.rating.toFixed(1)}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography sx={{ fontSize: "0.72rem", color: "text.disabled" }}>—</Typography>
                      )}
                    </TableCell>

                    {/* Rent */}
                    <TableCell sx={{ fontSize: "0.75rem", py: 0.4, px: 0.75 }}>
                      {apt.rent && apt.rent !== "N/A" ? (
                        <Typography sx={{ fontSize: "0.75rem", color: "#4caf50", fontWeight: 600 }}>
                          {apt.rent}
                        </Typography>
                      ) : (
                        <Typography sx={{ fontSize: "0.72rem", color: "text.disabled" }}>—</Typography>
                      )}
                    </TableCell>

                    {/* Distance */}
                    <TableCell align="right" sx={{ fontSize: "0.72rem", color: "text.secondary", py: 0.4, px: 0.75, whiteSpace: "nowrap" }}>
                      {apt.distanceMiles != null ? `${apt.distanceMiles} mi` : "—"}
                    </TableCell>

                    {/* Driving time */}
                    <TableCell sx={{ fontSize: "0.72rem", color: "text.secondary", py: 0.4, px: 0.75, whiteSpace: "nowrap" }}>
                      {apt.drivingTime && apt.drivingTime !== "N/A" ? apt.drivingTime : "—"}
                    </TableCell>

                    {/* Address */}
                    <TableCell sx={{ py: 0.4, px: 0.75, maxWidth: 200 }}>
                      {apt.exactAddress ? (
                        <Tooltip title={apt.exactAddress}>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(apt.exactAddress)}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              color: "#1976d2", textDecoration: "none", fontSize: "0.69rem",
                              display: "block", overflow: "hidden", textOverflow: "ellipsis",
                              whiteSpace: "nowrap", maxWidth: 190,
                            }}
                          >
                            {apt.exactAddress}
                          </a>
                        </Tooltip>
                      ) : (
                        <Typography sx={{ fontSize: "0.72rem", color: "text.disabled" }}>—</Typography>
                      )}
                    </TableCell>

                    {/* Comments */}
                    <TableCell sx={{ py: 0.4, px: 0.75, maxWidth: 180 }}>
                      <Typography sx={{ fontSize: "0.69rem", color: "text.secondary", whiteSpace: "normal", wordBreak: "break-word", lineHeight: 1.4 }}>
                        {apt.comments || <span style={{ opacity: 0.4 }}>—</span>}
                      </Typography>
                    </TableCell>

                    {/* Vote */}
                    <TableCell sx={{ py: 0.4, px: 0.75, whiteSpace: "nowrap" }}>
                      <Box sx={{ display: "flex", gap: 0.3, alignItems: "center" }}>
                        <Tooltip title="Interested">
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); vote(apt.name, "up"); }} sx={{ p: 0.3, color: votes[apt.name] === "up" ? "#4caf50" : "text.disabled" }}>
                            {votes[apt.name] === "up" ? <ThumbUpAltIcon sx={{ fontSize: 14 }} /> : <ThumbUpAltOutlinedIcon sx={{ fontSize: 14 }} />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Not interested">
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); vote(apt.name, "down"); }} sx={{ p: 0.3, color: votes[apt.name] === "down" ? "#f44336" : "text.disabled" }}>
                            {votes[apt.name] === "down" ? <ThumbDownAltIcon sx={{ fontSize: 14 }} /> : <ThumbDownAltOutlinedIcon sx={{ fontSize: 14 }} />}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Footer
          isDark={isDark}
          rightContent={
            <Typography sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
              {visibleRows.length} of {aptsRaw.length} apartments
            </Typography>
          }
        />
      </Box>
    </ThemeProvider>
  );
}
