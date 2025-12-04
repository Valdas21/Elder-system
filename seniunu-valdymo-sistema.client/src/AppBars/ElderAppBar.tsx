import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

function ElderAppBar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    navigate("/Login");
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{ backgroundColor: "#fff", color: "#000", borderBottom: "1px solid #eee" }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box display="flex" alignItems="center" gap={3}>
          <Button
            sx={{ "&:hover": { backgroundColor: "transparent" } }}
            variant="text"
            color="inherit"
            onClick={() => navigate("/Elder")}
          >
            <Typography variant="h6" fontWeight="bold">
              ELDER SYSTEM
            </Typography>
          </Button>

          <Button color="inherit" onClick={() => navigate("/Elder")}>Dashboard</Button>
          <Button color="inherit" onClick={() => navigate("/Forms")}>Forms</Button>
          <Button color="inherit" onClick={() => navigate("/Submissions")}>Submissions</Button>
        </Box>

        <Box display="flex" gap={2}>
          <Button color="inherit" onClick={() => navigate("/Profile")}>Profile</Button>
          <Button variant="outlined" color="inherit" onClick={handleLogout}>Logout</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default ElderAppBar;
