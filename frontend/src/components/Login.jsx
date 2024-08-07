import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import obtenerToken from '../services/obtenerToken.js';
import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';




// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

const Login = () => {


    //Setear mensaje de error
    const [mensajeDeError, setMensajeDeError] = useState(null);
    const [open, setOpen] = React.useState(false);
    const handleSubmit = async (event) => {
        event.preventDefault();
        setOpen(true);

        const data = new FormData(event.currentTarget);

        try {
            //se obtiene el token en caso de ser cuil y password correctos
            const token = await obtenerToken(data.get('cuil'), data.get('contrasenia'));

            //Guardar token en header authorization

            localStorage.setItem('jwt', `${token}`)
            
            setMensajeDeError(null);


        } catch (error) {
            setMensajeDeError("Cuil o contraseña incorrectos");
        } finally {
            setOpen(false);
        }
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            {
                mensajeDeError &&
                <Stack sx={{ width: '100%' }} spacing={2}>
                    <Alert variant="filled" severity="error">
                        {mensajeDeError}
                    </Alert>
                </Stack>
            }
            {
                open &&
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={open}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
            }
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: '#5CB85C' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Usuario
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="cuil"
                            label="Cuil"
                            name="cuil"
                            autoComplete="cuil"
                            autoFocus
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="contrasenia"
                            label="Contraseña"
                            type="password"
                            id="contrasenia"
                            autoComplete="current-password"
                        />

                        <Button
                           
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{
                                mt: 3,
                                mb: 2,
                                bgcolor: '#5CB85C', // Establecer el color de fondo
                                color: '#fff', // Establecer el color del texto
                            }}
                        >
                            Iniciar Sesión
                        </Button>
                        
                         
                        <Grid container>
                            <Grid item xs style={{ textAlign: 'center' }}>
                                <Link href="#" variant="body2">
                                    No recuerdo mi contraseña
                                </Link>
                            </Grid>

                        </Grid>
                    </Box>
                </Box>

            </Container>
        </ThemeProvider>
    );
}

export default Login