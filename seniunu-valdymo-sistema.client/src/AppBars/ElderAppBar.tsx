import React, { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import { jwtDecode } from "jwt-decode";

function ElderAppBar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const items = [
    { text: "Dashboard", to: "/Elder" },
    { text: "Forms", to: "/Forms" },
    { text: "Submissions", to: "/Submissions" },
    { text: "Profile", to: "/Profile" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    navigate("/Login");
  };

  const handleDashboard = () => {
    const token = localStorage.getItem("jwtToken") || "";
    let role: string | undefined;
    if (token) {
      try {
        const d: any = jwtDecode(token);
        role =
          d["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
          d["role"];
      } catch {
        // invalid token, fall back
      }
    }
    if (role?.toLowerCase() === "admin") {
      navigate("/Admin");
    } else {
      navigate("/Elder");
    }
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: "#fff",
        color: "#0F172A",
        borderBottom: "1px solid rgba(15,23,42,0.08)",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography variant="h6" fontWeight={800} sx={{ color: "primary.main" }}>
          ELDER SYSTEM
        </Typography>

        {isMobile ? (
          <>
            <IconButton color="inherit" onClick={() => setOpen(true)}>
              <MenuIcon />
            </IconButton>
            <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
              <Box sx={{ width: 280 }} role="presentation" onClick={() => setOpen(false)}>
                <List>
                  {items.map((item) => (
                    <ListItem key={item.text} disablePadding>
                      <ListItemButton onClick={() => navigate(item.to)}>
                        <ListItemText primary={item.text} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                  <ListItem disablePadding>
                    <ListItemButton onClick={handleLogout}>
                      <ListItemText primary="Logout" />
                    </ListItemButton>
                  </ListItem>
                </List>
              </Box>
            </Drawer>
          </>
        ) : (
          <Box sx={{ display: "flex", gap: 2 }}>
            {items.map((item) => (
              <Button key={item.text} color="inherit" onClick={() => navigate(item.to)}>
                {item.text}
              </Button>
            ))}
            <Button variant="outlined" color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default ElderAppBar;
