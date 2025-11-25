import React, { useState } from 'react';
import './App.css';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import axios from 'axios';
import AppBar from "./AppBars/AnonymousAppBar";
import Footer from "./Footers/Footer";
import { jwtDecode, type JwtPayload } from 'jwt-decode';
import { useNavigate } from "react-router-dom";


interface LoginResponse {
  token: string;
}

interface LoginFormProps {
  email: string;
  password: string;
}

const initialFormState: LoginFormProps = {
  email: '',
  password: ''
};

type FieldName = keyof LoginFormProps;

function Login() {
  const [formState, setFormState] = useState<LoginFormProps>(initialFormState);
  const navigate = useNavigate();
  // One clean handler for all fields
  const handleChange =
    (field: FieldName) =>
    (
      e:
        | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const value = e.target.value;

      setFormState(prev => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      console.log('Submitting form:', formState);
      const response = await axios.post<LoginResponse>('/api/Users/login', formState);
     
        const token  = response.data;
        console.log('Received JWT token:', token);
        localStorage.setItem('jwtToken', token);

        const decoded = jwtDecode<JwtPayload>(token);
        console.log('User info:', decoded);
        const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        if(role === 'elder'){
            navigate('/Elder');
        }else if(role === 'admin'){
            navigate('/Admin');
        }else{
            alert('Unknown role – access denied.');
        }
        
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed – check console for details.');
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
      Prisijungimas
    </Typography>

    <form onSubmit={handleSubmit}>
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
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 3, height: 45 }}
      >
        Prisijungti
      </Button>
    </form>
    </CardContent>
    </Card>
      <Footer />
    </div>
    
  );
}

export default Login;
