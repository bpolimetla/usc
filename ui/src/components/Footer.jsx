import { Box, Typography } from "@mui/material";

export default function Footer({ rightContent }) {
  return (
    <Box
      component="footer"
      sx={{
        display: "flex", alignItems: "center",
        px: 3, py: 1,
        borderTop: "1px solid", borderColor: "divider",
        bgcolor: "background.paper",
        flexShrink: 0,
      }}
    >
      <Box sx={{ flex: 1 }} />

      <Typography sx={{ fontSize: "0.7rem", color: "text.secondary", textAlign: "center" }}>
        © 2026 USC Housing
      </Typography>

      <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>{rightContent}</Box>
    </Box>
  );
}
