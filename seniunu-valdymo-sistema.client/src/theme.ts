import { createTheme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";

const ink = "#0F172A";
const plum = "#7C3AED";
const coral = "#F97316";
const mist = "#F3F4F6";
const leaf = "#10B981";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: plum,
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: coral,
      contrastText: "#0B0B0B",
    },
    success: {
      main: leaf,
    },
    error: {
      main: "#EF4444",
    },
    warning: {
      main: "#F59E0B",
    },
    info: {
      main: "#3B82F6",
    },
    text: {
      primary: ink,
      secondary: "#475569",
    },
    background: {
      default: mist,
      paper: "#FFFFFF",
    },
    divider: alpha(ink, 0.08),
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: `"Inter", system-ui, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji"`,
    h1: { fontWeight: 800, letterSpacing: "-0.02em" },
    h2: { fontWeight: 800, letterSpacing: "-0.02em" },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600, letterSpacing: ".01em" },
    subtitle1: { fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme: any) => ({
        html: {
          scrollPaddingTop: `${theme?.mixins?.toolbar?.minHeight ?? 64}px`,
        },
        body: {
          height: "100%",
          background:
            `radial-gradient(900px 400px at 15% -200px, ${alpha("#7C3AED", 0.05)} 0%, transparent 60%),
             radial-gradient(900px 400px at 110% -100px, ${alpha("#F97316", 0.05)} 0%, transparent 60%), ${mist}`,
          backgroundAttachment: "fixed",
          color: ink,
        },
        "::selection": {
          backgroundColor: alpha(plum, 0.25),
        },
        "*::-webkit-scrollbar": { height: 10, width: 10 },
        "*::-webkit-scrollbar-track": {
          background: alpha(ink, 0.05),
        },
        "*::-webkit-scrollbar-thumb": {
          backgroundColor: alpha(ink, 0.2),
          borderRadius: 999,
          border: `2px solid ${alpha(ink, 0.05)}`,
        },
        a: {
          color: plum,
          textDecorationColor: alpha(plum, 0.35),
          textUnderlineOffset: "3px",
          "&:hover": { textDecorationColor: alpha(plum, 0.6) },
        },
        img: {
          maxWidth: "100%",
          height: "auto",
          display: "block",
        },
        ".page-container": {
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "24px",
        },
        "@media (max-width: 768px)": {
          ".page-container": { padding: "16px" },
        },
      }),
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          color: ink,
          borderBottom: `1px solid ${alpha(ink, 0.08)}`,
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 64,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
        },
        containedPrimary: {
          boxShadow: `0 8px 24px ${alpha(plum, 0.25)}`,
          "&:hover": { boxShadow: `0 12px 28px ${alpha(plum, 0.35)}` },
        },
        outlined: {
          borderColor: alpha(ink, 0.12),
          "&:hover": { borderColor: alpha(ink, 0.3), backgroundColor: alpha(ink, 0.02) },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          border: `1px solid ${alpha(ink, 0.08)}`,
          boxShadow: `0 8px 30px ${alpha(ink, 0.08)}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 18,
        },
        outlined: {
          borderColor: alpha(ink, 0.08),
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFF",
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha(plum, 0.4),
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: plum,
            boxShadow: `0 0 0 4px ${alpha(plum, 0.15)}`,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        outlined: {
          borderColor: alpha(ink, 0.15),
          backgroundColor: alpha(plum, 0.06),
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: alpha(ink, 0.08),
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          backgroundColor: alpha(plum, 0.06),
        },
      },
    },
  },
});