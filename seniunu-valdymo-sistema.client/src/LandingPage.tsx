import React from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import { useNavigate } from "react-router-dom";
import AppBar from "./AppBars/AnonymousAppBar";
import Footer from "./Footers/Footer";
import Grid from "@mui/material/Grid";
import Toolbar from "@mui/material/Toolbar";
import { useTheme } from "@mui/material/styles";
import adminHero from "./assets/admin-hero.jpg";

function LandingPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const toolbarHeight = theme.mixins.toolbar.minHeight ?? 64;

  return (
    <>
      <AppBar />
      <Toolbar />

      <Container
        sx={{
          mt: { xs: 2, md: 3 },
          pb: { xs: 6, md: 8 },
        }}
      >
        <Grid
          container
          spacing={4}
          alignItems="center"
          justifyContent="center"
          sx={{
            minHeight: { md: `calc(60vh - ${toolbarHeight}px)` },
            textAlign: "center",
          }}
        >
          {/* Centered text block */}
          <Grid item xs={12} md={8} lg={6}>
            <Box sx={{ mx: "auto", maxWidth: 720 }}>
              <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>
                Welcome to Elder system
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Button variant="contained" color="primary" onClick={() => navigate("/Register")}>
                  Get started
                </Button>
              </Box>
            </Box>
          </Grid>

          {/* Centered image block */}
          <Grid item xs={12} md={8} lg={6}>
            <Box
              sx={{
                mx: "auto",
                maxWidth: 720,
                p: 2,
                borderRadius: 3,
                border: (t) => `1px solid ${t.palette.divider}`,
                boxShadow: (t) => `0 8px 30px ${t.palette.action.disabledBackground}`,
                backgroundColor: "background.paper",
              }}
            >
              <img
                src={adminHero}
                alt="Elder system illustration"
                style={{ maxWidth: "100%", height: "auto", display: "block", margin: "0 auto" }}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Footer />
    </>
  );
}

export default LandingPage;
