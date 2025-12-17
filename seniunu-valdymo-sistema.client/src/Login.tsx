import React, { useState } from 'react';
import './App.css';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Api from './axiosnew';
import AppBar from "./AppBars/AnonymousAppBar";
import Footer from "./Footers/Footer";
import { jwtDecode, type JwtPayload } from 'jwt-decode';
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { Link as RouterLink } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";


interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

interface LoginFormProps {
  email: string;
  password: string;
}

const initialFormState: LoginFormProps = {
  email: '',
  password: '',
};

type FieldName = keyof LoginFormProps;

function Login() {
  const [formState, setFormState] = useState<LoginFormProps>(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange =
    (field: FieldName) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setFormState(prev => ({ ...prev, [field]: value }));
    };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      console.log('Submitting form:', formState);
      console.log(import.meta.env.VITE_API_URL)
      const response = await Api.post<LoginResponse>('/api/Users/login', formState);
      
      

      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);

      const decoded = jwtDecode<JwtPayload>(response.data.accessToken);
      const role = (decoded as any)['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      setSuccessMsg('Sėkmingai prisijungėte.');

      // small delay so user can see success
      setTimeout(() => {
        if (role === 'elder') {
          navigate('/Elder');
        } else if (role === 'admin') {
          navigate('/Admin');
        } else {
          navigate('/');
        }
      }, 300);
    } catch (error: any) {
      const apiMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Prisijungimas nepavyko. Patikrinkite el. paštą ir slaptažodį.';
      setErrorMsg(apiMessage);
      console.error('Login failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <AppBar />

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMsg}
        autoHideDuration={3000}
        onClose={() => setSuccessMsg(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setSuccessMsg(null)} sx={{ width: "100%" }}>
          {successMsg}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!errorMsg}
        autoHideDuration={6000}
        onClose={() => setErrorMsg(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setErrorMsg(null)} sx={{ width: "100%" }}>
          {errorMsg}
        </Alert>
      </Snackbar>

      <Box className="page-container">
        <Card
          sx={{
            maxWidth: 520,
            mx: "auto",
            mt: { xs: 3, md: 6 },
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            boxShadow: 3,
            transform: "translateY(0)",
            transition: "transform 300ms ease, box-shadow 300ms ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: (t) => `0 12px 40px ${t.palette.action.disabledBackground}`,
            },
          }}
        >
          <CardContent>
            <Typography variant="h4" sx={{ textAlign: "center", mb: 3 }}>
              Prisijungimas
            </Typography>

            {/* Inline error under title */}
            {!!errorMsg && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMsg}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: "grid", gap: 2 }}>
                <TextField
                  fullWidth
                  name="email"
                  label="El. paštas"
                  type="email"
                  value={formState.email}
                  onChange={handleChange("email")}
                  autoComplete="email"
                  required
                />

                <TextField
                  fullWidth
                  name="password"
                  label="Slaptažodis"
                  type="password"
                  value={formState.password}
                  onChange={handleChange("password")}
                  autoComplete="current-password"
                  required
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ height: 45 }}
                  disabled={submitting}
                >
                  {submitting ? "Jungiama..." : "Prisijungti"}
                </Button>
              </Box>
            </form>

            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Neturite paskyros?{" "}
                <Link component={RouterLink} to="/Register">
                  Registruokitės
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
      <Footer />
    </div>
  );
}

export default Login;
