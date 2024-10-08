import React from 'react';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import EditNoteIcon from '@mui/icons-material/EditNote';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import GppBadIcon from '@mui/icons-material/GppBad';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';


export default function FloatingActionButton({ onClick, icon, width, height, justifyContent, alignItems }) {
  const getClassForIcon = (icon) => {
    switch (icon) {
      case 'agregar':
        return 'fab-agregar';
      case 'editar':
        return 'fab-editar';
      case 'borrar':
        return 'fab-borrar';
      case 'descargar':
        return 'fab-descargar';
      case 'fab-logout':
        return 'fab-logout';
      case 'volver':
        return 'fab-volver';
      default:
        return '';
    }
  };

  return (
    <div className='boton-circular'>
      <Fab
        className={getClassForIcon(icon)}
        aria-label={icon}
        onClick={onClick}
        style={{
          width: width || 50,
          height: height || 50,

        }}
      >
        {icon === 'agregar' && <AddIcon />}
        {icon === 'editar' && <EditNoteIcon />}
        {icon === 'borrar' && <DeleteForeverIcon />}
        {icon === 'descargar' && <DownloadForOfflineIcon />}
        {icon === 'logout' && <GppBadIcon />}
        {icon === 'volver' && <KeyboardReturnIcon />}
      </Fab>
    </div>
  );
}
