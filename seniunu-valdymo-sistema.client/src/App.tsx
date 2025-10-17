import { useEffect, useState } from 'react';
import './App.css';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

interface RegistrationFormProps {
    name: string;
    email: string;
    password: string;
}


function App() {
    return (
        <div>
            <Card>
                <CardContent>
                    <Typography variant="h3" id="registration">Registracija</Typography>
                    <Typography margin={2}>Užpildykite visus registracijos laukus</Typography>
                    <form>
                        <div>
                            <TextField margin='normal' label="Vardas" required/>
                        </div>
                        <>
                        <TextField margin='normal' label="Pavardė" required />
                        </>
                        <div>
                            <TextField margin='normal' type="email" label="El. paštas" required />
                        </div>
                        <div>
                            <TextField margin='normal' label="Slaptažodis" type="password" required />
                        </div>
                        <Button type="submit" variant="contained" color="primary">Registruotis</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
        

    
}

export default App;