import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        backgroundColor: (t) => t.palette.background.paper,
        borderTop: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <Box
        className="page-container"
        sx={{
          py: { xs: 3, md: 4 },
          display: "grid",
          gap: { xs: 1.5, md: 2 },              // closer sections
          gridTemplateColumns: { xs: "1fr", md: "auto auto" },
          justifyContent: "center",              // center the two columns as a group
          justifyItems: "center",                // center items inside each column
          alignItems: "center",
          textAlign: "center",                   // center text
        }}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "secondary.main", mb: 0.5 }}>
            Kontaktai
          </Typography>
          <Typography variant="body2">Savivaldybė, Adresas 123</Typography>
          <Typography variant="body2">El. paštas: info@example.lt</Typography>
        </Box>

        <Box>
          <Link href="/privacy">Privatumo politika</Link>
          <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
            © {new Date().getFullYear()} Elder System
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}