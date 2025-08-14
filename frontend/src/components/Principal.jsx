import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import {
  Box,
  Drawer,
  CssBaseline,
  AppBar as MuiAppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Tooltip,
  Stack,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LogoutIcon from '@mui/icons-material/Logout';
import HouseIcon from '@mui/icons-material/House';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GavelIcon from '@mui/icons-material/Gavel';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CampaignIcon from '@mui/icons-material/Campaign';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import InsertInvitationIcon from '@mui/icons-material/InsertInvitation';

import Formulario from './Formulario';
import Cronograma from "./Cronograma.jsx";
import AltaBajaModificion from './AltaBajaModificion.jsx';
import RestriccionesFechasInicioCursada from "../components/RestriccionesFechasInicioCursada.jsx";
import Home from "./Home.jsx";
import NuevoEvento from './NuevoEvento.jsx';
import ReporteCursos from "./ReporteCursosCC.jsx";
import CrearAviso from './CrearAviso.jsx';
import VersionReducidaGa from './VersionReducidaGA.jsx';
import VersionReducidaAdministradores from './VersionReducidaAdministradores.jsx';
import ABMReferentes from "./ABMReferentes.jsx"


import { getMyUser } from "../services/usuarios.service.js";

const drawerWidth = 260;

const menuItemsConfig = [
  { label: "Inicio", identifier: "Home", icon: <HouseIcon />, roles: ["ADM", "REF", 'GA'] },
  { label: "Nueva Cohorte", identifier: "Formulario", icon: <EditCalendarIcon />, roles: ["ADM", "REF", 'GA'] },
  { label: "Ver Calendario", identifier: "Calendario", icon: <CalendarMonthIcon />, roles: ["ADM", "REF", 'GA'] },
  { label: "Crear Evento", identifier: "Eventos", icon: <AddCircleOutlineIcon />, roles: ["ADM", "REF", 'GA'] },
  { label: "Reporte de Cursos", identifier: "ReporteCursosIdentifier", icon: <AssessmentIcon />, roles: ["ADM", "REF", 'GA'] },
  { label: "Administrar Entidades", identifier: "AltaBajaModificion", icon: <SettingsSuggestIcon />, roles: ["ADM"] },
  { label: "Restricciones Fechas", identifier: "RestriccionesFechasInicioCursada", icon: <GavelIcon />, roles: ["ADM"] },
  { label: "Crear Aviso", identifier: "CrearAviso", icon: <CampaignIcon />, roles: ["ADM"] },
  { label: "Version reducida GA", identifier: "VersionReducidaGa", icon: <InsertInvitationIcon />, roles: ['GA'] },
  { label: "Version reducida Administradores", identifier: "VersionReducidaAdministradores", icon: <InsertInvitationIcon />, roles: ['ADM'] },
  { label: "Administrar Cursos, Referentes y Áreas", identifier: "ABMReferentes", icon: <SettingsSuggestIcon />, roles: ["REF"] },

];

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.default,
    marginTop: theme.mixins.toolbar.minHeight,
    [theme.breakpoints.up('sm')]: {
      marginTop: '64px',
    },
    minHeight: `calc(100vh - ${theme.mixins.toolbar.minHeight}px)`,
    [theme.breakpoints.up('sm')]: {
      minHeight: 'calc(100vh - 64px)',
    },
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const AppBarStyled = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  boxShadow: theme.shadows[1],
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'space-between',
}));

export default function Principal() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(true);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState("Home");
  const [opcionesAMostrar, setOpcionesAMostrar] = useState([]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    (async () => {
      try {
        const res = await getMyUser();
        if (!isMounted) return;

        if (!res) {
          navigate('/login');
          return;
        }
        setUser(res);

        if (res.necesitaCbioContrasenia == "1") {
          navigate('/cambiarContrasenia');
          return;
        }

        const userRol = res.rol;
        const filteredOptions = menuItemsConfig.filter(item =>
          item.roles.includes(userRol)
        );
        setOpcionesAMostrar(filteredOptions);

        const currentOptionIsValid = filteredOptions.some(opt => opt.identifier === opcionSeleccionada);
        if (!currentOptionIsValid && filteredOptions.length > 0) {
          setOpcionSeleccionada(filteredOptions.find(opt => opt.identifier === "Home") ? "Home" : filteredOptions[0].identifier);
        } else if (filteredOptions.length === 0) {
          console.warn("Usuario no tiene opciones de menú válidas.");
        }

      } catch (error) {
        if (!isMounted) return;
        console.error("Error fetching user:", error);
        navigate('/login');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  const handleListItemClick = (identifier) => {
    setOpcionSeleccionada(identifier);
    if (window.innerWidth < theme.breakpoints.values.sm) {
      handleDrawerClose();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    sessionStorage.clear();
    navigate('/login');
  };

  const mostrarOpcion = () => {
    if (loading && !user) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 128px)' }}>
          <CircularProgress size={60} />
        </Box>
      );
    }
    switch (opcionSeleccionada) {
      case "Formulario": return <Formulario />;
      case "Calendario": return <Cronograma />;
      case "AltaBajaModificion": return <AltaBajaModificion />;
      case "RestriccionesFechasInicioCursada": return <RestriccionesFechasInicioCursada />;
      case "Eventos": return <NuevoEvento />;
      case "ReporteCursosIdentifier": return <ReporteCursos />;
      case "CrearAviso": return <CrearAviso />;
      case "VersionReducidaGa": return <VersionReducidaGa />;
      case "VersionReducidaAdministradores": return <VersionReducidaAdministradores />;
      case "ABMReferentes": return <ABMReferentes />;

      case "Home":
      default: return <Home nombre={user?.nombre} setOpcionSeleccionada={setOpcionSeleccionada} />;
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBarStyled position="fixed" open={open}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{ mr: 1, ...(open && { display: 'none' }) }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {opcionesAMostrar.find(opt => opt.identifier === opcionSeleccionada)?.label || 'InscribCórdoba'}
            </Typography>
          </Stack>

          <Typography variant="h5" noWrap component="div" sx={{ fontWeight: 600, flexGrow: 1, textAlign: 'center' }} >
            InscribCórdoba
          </Typography>

          <Stack direction="row" alignItems="center" spacing={1}>
            {user && (
              <Typography sx={{ display: { xs: 'none', md: 'block' } }}>
                Hola, {user.nombre} ({user.rol})
              </Typography>
            )}
            <Tooltip title="Cerrar Sesión">
              <IconButton color="inherit" onClick={handleLogout}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBarStyled>

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: 'none',
            boxShadow: theme.shadows[2]
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <Typography variant="h6" sx={{ ml: 1, flexGrow: 1, fontWeight: 600 }}>Menú</Typography>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List sx={{ flexGrow: 1, py: 1 }}>
          {opcionesAMostrar.map((item) => (
            <ListItem key={item.identifier} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                onClick={() => handleListItemClick(item.identifier)}
                selected={opcionSeleccionada === item.identifier}
                sx={{
                  minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5, py: 1.2, mb: 0.5, borderRadius: 1, mx: 1.5,
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.action.selected, fontWeight: 'fontWeightBold',
                    '& .MuiListItemIcon-root, & .MuiListItemText-primary': { color: theme.palette.primary.main, }
                  },
                  '&:hover': { backgroundColor: theme.palette.action.hover, }
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', color: opcionSeleccionada === item.identifier ? theme.palette.primary.main : theme.palette.text.secondary }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: opcionSeleccionada === item.identifier ? '600' : '400', fontSize: '0.95rem' }}
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ mb: 2, mt: 'auto' }}>
          <Divider sx={{ mx: 1.5, my: 1 }} />
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton onClick={handleLogout} sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5, py: 1.2, borderRadius: 1, mx: 1.5, color: theme.palette.error.main, '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.08)', } }} >
              <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', color: 'inherit' }} >
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Cerrar Sesión" sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </ListItem>
        </Box>
      </Drawer>

      <Main open={open}>
        {mostrarOpcion()}
      </Main>
    </Box>
  );
}