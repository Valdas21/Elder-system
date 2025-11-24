import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

function AnonymousAppBar() {
  const navigate = useNavigate();
return (
<AppBar
        position="fixed"
        elevation={0}
        sx={{ backgroundColor: "#fff", color: "#000", borderBottom: "1px solid #eee" }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box display="flex" alignItems="center" gap={3}>
            <Button sx={{"&:hover": { backgroundColor: "transparent" }}} variant="text" color="inherit" onClick={() => {navigate("/")}}>
            <Typography variant="h6" fontWeight="bold">
              ELDER SYSTEM
            </Typography>
            </Button>

            <Button color="inherit" onClick={() => {navigate("/Forms")}}>Forms</Button>
          </Box>

          <Box display="flex" gap={2}>
            <Button color="inherit" onClick={() => {navigate("/Login")}}>Login</Button>
            <Button variant="contained" color="primary" onClick={() => {navigate("/Register")}}>
              Sign Up
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
);
}
export default AnonymousAppBar;