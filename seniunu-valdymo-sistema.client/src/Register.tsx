import React, { useState } from 'react';
import './App.css';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import axios from 'axios';
import AppBar from "./AppBars/AnonymousAppBar";
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Footer from "./Footers/Footer";

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

    try {
      console.log('Submitting form:', formState);
      await axios.post('/api/Users/register', formState);
      alert('Registration sent!');
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed – check console for details.');
    }
  };

  return (
    <div>
      <AppBar />
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

    <form onSubmit={handleSubmit}>
      <TextField
        fullWidth
        name="name"
        label="Vardas"
        margin="normal"
        value={formState.name}
        onChange={handleChange("name")}
      />

      <TextField
        fullWidth
        name="lastName"
        label="Pavardė"
        margin="normal"
        value={formState.lastName}
        onChange={handleChange("lastName")}
      />

      <TextField
        fullWidth
        name="email"
        label="El. paštas"
        type="email"
        margin="normal"
        value={formState.email}
        onChange={handleChange("email")}
      />

      <TextField
        fullWidth
        name="password"
        label="Slaptažodis"
        type="password"
        margin="normal"
        value={formState.password}
        onChange={handleChange("password")}
      />

      {/* role select */}
      <Select
        fullWidth
        required
        name="role"
        value={formState.role}
        onChange={handleChange("role")}
        displayEmpty
        sx={{
          mt: 2,
        }}
      >
        <MenuItem value="elder">Seniūnas</MenuItem>
        <MenuItem value="admin">Koordinatorius</MenuItem>
      </Select>

      {/* course select */}
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
        sx={{ mt: 3, height: 45 }}
      >
        Registruotis
      </Button>
    </form>
    </CardContent>
    </Card>
      <Footer />
    </div>
    
  );
}

export default Register;
