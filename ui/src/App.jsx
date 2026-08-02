import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, ThemeProvider, createTheme, CssBaseline,
} from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import TableViewIcon from "@mui/icons-material/TableView";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";

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
      h6: { fontFamily: "'Syne', sans-serif", fontWeight: 700, letterSpacing: "-0.02em" },
    },
    shape: { borderRadius: 14 },
    components: { MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } } },
  });
}

const CARDS = [
  {
    to: "/apts",
    Icon: MapIcon,
    title: "Apartment Map",
    desc: "Interactive map of USC-area apartments. Click any pin to see rating, rent, and driving time to Olin Hall.",
    color: "#990000",
  },
  {
    to: "/apts-list",
    Icon: TableViewIcon,
    title: "Apartments List",
    desc: "Sortable, searchable table of all apartments with rent, star rating, distance, and Monday 8 AM drive time.",
    color: "#1565c0",
  },
];

export default function App() {
  const [isDark, setIsDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const theme = makeTheme(isDark);
  const navigate = useNavigate();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');`}</style>
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>

        <Header isDark={isDark} onToggleDark={() => setIsDark((d) => !d)} />

        {/* Hero */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", px: 3, py: 6 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <Box sx={{
              width: 48, height: 48, borderRadius: "14px",
              background: "linear-gradient(135deg, #990000, #cc0000)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 24px rgba(153,0,0,0.4)",
            }}>
              <HomeWorkIcon sx={{ fontSize: 26, color: "#fff" }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontSize: "1.6rem", color: "text.primary", lineHeight: 1 }}>
                USC <span style={{ color: "#990000" }}>Housing</span>
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                Near Olin Hall · 3650 McClintock Ave
              </Typography>
            </Box>
          </Box>

          <Typography sx={{ fontSize: "0.95rem", color: "text.secondary", mb: 6, textAlign: "center", maxWidth: 480 }}>
            46 apartments near USC — enriched with live Google star ratings, 2BR/2BA rent estimates,
            and Monday 8 AM driving times to Olin Hall.
          </Typography>

          {/* Two cards */}
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", justifyContent: "center", width: "100%", maxWidth: 760 }}>
            {CARDS.map(({ to, Icon, title, desc, color }) => (
              <Box
                key={to}
                onClick={() => navigate(to)}
                sx={{
                  flex: "1 1 320px", maxWidth: 360,
                  p: 3.5,
                  borderRadius: 3,
                  bgcolor: "background.paper",
                  border: `1px solid ${isDark ? "#2a2d3a" : "#e0e4ef"}`,
                  cursor: "pointer",
                  transition: "all .22s",
                  "&:hover": {
                    borderColor: color,
                    boxShadow: `0 0 0 1px ${color}40, 0 8px 32px rgba(0,0,0,0.12)`,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Box sx={{
                  width: 44, height: 44, borderRadius: "12px",
                  background: `linear-gradient(135deg, ${color}cc, ${color})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  mb: 2, boxShadow: `0 4px 16px ${color}44`,
                }}>
                  <Icon sx={{ fontSize: 22, color: "#fff" }} />
                </Box>
                <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1.05rem", color: "text.primary", mb: 1 }}>
                  {title}
                </Typography>
                <Typography sx={{ fontSize: "0.83rem", color: "text.secondary", lineHeight: 1.6 }}>
                  {desc}
                </Typography>
                <Typography sx={{ mt: 2, fontSize: "0.78rem", color, fontWeight: 600 }}>
                  Open →
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Footer />
      </Box>
    </ThemeProvider>
  );
}
