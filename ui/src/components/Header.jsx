import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Box, Typography, IconButton, Tooltip, Drawer, Divider,
} from "@mui/material";
import HomeWorkIcon     from "@mui/icons-material/HomeWork";
import MapIcon          from "@mui/icons-material/Map";
import TableViewIcon    from "@mui/icons-material/TableView";
import InfoIcon         from "@mui/icons-material/Info";
import Brightness4Icon  from "@mui/icons-material/Brightness4";
import Brightness7Icon  from "@mui/icons-material/Brightness7";
import MenuIcon         from "@mui/icons-material/Menu";
import CloseIcon        from "@mui/icons-material/Close";
import DownloadIcon     from "@mui/icons-material/Download";

const NAV_ITEMS = [
  { to: "/",          Icon: HomeWorkIcon,  label: "Home" },
  { to: "/apts",      Icon: MapIcon,       label: "Map" },
  { to: "/apts-list", Icon: TableViewIcon, label: "List" },
  { to: "/about",     Icon: InfoIcon,      label: "About" },
];

export default function Header({ isDark, onToggleDark, onDownload, children }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const ctrlSx = {
    color: isDark ? "#8a8fa8" : "#5a6075",
    bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
    border: isDark ? "1px solid #2a2d3a" : "1px solid #d0d4e0",
    borderRadius: 2, p: 0.8,
    "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)" },
  };

  return (
    <>
      <Box
        component="header"
        sx={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          px: 3, py: 1.5,
          borderBottom: "1px solid", borderColor: "divider",
          bgcolor: "background.paper",
          zIndex: 1200, flexShrink: 0,
        }}
      >
        {/* Logo */}
        <Box component={Link} to="/" sx={{ display: "flex", alignItems: "center", gap: 1.2, textDecoration: "none", flexShrink: 0 }}>
          <Box sx={{
            width: 34, height: 34, borderRadius: "10px",
            background: "linear-gradient(135deg,#990000,#cc2200)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 18px rgba(153,0,0,0.35)",
          }}>
            <HomeWorkIcon sx={{ fontSize: 18, color: "#fff" }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontSize: "1.1rem", color: "text.primary", lineHeight: 1 }}>
              USC<span style={{ color: "#990000" }}>Housing</span>
            </Typography>
          </Box>
        </Box>

        {/* Desktop nav */}
        <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 0.5, mx: 2, flexShrink: 0 }}>
          {NAV_ITEMS.map(({ to, Icon, label }) => {
            const active = pathname === to;
            return (
              <Box
                key={to}
                component={Link}
                to={to}
                sx={{
                  display: "flex", alignItems: "center", gap: 0.6,
                  px: 1.2, py: 0.5, borderRadius: 1.5,
                  bgcolor: active ? "rgba(153,0,0,0.1)" : "transparent",
                  border: active ? "1px solid rgba(153,0,0,0.4)" : "1px solid transparent",
                  textDecoration: "none",
                  color: active ? "#990000" : (isDark ? "#8a8fa8" : "#5a6075"),
                  transition: "all .2s",
                  "&:hover": { bgcolor: "rgba(153,0,0,0.08)", color: "#990000" },
                }}
              >
                <Icon sx={{ fontSize: 15 }} />
                <Typography sx={{ fontSize: "0.8rem", fontWeight: active ? 600 : 400, lineHeight: 1 }}>{label}</Typography>
              </Box>
            );
          })}
        </Box>

        {/* Middle — optional (search bars, chips, etc.) */}
        {children && (
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 1, minWidth: 0, overflow: "visible" }}>
            {children}
          </Box>
        )}

        {/* Right — desktop controls */}
        <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1, flexShrink: 0, ml: 1 }}>
          {onDownload && (
            <Tooltip title="Download CSV (includes your votes)">
              <IconButton size="small" onClick={onDownload} sx={ctrlSx}>
                <DownloadIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            <IconButton size="small" onClick={onToggleDark} sx={ctrlSx}>
              {isDark ? <Brightness7Icon sx={{ fontSize: 18 }} /> : <Brightness4Icon sx={{ fontSize: 18 }} />}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Mobile hamburger */}
        <Box sx={{ display: { xs: "flex", md: "none" }, ml: "auto", flexShrink: 0 }}>
          <IconButton size="small" onClick={() => setOpen(true)} sx={{ color: "text.primary" }}>
            <MenuIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        sx={{ display: { md: "none" }, "& .MuiDrawer-paper": { width: 260, bgcolor: "background.paper" } }}
      >
        <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.95rem" }}>Menu</Typography>
            <IconButton size="small" onClick={() => setOpen(false)}><CloseIcon fontSize="small" /></IconButton>
          </Box>
          <Divider sx={{ mb: 1 }} />
          {NAV_ITEMS.map(({ to, Icon, label }) => (
            <Box
              key={to}
              component={Link}
              to={to}
              onClick={() => setOpen(false)}
              sx={{
                display: "flex", alignItems: "center", gap: 1.2,
                p: 1.2, borderRadius: 2, textDecoration: "none", color: "text.primary",
                bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                border: `1px solid ${isDark ? "#2a2d3a" : "#d0d4e0"}`,
                "&:hover": { bgcolor: "rgba(153,0,0,0.1)", borderColor: "rgba(153,0,0,0.4)", color: "#990000" },
              }}
            >
              <Icon sx={{ fontSize: 18 }} />
              <Typography sx={{ fontSize: "0.88rem" }}>{label}</Typography>
            </Box>
          ))}
          <Divider sx={{ my: 1 }} />
          {onDownload && (
            <Box
              onClick={() => { onDownload(); setOpen(false); }}
              sx={{
                display: "flex", alignItems: "center", gap: 1.2,
                p: 1.2, borderRadius: 2, cursor: "pointer",
                bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                border: `1px solid ${isDark ? "#2a2d3a" : "#d0d4e0"}`,
              }}
            >
              <DownloadIcon sx={{ fontSize: 18 }} />
              <Typography sx={{ fontSize: "0.85rem" }}>Download CSV</Typography>
            </Box>
          )}
          <Box
            onClick={onToggleDark}
            sx={{
              display: "flex", alignItems: "center", gap: 1.2,
              p: 1.2, borderRadius: 2, cursor: "pointer",
              bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
              border: `1px solid ${isDark ? "#2a2d3a" : "#d0d4e0"}`,
            }}
          >
            {isDark ? <Brightness7Icon sx={{ fontSize: 18 }} /> : <Brightness4Icon sx={{ fontSize: 18 }} />}
            <Typography sx={{ fontSize: "0.85rem" }}>{isDark ? "Light Mode" : "Dark Mode"}</Typography>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}
