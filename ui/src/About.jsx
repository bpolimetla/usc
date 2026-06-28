import { useState, useMemo } from "react";
import {
  Box, Typography, ThemeProvider, createTheme, CssBaseline, Paper, Divider,
} from "@mui/material";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import { downloadCSV } from "./utils/download.js";

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
    typography: { fontFamily: "'DM Sans', 'Segoe UI', sans-serif" },
    shape: { borderRadius: 14 },
    components: { MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } } },
  });
}

function SectionHeader({ children }) {
  return (
    <Typography sx={{
      fontSize: "1rem", fontWeight: 700, color: "#990000",
      textTransform: "uppercase", letterSpacing: "0.06em", mb: 2,
    }}>
      {children}
    </Typography>
  );
}

function SubHeader({ children }) {
  return (
    <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: "text.primary", mt: 2.5, mb: 0.8 }}>
      {children}
    </Typography>
  );
}

function BodyText({ children, sx }) {
  return (
    <Typography sx={{ fontSize: "0.84rem", color: "text.secondary", lineHeight: 1.7, ...sx }}>
      {children}
    </Typography>
  );
}

function BulletItem({ label, children }) {
  return (
    <Box sx={{ display: "flex", gap: 1.2, mb: 1.2, alignItems: "flex-start" }}>
      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#990000", mt: "6px", flexShrink: 0 }} />
      <BodyText>
        {label && <strong>{label}: </strong>}
        {children}
      </BodyText>
    </Box>
  );
}

function ScriptBlock({ title, children }) {
  return (
    <Box sx={{
      my: 1.5, p: 2, borderRadius: 2,
      bgcolor: "rgba(153,0,0,0.06)", border: "1px solid rgba(153,0,0,0.2)",
    }}>
      <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#990000", mb: 0.8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: "0.83rem", color: "text.primary", lineHeight: 1.7, fontStyle: "italic" }}>
        {children}
      </Typography>
    </Box>
  );
}

export default function About() {
  const [isDark, setIsDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const theme = useMemo(() => makeTheme(isDark), [isDark]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');`}</style>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", bgcolor: "background.default" }}>

        <Header isDark={isDark} onToggleDark={() => setIsDark((d) => !d)} onDownload={downloadCSV} />

        <Box sx={{ flex: 1, overflow: "auto", px: { xs: 2, sm: 4, md: 8 }, py: 5, maxWidth: 820, mx: "auto", width: "100%" }}>

          {/* ── Section 1: Search Tips ── */}
          <Paper elevation={0} sx={{
            p: { xs: 2.5, sm: 4 }, mb: 4,
            border: `1px solid ${isDark ? "#1e2130" : "#e8eaf0"}`,
            borderRadius: 3,
          }}>
            <SectionHeader>Search Tips</SectionHeader>

            {/* 1. Property Hunting Parameters */}
            <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "text.primary", mb: 0.5 }}>
              1. Property Hunting Parameters
            </Typography>
            <BodyText>
              Use this absolute checklist when filtering properties on search portals (Zillow, Apartments.com, or Redfin) and during physical or virtual tours.
            </BodyText>

            <SubHeader>Physical & Environmental Dealbreakers</SubHeader>
            <BulletItem label="Acoustic & Air Safety">
              Property must be set back from arterial roads, highways, or high-traffic intersections to mitigate PM2.5 particulate pollution and tire-wear microplastics.
            </BulletItem>
            <BulletItem label="Waste Management Offsets">
              Unit must not share a wall with, be directly across from, or sit immediately above the building trash chute or communal dumpster rooms (eliminating pests, odor, and structural noise).
            </BulletItem>
            <BulletItem label="Structural Material & Era">
              Target construction completed after 2015 to leverage modern structural codes, advanced subfloor acoustic insulation, and updated HVAC filtration. Avoid historical or legacy builds.
            </BulletItem>
            <BulletItem label="Interior Finishes">
              High-durability wood or luxury vinyl plank (LVP) flooring preferred over high-allergen carpeting.
            </BulletItem>

            <SubHeader>Security & Logistics Standards</SubHeader>
            <BulletItem label="Access Control">
              Fully enclosed, access-controlled resident parking garage with active security monitoring.
            </BulletItem>
            <BulletItem label="Personnel">
              Staffed concierge or front desk presence to handle visitor filtering and asset verification.
            </BulletItem>
            <BulletItem label="Asset Protection">
              Automated parcel management systems like an onsite Amazon Hub Locker, Luxer One, or Parcel Pending array situated within a secure, interior room.
            </BulletItem>
            <BulletItem label="Air Purity">
              Complete 100% smoke-free building policies codified directly into the lease agreement (covering units, balconies, and common zones).
            </BulletItem>

            <Divider sx={{ my: 3 }} />

            {/* 2. Tour & Negotiation Playbook */}
            <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "text.primary", mb: 0.5, mt: 1 }}>
              2. Tour & Negotiation Playbook
            </Typography>
            <BodyText>
              When contacting leasing offices, use this specific script to address non-advertised deals and safety disclosures.
            </BodyText>

            <ScriptBlock title="The Concession and Deal Inquiry">
              "I am looking to finalize a lease this week and am evaluating a few comparable properties. While I didn't see it explicitly listed on your portal, what unadvertised concessions—such as 1 to 2 months of waived rent or look-and-lease credits—can you apply to this specific floor plan to close this unit today?"
            </ScriptBlock>

            <ScriptBlock title="The Psychological & Material Disclosure Request">
              "Under local disclosure guidelines, please confirm whether this specific unit, or any immediate adjacent units sharing a wall or ceiling, has been the site of a death or major biohazard incident within the past three years."
            </ScriptBlock>
          </Paper>

          {/* ── Section 2: Data Preparation Process ── */}
          <Paper elevation={0} sx={{
            p: { xs: 2.5, sm: 4 }, mb: 4,
            border: `1px solid ${isDark ? "#1e2130" : "#e8eaf0"}`,
            borderRadius: 3,
          }}>
            <SectionHeader>Data Preparation Process</SectionHeader>

            <BulletItem label="Multi-Model Processing">
              Leveraged a combination of advanced LLMs (Claude, OpenAI API, Gemini, and QWEN) to aggregate and parse the initial apartment listings.
            </BulletItem>
            <BulletItem label="Quality Thresholding">
              Filtered the dataset to prioritize properties with 4+ star ratings, actively filtering out the few lower-rated exceptions that appeared in the raw data.
            </BulletItem>
            <BulletItem label="Review Audit">
              Conducted manual and algorithmic checks on Google Review comment histories to spot and discount paid, fake, or incentivized reviews.
            </BulletItem>
            <BulletItem label="Manual Quality Control">
              Acknowledged the possibility of AI errors by requiring manual data updates and verification of all crucial terms.
            </BulletItem>
            <BulletItem label="Centralized Tracking">
              Designed the output for easy import into Google Sheets to facilitate collaborative updates and personal note-taking.
            </BulletItem>
            <BulletItem label="Open-Ended Dataset">
              Kept the framework flexible to accommodate new, unlisted apartments that fit the criteria as research continues.
            </BulletItem>
          </Paper>

        </Box>

        <Footer isDark={isDark} />
      </Box>
    </ThemeProvider>
  );
}
