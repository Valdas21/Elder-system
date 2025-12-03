import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import { jwtDecode, type JwtPayload } from "jwt-decode";
import ElderAppBar from "./AppBars/ElderAppBar";
import Footer from "./Footers/Footer";

type DecodedToken = JwtPayload & { [key: string]: any };

function Elder() {
  const navigate = useNavigate();
  const [decoded, setDecoded] = useState<DecodedToken | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
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
      <Container sx={{ mt: 12, mb: 6 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Elder dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Welcome {decoded?.firstName ?? ""} {decoded?.lastName ?? ""}!
          </Typography>

          <Box mt={3}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick actions
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <Button variant="contained" onClick={() => navigate("/Forms")}>
                    Fill a form
                  </Button>
                  <Button variant="outlined" onClick={() => navigate("/Elder")}>
                    Refresh
                  </Button>
                  <Button color="error" onClick={handleLogout}>
                    Logout
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
      <Footer />
    </>
  );
}

export default Elder;
