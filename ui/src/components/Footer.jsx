import { Link, useLocation } from "react-router-dom";
import { Box, Typography, Tooltip } from "@mui/material";
import HomeWorkIcon  from "@mui/icons-material/HomeWork";
import MapIcon       from "@mui/icons-material/Map";
import TableViewIcon from "@mui/icons-material/TableView";
import InfoIcon      from "@mui/icons-material/Info";

const NAV_ITEMS = [
  { to: "/",          Icon: HomeWorkIcon,  label: "Home",  title: "Landing page" },
  { to: "/apts",      Icon: MapIcon,       label: "Map",   title: "Apartment Map" },
  { to: "/apts-list", Icon: TableViewIcon, label: "List",  title: "Apartments List" },
  { to: "/about",     Icon: InfoIcon,      label: "About", title: "About" },
];

export default function Footer({ isDark, rightContent }) {
  const { pathname } = useLocation();

  return (
    <Box
      component="footer"
      sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        px: 3, py: 1,
        borderTop: "1px solid", borderColor: "divider",
        bgcolor: "background.paper",
        flexShrink: 0,
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
          © 2026 Bhavani Polimetla · USC Housing
        </Typography>
      </Box>

      <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 1, mx: 2, flexShrink: 0 }}>
        {NAV_ITEMS.map(({ to, Icon, label, title }) => {
          const active = pathname === to;
          return (
            <Tooltip key={to} title={title}>
              <Box
                component={Link}
                to={to}
                sx={{
                  display: "flex", alignItems: "center", gap: 0.6,
                  px: 1.2, py: 0.45, borderRadius: 1.5,
                  bgcolor: active ? "rgba(153,0,0,0.1)" : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"),
                  border: active ? "1px solid rgba(153,0,0,0.4)" : (isDark ? "1px solid #2a2d3a" : "1px solid #d0d4e0"),
                  textDecoration: "none",
                  color: active ? "#990000" : (isDark ? "#8a8fa8" : "#5a6075"),
                  transition: "all .2s",
                  "&:hover": { bgcolor: "rgba(153,0,0,0.1)", borderColor: "rgba(153,0,0,0.4)", color: "#990000" },
                }}
              >
                <Icon sx={{ fontSize: 14 }} />
                <Typography sx={{ fontSize: "0.68rem", fontWeight: 500, lineHeight: 1 }}>{label}</Typography>
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>{rightContent}</Box>
    </Box>
  );
}
