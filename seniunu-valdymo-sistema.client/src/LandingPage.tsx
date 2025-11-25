import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import { useNavigate } from "react-router-dom";
import AppBar from "./AppBars/AnonymousAppBar";
import Footer from "./Footers/Footer";



function LandingPage() {
    const navigate = useNavigate();
  return (
    <>
      {/* NAVBAR */}
      <AppBar />

      {/* HERO SECTION */}
      <Container sx={{ mt: 15 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {/* Left Side Text */}
          <Box sx={{paddingRight: 10}} maxWidth="400px">
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Welcome to Elder system
            </Typography>

            <Typography variant="body1" color="text.secondary" mb={3}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua.
            </Typography>

            <Button variant="contained" color="primary" onClick={() => {navigate("/Register")}}>
              Get started
            </Button>
          </Box>

          {/* Right Side Box (mock illustration) */}
          <Paper
            elevation={3}
            sx={{
              width: 500,
              height: 300,
              borderRadius: 2,
              backgroundColor: "#fafafa",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Typography variant="body2" color="text.secondary">
              [ Illustration / Screenshot Area ]
            </Typography>
          </Paper>
        </Box>

        
      </Container>
      <Footer/>
    </>
  );
}

export default LandingPage;
