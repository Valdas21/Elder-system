import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { jwtDecode, type JwtPayload } from "jwt-decode";
import ElderAppBar from "./AppBars/ElderAppBar";
import Footer from "./Footers/Footer";
import elderPhoto from "./assets/elder-hero.jpg";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";

type DecodedToken = JwtPayload & { [key: string]: any };

function Elder() {
  const navigate = useNavigate();
  const [decoded, setDecoded] = useState<DecodedToken | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/Login");
      return;
    }

    try {
      const d = jwtDecode<DecodedToken>(token);
      const role =
        d["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
        d["role"];

      if (role !== "elder") {
        navigate("/Login");
        return;
      }

      setDecoded(d);
      console.log("Decoded token:", d);
    } catch {
      navigate("/Login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    navigate("/Login");
  };

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
                src={elderPhoto}
                alt="Elder"
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
                Elder Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Welcome {decoded?.firstName ?? ""} {decoded?.lastName ?? ""}!
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 2, flexWrap: "wrap" }}>
                <Button variant="contained" onClick={() => navigate("/Forms")}>
                  Fill a form
                </Button>
                <Button variant="outlined" onClick={() => navigate("/Elder")}>
                  Refresh
                </Button>
                <Button color="error" onClick={handleLogout}>
                  Logout
                </Button>
              </Stack>
            </Box>
          </Box>
        </Paper>

        {/* Widgets section */}
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6">Overview</Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }} gap={2}>
            <Paper sx={{ p: 2, borderRadius: 2, minHeight: 100 }}>
              <Typography variant="subtitle1" fontWeight="bold">My Forms</Typography>
              <Typography variant="body2" color="text.secondary">Browse and submit available forms.</Typography>
              <Button variant="outlined" href="/Forms" sx={{ mt: 1 }}>Open</Button>
            </Paper>
            <Paper sx={{ p: 2, borderRadius: 2, minHeight: 100 }}>
              <Typography variant="subtitle1" fontWeight="bold">Submissions</Typography>
              <Typography variant="body2" color="text.secondary">Review your submitted forms.</Typography>
              <Button variant="outlined" href="/Submissions" sx={{ mt: 1 }}>Open</Button>
            </Paper>
            <Paper sx={{ p: 2, borderRadius: 2, minHeight: 100 }}>
              <Typography variant="subtitle1" fontWeight="bold">Profile</Typography>
              <Typography variant="body2" color="text.secondary">Manage your personal details.</Typography>
              <Button variant="outlined" href="/Profile" sx={{ mt: 1 }}>Open</Button>
            </Paper>
          </Box>
        </Paper>
      </Container>
      <Footer />
    </>
  );
}

export default Elder;
