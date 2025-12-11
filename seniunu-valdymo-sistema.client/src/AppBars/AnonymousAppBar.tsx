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
import HomeOutlined from "@mui/icons-material/HomeOutlined";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import LoginOutlined from "@mui/icons-material/LoginOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";

export default function AnonymousAppBar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const items = [
    { text: "Pradžia", icon: <HomeOutlined />, to: "/" },
    { text: "Apie", icon: <InfoOutlined />, to: "/about" },
    { text: "Formos", icon: <DescriptionOutlined />, to: "/Forms" }, // added Forms
    { text: "Prisijungti", icon: <LoginOutlined />, to: "/login" },
  ];

  return (
    <AppBar position="fixed" elevation={0}>
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
                        {item.icon}
                        <ListItemText sx={{ ml: 2 }} primary={item.text} />
                      </ListItemButton>
                    </ListItem>
                  ))}
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
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}