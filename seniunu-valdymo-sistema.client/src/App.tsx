import { useEffect, useState } from 'react';
import './App.css';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import axios from 'axios';

interface RegistrationFormProps {
    name: string;
    surname: string;
    email: string;
    password: string;
}
const initialFormState: RegistrationFormProps = {
    name: '',
    surname: '',
    email: '',
    password: ''
};


function App() {
    const [formState, setFormState] = useState<RegistrationFormProps>(initialFormState);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState({ ...formState, [name]: value });
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('/api/register', formState);
        } catch (error) {
            console.error('Registration failed:', error);
        }
    }

    return (
        <div>
            <Card>
                <CardContent>
                    <Typography variant="h3" id="registration">Registracija</Typography>
                    <Typography margin={2}>Užpildykite visus registracijos laukus</Typography>
                    <form>
                        <div>
                            <TextField margin='normal' label="Vardas" required value={formState.name} onChange={handleInputChange} />
                        </div>
                        <>
                        <TextField margin='normal' label="Pavardė" required value={formState.surname} onChange={handleInputChange} />
                        </>
                        <div>
                            <TextField margin='normal' type="email" label="El. paštas" required value={formState.email} onChange={handleInputChange} />
                        </div>
                        <div>
                            <TextField margin='normal' label="Slaptažodis" type="password" required value={formState.password} onChange={handleInputChange} />
                        </div>
                        <Button  variant="contained" color="primary">Registruotis</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
        
}

export default App;