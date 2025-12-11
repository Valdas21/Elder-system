import React, { useState } from 'react';
import './App.css';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Api from './axiosnew';
import AppBar from "./AppBars/AnonymousAppBar";
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Footer from "./Footers/Footer";
import Link from "@mui/material/Link";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

interface RegistrationFormProps {
  name: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  course: number;
}

const initialFormState: RegistrationFormProps = {
  name: '',
  lastName: '',
  email: '',
  password: '',
  role: '',
  course: 0,
};

type FieldName = keyof RegistrationFormProps;

function Register() {
  const [formState, setFormState] = useState<RegistrationFormProps>(initialFormState);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // One clean handler for all fields
  const handleChange =
    (field: FieldName) =>
    (
      e:
        | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        | SelectChangeEvent<string>
    ) => {
      const value = e.target.value;

      setFormState(prev => ({
        ...prev,
        [field]: field === 'course' ? Number(value) : value,
      }));
    };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      const payload = { ...formState };
      await Api.post('/api/Users/register', payload);
      setSuccessMsg('Registracija išsiųsta sėkmingai.');
      setFormState(initialFormState);
    } catch (error: any) {
      const apiMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Registracija nepavyko. Patikrinkite įvestis ir bandykite dar kartą.';
      setErrorMsg(apiMessage);
      console.error('Registration failed:', error);
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
        autoHideDuration={4000}
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

      <Card
        sx={{
          width: 450,
          margin: "80px auto",
          padding: "32px 24px",
          borderRadius: 3,
          boxShadow: 3,
        }}
      >
        <CardContent>
          <Typography variant="h4" sx={{ textAlign: "center", mb: 3 }}>
            Registracija
          </Typography>

          {/* Inline form-level error (optional, shows below title) */}
          {!!errorMsg && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMsg}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              required
              name="name"
              label="Vardas"
              margin="normal"
              value={formState.name}
              onChange={handleChange("name")}
            />

            <TextField
              fullWidth
              required
              name="lastName"
              label="Pavardė"
              margin="normal"
              value={formState.lastName}
              onChange={handleChange("lastName")}
            />

            <TextField
              fullWidth
              required
              name="email"
              label="El. paštas"
              type="email"
              margin="normal"
              value={formState.email}
              onChange={handleChange("email")}
            />

            <TextField
              fullWidth
              required
              name="password"
              label="Slaptažodis"
              type="password"
              margin="normal"
              value={formState.password}
              onChange={handleChange("password")}
            />

            <Select
              fullWidth
              required
              name="role"
              value={formState.role}
              onChange={handleChange("role")}
              displayEmpty
              sx={{ mt: 2 }}
            >
              <MenuItem value="elder">Seniūnas</MenuItem>
              <MenuItem value="admin">Koordinatorius</MenuItem>
            </Select>

            <Select
              fullWidth
              name="course"
              required
              value={formState.course.toString()}
              onChange={handleChange("course")}
              displayEmpty
              sx={{ mt: 2 }}
            >
              <MenuItem value={1}>Pirmas</MenuItem>
              <MenuItem value={2}>Antras</MenuItem>
              <MenuItem value={3}>Trečias</MenuItem>
              <MenuItem value={4}>Ketvirtas</MenuItem>
            </Select>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={submitting}
              sx={{ mt: 3, height: 45 }}
            >
              {submitting ? "Siunčiama..." : "Registruotis"}
            </Button>
          </form>

          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Jau turite paskyrą?{" "}
              <Link component={RouterLink} to="/login">
                Prisijunkite
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Footer />
    </div>
  );
}

export default Register;
