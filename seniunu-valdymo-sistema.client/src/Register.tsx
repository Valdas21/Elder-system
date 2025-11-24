import React, { useState } from 'react';
import './App.css';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import axios from 'axios';
import AppBar from "./AppBars/AnonymousAppBar";
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

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
  role: 'elder',
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
      await axios.post('/api/register', formState);
      alert('Registration sent!');
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed – check console for details.');
    }
  };

  return (
    <div>
      <AppBar />
      <Card>
        <CardContent>
          <Typography variant="h3" id="registration">
            Registracija
          </Typography>
          <Typography margin={2}>
            Užpildykite visus registracijos laukus
          </Typography>

          {/* IMPORTANT: onSubmit on the form */}
          <form onSubmit={handleSubmit}>
            <div>
              <TextField
                name="name"
                margin="normal"
                label="Vardas"
                required
                value={formState.name}
                onChange={handleChange('name')}
              />
            </div>

            <div>
              <TextField
                name="lastName"
                margin="normal"
                label="Pavardė"
                required
                value={formState.lastName}
                onChange={handleChange('lastName')}
              />
            </div>

            <div>
              <TextField
                name="email"
                margin="normal"
                type="email"
                label="El. paštas"
                required
                value={formState.email}
                onChange={handleChange('email')}
              />
            </div>

            <div>
              <TextField
                name="password"
                margin="normal"
                label="Slaptažodis"
                type="password"
                required
                value={formState.password}
                onChange={handleChange('password')}
              />
            </div>

            <div>
              <Select
                labelId="role-label"
                id="role"
                name="role"
                value={formState.role}
                onChange={handleChange('role')}
                sx={{ mt: 2, minWidth: 200 }}
              >
                <MenuItem value="elder">Seniūnas</MenuItem>
                <MenuItem value="volunteer">Koordinatorius</MenuItem>
              </Select>
            </div>

            {/* If/when you add a course field in the UI, use: onChange={handleChange('course')} */}

            <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
              Registruotis
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Register;
