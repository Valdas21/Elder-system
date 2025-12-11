import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ElderAppBar from "./AppBars/ElderAppBar";
import Footer from "./Footers/Footer";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import adminPhoto from "./assets/admin.jpg";

function AdminDashboard() {
  

  return (
    <>
      <ElderAppBar />
      <Container maxWidth="xl" sx={{ mt: 12, mb: 6 }}>

        {/* Hero section with image placeholder */}
        <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, mb: 3 }}>
          <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "320px 1fr" }} gap={2} alignItems="center">
            {/* Photo */}
            <Box
              sx={{
                width: "100%",
                height: { xs: 180, md: 220 },
                borderRadius: 2,
                overflow: "hidden",
                border: (t) => `1px solid ${t.palette.divider}`,
                boxShadow: (t) => `0 8px 30px ${t.palette.action.disabledBackground}`,
                backgroundColor: "background.paper",
              }}
            >
              <img
                src={adminPhoto}
                alt="Administrator"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </Box>
            {/* Intro text */}
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Admin Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Welcome back. Use the widgets below to manage forms, elders, and submissions.
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Optional additional content area */}
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6">Overview</Typography>
            {/* Moved buttons into the widget area header */}
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "repeat(4, 1fr)" }} gap={2}>
            <Paper sx={{ p: 2, borderRadius: 2, minHeight: 100 }}>
              <Typography variant="subtitle1" fontWeight="bold">Forms</Typography>
              <Typography variant="body2" color="text.secondary">Manage and review submitted forms.</Typography>
              <Button variant="outlined" href="/Forms">Forms</Button>
            </Paper>
            <Paper sx={{ p: 2, borderRadius: 2, minHeight: 100 }}>
              <Typography variant="subtitle1" fontWeight="bold">Elders</Typography>
              <Typography variant="body2" color="text.secondary">View and edit elder profiles.</Typography>
              <Button variant="outlined" href="/Elders">Elders</Button>
            </Paper>
            <Paper sx={{ p: 2, borderRadius: 2, minHeight: 100 }}>
              <Typography variant="subtitle1" fontWeight="bold">Submissions</Typography>
              <Typography variant="body2" color="text.secondary">Audit and export submission data.</Typography>
              <Button variant="outlined" href="/Submissions">Submissions</Button>
            </Paper>
            {/* New: Questions widget */}
            <Paper sx={{ p: 2, borderRadius: 2, minHeight: 100 }}>
              <Typography variant="subtitle1" fontWeight="bold">Questions</Typography>
              <Typography variant="body2" color="text.secondary">Browse all questions across forms.</Typography>
              <Button variant="outlined" href="/Questions">Questions</Button>
            </Paper>
          </Box>
        </Paper>
      </Container>
      <Footer />
    </>
  );
}

export default AdminDashboard;