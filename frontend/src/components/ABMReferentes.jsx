// src/components/AltaBajaModificacion.jsx (versión simplificada)

import React, { useEffect, useState, useCallback } from "react";
import Titulo from "./fonts/TituloPrincipal";
import Autocomplete from "./UIElements/Autocomplete";
import { getCursos } from "../services/cursos.service.js";
import { getMinisterios } from "../services/ministerios.service.js";
import { getAreas } from "../services/areas.service.js";
// Importaciones de servicios necesarias solo para los selects de Cursos
import { getTiposCapacitacion } from "../services/tiposCapacitacion.service.js";
import { getMediosInscripcion } from "../services/mediosInscripcion.service.js";
import { getPlataformasDictado } from "../services/plataformasDictado.service.js";
// Importaciones de servicios para las operaciones de ABM
import { updateRow } from "../services/updateRow.js";
import { deleteRow } from "../services/deleteRow.js";

// Importaciones de Material UI
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { DataGrid } from "@mui/x-data-grid";
import Box from '@mui/material/Box';
import { Divider, FormControl, InputLabel, MenuItem, Select as MuiSelect, Button as MuiButton } from '@mui/material';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import MuiTextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';

// Importaciones personalizadas y de utilidades
import BotonCircular from "./UIElements/BotonCircular.jsx";
import { descargarExcel } from "../services/excel.service.js";
import { useNavigate } from "react-router-dom";

const AltaBajaModificion = () => {
    const navigate = useNavigate();
    // Opciones reducidas a solo las necesarias
    const options = ["Cursos", "Ministerios", "Áreas"];

    const convertirAPropiedadConfig = (opcion) => {
        switch (opcion) {
            case 'Cursos': return 'cursos';
            case "Ministerios": return 'ministerios';
            case "Áreas": return 'areas';
            default: return '';
        }
    }

    // Estados principales del componente
    const [selectOption, setSelectOption] = useState("");
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [configuraciones, setConfiguraciones] = useState({});

    // Estados para almacenar datos de selects (necesarios para el modal de edición de Cursos)
    const [ministeriosDataState, setMinisteriosDataState] = useState([]);
    const [areasDataState, setAreasDataState] = useState([]);
    const [tiposCapacitacionesDataState, setTiposCapacitacionesDataState] = useState([]);
    const [mediosInscripcionDataState, setMediosInscripcionDataState] = useState([]);
    const [plataformasDictadoDataState, setPlataformasDictadoDataState] = useState([]);

    // Estado para el filtro de la DataGrid
    const [filtroGeneralInput, setFiltroGeneralInput] = useState("");

    // Estados para el modal de edición
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [currentEditingRow, setCurrentEditingRow] = useState(null);
    const [editedRowData, setEditedRowData] = useState({});

    // Estados para el modal de confirmación de eliminación
    const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
    const [rowToDelete, setRowToDelete] = useState(null);

    // Efecto para cargar datos iniciales
    useEffect(() => {
        setCargando(true);
        (async () => {
            try {
                // Llamadas a servicios reducidas a las estrictamente necesarias
                const [
                    cursosRes, ministeriosRes, areasRes,
                    tiposCapacitacionesRes, mediosInscripcionRes, plataformasDictadoRes,
                ] = await Promise.all([
                    getCursos(), getMinisterios(), getAreas(),
                    getTiposCapacitacion(), getMediosInscripcion(), getPlataformasDictado(),
                ]);

                // Guardar datos necesarios para los selects del modal de edición
                setMinisteriosDataState(ministeriosRes);
                setAreasDataState(areasRes);
                setTiposCapacitacionesDataState(tiposCapacitacionesRes);
                setMediosInscripcionDataState(mediosInscripcionRes);
                setPlataformasDictadoDataState(plataformasDictadoRes);

                // Configuración para cada opción de la DataGrid
                setConfiguraciones({
                    cursos: {
                        columns: [
                            { field: 'cod', headerName: 'Código', width: 120 },
                            { field: 'nombre', headerName: 'Nombre', flex: 1, editable: true },
                            { field: 'cupo', headerName: 'Cupo', width: 100, type: 'number', editable: true },
                            {
                                field: 'plataformaDictado', headerName: 'Plataforma de dictado', width: 180, editable: true,
                                type: 'select', options: plataformasDictadoRes.map(e => ({ value: e.nombre, label: e.nombre })),
                            },
                            {
                                field: 'medioInscripcion', headerName: 'Medio de inscripción', width: 180, editable: true,
                                type: 'select', options: mediosInscripcionRes.map(e => ({ value: e.nombre, label: e.nombre })),
                            },
                            {
                                field: 'tipoCapacitacion', headerName: 'Tipo de capacitación', width: 180, editable: true,
                                type: 'select', options: tiposCapacitacionesRes.map(e => ({ value: e.nombre, label: e.nombre })),
                            },
                            { field: 'horas', headerName: 'Horas', width: 100, type: 'number', editable: true },
                            { field: 'area', headerName: 'Área', width: 180 },
                            { field: 'ministerio', headerName: 'Ministerio', width: 180 },
                            {
                                field: 'esVigente', headerName: 'Vigente', width: 130, editable: true,
                                type: 'booleanSelect', options: [{ value: "Si", label: "Si" }, { value: "No", label: "No" }],
                            },
                            {
                                field: 'tiene_evento_creado', headerName: 'Evento Creado', width: 180, editable: true,
                                type: 'booleanSelect', options: [{ value: "Si", label: "Si" }, { value: "No", label: "No" }],
                            }
                        ],
                        rows: cursosRes.map((e) => ({
                            id: e.cod, cod: e.cod, nombre: e.nombre, cupo: e.cupo,
                            plataformaDictado: e.detalle_plataformaDictado?.nombre || 'N/A',
                            medioInscripcion: e.detalle_medioInscripcion?.nombre || 'N/A',
                            tipoCapacitacion: e.detalle_tipoCapacitacion?.nombre || 'N/A',
                            horas: e.cantidad_horas, area: e.detalle_area?.nombre || 'N/A',
                            ministerio: e.detalle_area?.detalle_ministerio?.nombre || 'N/A',
                            esVigente: e.esVigente ? "Si" : "No",
                            tiene_evento_creado: e.tiene_evento_creado ? "Si" : "No",
                        }))
                    },
                    ministerios: {
                        columns: [
                            { field: 'cod', headerName: 'Código', flex: 1, editable: false },
                            { field: 'nombre', headerName: 'Nombre', flex: 1, editable: true },
                            {
                                field: 'esVigente', headerName: 'Vigente', width: 180, editable: true,
                                type: 'booleanSelect', options: [{ value: "Si", label: "Si" }, { value: "No", label: "No" }],
                            }
                        ],
                        rows: ministeriosRes.map((e) => ({ id: e.cod, cod: e.cod, nombre: e.nombre, esVigente: e.esVigente ? "Si" : "No" }))
                    },
                    areas: {
                        columns: [
                            { field: 'cod', headerName: 'Código', flex: 1, editable: false },
                            { field: 'nombre', headerName: 'Nombre', flex: 1, editable: true },
                            { field: 'ministerio', headerName: 'Ministerio', flex: 1 },
                            {
                                field: 'esVigente', headerName: 'Vigente', width: 180, editable: true,
                                type: 'booleanSelect', options: [{ value: "Si", label: "Si" }, { value: "No", label: "No" }],
                            }
                        ],
                        rows: areasRes.map((e) => ({ id: e.cod, cod: e.cod, nombre: e.nombre, ministerio: e.detalle_ministerio?.nombre || 'N/A', esVigente: e.esVigente ? "Si" : "No" }))
                    }
                });
            } catch (error) {
                console.error("Error al cargar datos iniciales:", error);
                setError(error.message || "Error al cargar los datos iniciales.");
            } finally {
                setCargando(false);
            }
        })();
    }, []);

    // Efectos para cerrar automáticamente los carteles de alerta
    useEffect(() => {
        if (success) { const timer = setTimeout(() => setSuccess(false), 3000); return () => clearTimeout(timer); }
    }, [success]);

    useEffect(() => {
        if (error) { const timer = setTimeout(() => setError(null), 3000); return () => clearTimeout(timer); }
    }, [error]);

    // Handlers para el Modal de Edición
    const handleOpenEditModal = useCallback((row) => {
        setCurrentEditingRow(row);
        setEditedRowData({ ...row });
        setEditModalOpen(true);
    }, []);

    const handleEditModalClose = useCallback(() => {
        setEditModalOpen(false);
        setCurrentEditingRow(null);
        setEditedRowData({});
    }, []);

    const handleEditInputChange = useCallback((event) => {
        const { name, value } = event.target;
        setEditedRowData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSaveChanges = async () => {
        if (!currentEditingRow || !editedRowData) return;
        const propiedadConfig = convertirAPropiedadConfig(selectOption);
        setCargando(true);
        setError(null);
        setSuccess(false);

        try {
            const datosParaEnviar = { ...editedRowData };

            if (propiedadConfig === 'cursos') {
                datosParaEnviar.codPlataformaDictado = plataformasDictadoDataState.find(p => p.nombre === editedRowData.plataformaDictado)?.cod;
                datosParaEnviar.codMedioInscripcion = mediosInscripcionDataState.find(m => m.nombre === editedRowData.medioInscripcion)?.cod;
                datosParaEnviar.codTipoCapacitacion = tiposCapacitacionesDataState.find(t => t.nombre === editedRowData.tipoCapacitacion)?.cod;
                datosParaEnviar.codArea = areasDataState.find(a => a.nombre === editedRowData.area)?.cod;
            } else if (propiedadConfig === 'areas') {
                datosParaEnviar.codMinisterio = ministeriosDataState.find(m => m.nombre === editedRowData.ministerio)?.cod
            } 


            if (datosParaEnviar.hasOwnProperty('esVigente')) datosParaEnviar.esVigente = editedRowData.esVigente === "Si";
            if (datosParaEnviar.hasOwnProperty('tiene_evento_creado')) datosParaEnviar.tiene_evento_creado = editedRowData.tiene_evento_creado === "Si";

            if (currentEditingRow.cod && !datosParaEnviar.cod) datosParaEnviar.cod = currentEditingRow.cod;

            await updateRow(datosParaEnviar, selectOption);
            updateRowDeConfiguraciones(propiedadConfig, currentEditingRow.id, editedRowData);
            setSuccess("Registro actualizado correctamente.");
            handleEditModalClose();

        } catch (err) {
            console.error("Error al guardar cambios:", err);
            setError(err.response?.data?.message || err.message || "Error al guardar los cambios.");
        } finally {
            setCargando(false);
        }
    };

    // Handlers para el Modal de Confirmación de Eliminación
    const handleOpenConfirmDeleteModal = useCallback((row) => {
        setRowToDelete(row);
        setConfirmDeleteModalOpen(true);
    }, []);

    const handleCloseConfirmDeleteModal = useCallback(() => {
        setConfirmDeleteModalOpen(false);
        setRowToDelete(null);
    }, []);

    const handleConfirmDelete = async () => {
        if (!rowToDelete) return;
        const propiedadConfig = convertirAPropiedadConfig(selectOption);
        setCargando(true);
        setError(null);
        setSuccess(false);

        try {
            await deleteRow(rowToDelete.id, selectOption);
            deleteRowDeConfiguraciones(propiedadConfig, rowToDelete.id);
            setSuccess("Registro eliminado correctamente.");

        } catch (error) {
            console.error("Error al borrar:", error);
            setError(error.response?.data?.message || error.message || "Error al eliminar el registro.");
        } finally {
            setCargando(false);
            handleCloseConfirmDeleteModal();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Definición de la columna de acciones (Editar/Borrar)
    const actionColumn = {
        field: 'Accion', headerName: 'Acciones', width: 120, sortable: false, filterable: false, disableColumnMenu: true,
        renderCell: (params) => (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, width: '100%' }}>
                <Tooltip title="Editar" placement="top">
                    <IconButton onClick={() => handleOpenEditModal(params.row)} size="small" disabled={cargando}>
                        <BotonCircular icon="editar" height={30} width={30} isIconButton />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Borrar" placement="top">
                    <IconButton onClick={() => handleOpenConfirmDeleteModal(params.row)} size="small" disabled={cargando}>
                        <BotonCircular icon="borrar" height={30} width={30} isIconButton />
                    </IconButton>
                </Tooltip>
            </Box>
        ),
    };

    // Funciones para actualizar el estado local de la DataGrid
    const deleteRowDeConfiguraciones = useCallback((propiedad, id) => {
        setConfiguraciones((prev) => {
            if (!prev[propiedad]) return prev;
            return { ...prev, [propiedad]: { ...prev[propiedad], rows: prev[propiedad].rows.filter(row => row.id !== id) } };
        });
    }, []);

    const updateRowDeConfiguraciones = useCallback((propiedad, originalId, newData) => {
        setConfiguraciones((prev) => {
            if (!prev[propiedad]) return prev;
            return {
                ...prev, [propiedad]: {
                    ...prev[propiedad], rows: prev[propiedad].rows.map(row =>
                        row.id === originalId ? { ...row, ...newData, id: newData.cod || originalId } : row
                    )
                }
            };
        });
    }, []);

    // Handler para el Autocomplete de selección de opción
    const handleSelectOption = useCallback((value) => {
        setSelectOption(value || "");
        setFiltroGeneralInput("");
        setError(null);
        setSuccess(false);
    }, []);

    // Handler para descargar Excel
    const handleDescargarExcel = async () => {
        const propiedad = convertirAPropiedadConfig(selectOption);
        if (configuraciones[propiedad]?.rows.length > 0) {
            const filasParaExportar = aplicarFiltroGeneral(configuraciones[propiedad].rows, configuraciones[propiedad].columns);
            if (filasParaExportar.length > 0) {
                await descargarExcel(filasParaExportar, configuraciones[propiedad].columns, `Reporte_${selectOption.replace(/\s/g, '_')}`);
            } else { setError("No hay datos que coincidan con el filtro actual para exportar."); }
        } else { setError("No hay datos para exportar en la selección actual."); }
    };

    // Handler para el botón de Agregar (navega a las rutas de alta)
    const handleAgregar = async () => {
        switch (selectOption) {
            case 'Cursos': navigate('/cursos/alta'); break;
            case "Ministerios": navigate('/ministerios/alta'); break;
            case "Áreas": navigate("/areas/alta"); break;
            default: break;
        }
    };

    // Función para filtrar la DataGrid
    const aplicarFiltroGeneral = (rowsOriginales, columnasVisibles) => {
        if (!filtroGeneralInput.trim()) return rowsOriginales;
        const filtro = filtroGeneralInput.toLowerCase().trim();
        return rowsOriginales.filter(row =>
            columnasVisibles.some(col => {
                if (col.field === 'Accion') return false;
                const val = row[col.field];
                return val != null ? String(val).toLowerCase().includes(filtro) : false;
            })
        );
    };

    // Cálculo de filas y columnas para la DataGrid
    const propiedadConfigSeleccionada = convertirAPropiedadConfig(selectOption);
    const configuracionActual = configuraciones[propiedadConfigSeleccionada];
    const columnasActuales = configuracionActual?.columns || [];
    const filasOriginales = configuracionActual?.rows || [];
    const filasFiltradas = aplicarFiltroGeneral(filasOriginales, columnasActuales);

    // Renderizado del componente
    return (
        <>
            {error && <Alert variant="filled" severity="error" sx={{ width: '100%', mb: 2, position: 'sticky', top: 0, zIndex: 1200 }} onClose={() => setError(null)}>{error}</Alert>}
            {success && <Alert variant="filled" severity="success" sx={{ width: '100%', mb: 2, position: 'sticky', top: 0, zIndex: 1200 }} onClose={() => setSuccess(false)}>{typeof success === 'string' ? success : "Operación exitosa"}</Alert>}
            {cargando && <Backdrop sx={{ color: '#00519C', zIndex: (theme) => theme.zIndex.drawer + 10 }} open={cargando}><CircularProgress color="inherit" /></Backdrop>}

            <div className="container-abm" style={{ padding: '20px' }}>
                <Titulo className="titulo-principal" texto="Alta, Baja y Modificación" />
                <Divider className="divider" sx={{ mb: 2, borderBottomWidth: 2, borderColor: 'black', mt: 2 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                    <Autocomplete options={options} label="Seleccione una Opción" value={selectOption} getValue={handleSelectOption} sx={{ minWidth: 300, flexGrow: 1 }} />
                    {selectOption && (
                        <Box className="btn" sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Descargar Excel" placement="top">
                                <IconButton onClick={handleDescargarExcel} color="primary" size="large" disabled={filasFiltradas.length === 0 || cargando}>
                                    <BotonCircular icon="descargar" height={40} width={40} isIconButton />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Agregar Nuevo" placement="top">
                                <IconButton onClick={handleAgregar} color="primary" size="large" disabled={cargando}>
                                    <BotonCircular icon="agregar" height={40} width={40} isIconButton />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}
                </Box>

                {!selectOption && !cargando && <Alert severity="info" sx={{ mt: 2, mb: 2 }}>Seleccione una opción para cargar los datos.</Alert>}

                {selectOption && (
                    <MuiTextField fullWidth variant="outlined" label={`Filtrar en ${selectOption}...`} value={filtroGeneralInput} onChange={(e) => setFiltroGeneralInput(e.target.value)}
                        sx={{ mb: 2, mt: 1 }} InputProps={{
                            endAdornment: filtroGeneralInput && (<IconButton onClick={() => setFiltroGeneralInput('')} edge="end" size="small"><CloseIcon /></IconButton>)
                        }}
                        disabled={cargando} />
                )}

                {selectOption && configuracionActual && !cargando && (
                    <Box sx={{ height: 'calc(100vh - 350px)', minHeight: 400, width: '100%' }}>
                        <DataGrid
                            columns={[...columnasActuales, actionColumn]}
                            rows={filasFiltradas}
                            pageSizeOptions={[10, 25, 50, 100]}
                            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                            density="compact"
                            getRowId={(row) => row.id || row.cod}
                            sx={{ '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold' } }}
                            localeText={{ noRowsLabel: 'No hay filas para mostrar', MuiTablePagination: { labelRowsPerPage: 'Filas por página:', labelDisplayedRows: ({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}` }, toolbarDensity: 'Densidad', toolbarFilters: 'Filtros', toolbarColumns: 'Columnas' }}
                            loading={cargando}
                        />
                    </Box>
                )}
                {selectOption && !configuracionActual && !cargando && <Alert severity="warning" sx={{ mt: 2 }}>No hay configuración para "{selectOption}".</Alert>}
                {selectOption && configuracionActual && filasFiltradas.length === 0 && filtroGeneralInput && !cargando && <Alert severity="info" sx={{ mt: 2 }}>No se encontraron resultados para "{filtroGeneralInput}" en {selectOption}.</Alert>}
                {selectOption && configuracionActual && filasOriginales.length === 0 && !filtroGeneralInput && !cargando && <Alert severity="info" sx={{ mt: 2 }}>No hay datos disponibles para {selectOption}.</Alert>}
            </div>

            {/* Modal de Edición General */}
            {editModalOpen && currentEditingRow && configuracionActual && (
                <Dialog open={editModalOpen} onClose={handleEditModalClose} maxWidth="md" fullWidth>
                    <DialogTitle>
                        Editar {selectOption.slice(0, -1)}: {currentEditingRow.nombre || currentEditingRow.cod}
                        <IconButton aria-label="close" onClick={handleEditModalClose} sx={{ position: 'absolute', right: 8, top: 8 }}><CloseIcon /></IconButton>
                    </DialogTitle>
                    <DialogContent dividers>
                        <Box component="form" noValidate autoComplete="off" sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 2, p: 1 }}>
                            {columnasActuales.filter(col => col.editable).map(col => {
                                const commonProps = {
                                    key: col.field, name: col.field, label: col.headerName,
                                    value: editedRowData[col.field] ?? '', onChange: handleEditInputChange,
                                    fullWidth: true, variant: "outlined", margin: "dense",
                                    disabled: col.editable === false,
                                };
                                if ((col.type === 'booleanSelect' || col.type === 'select') && col.options) {
                                    return (
                                        <FormControl {...commonProps} variant="outlined">
                                            <InputLabel>{col.headerName}</InputLabel>
                                            <MuiSelect name={col.field} value={editedRowData[col.field] ?? ''} label={col.headerName} onChange={handleEditInputChange}>
                                                {col.options.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                                            </MuiSelect>
                                        </FormControl>
                                    );
                                } else {
                                    return <MuiTextField {...commonProps} type={col.type === 'number' ? 'number' : 'text'} />;
                                }
                            })}
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: '16px 24px' }}>
                        <MuiButton onClick={handleEditModalClose} color="secondary">Cancelar</MuiButton>
                        <MuiButton onClick={handleSaveChanges} variant="contained" color="primary" disabled={cargando}>
                            {cargando ? <CircularProgress size={24} color="inherit" /> : "Guardar Cambios"}
                        </MuiButton>
                    </DialogActions>
                </Dialog>
            )}

            {/* Modal de Confirmación de Eliminación */}
            {confirmDeleteModalOpen && rowToDelete && (
                <Dialog open={confirmDeleteModalOpen} onClose={handleCloseConfirmDeleteModal} maxWidth="xs" fullWidth>
                    <DialogTitle sx={{ backgroundColor: 'error.main', color: 'white' }}>Confirmar Eliminación</DialogTitle>
                    <DialogContent>
                        <DialogContentText sx={{ pt: 2 }}>
                            ¿Está seguro de que desea eliminar el registro: <strong>{rowToDelete.nombre || rowToDelete.cod}</strong>?
                            <br />Esta acción no se puede deshacer.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ p: '16px 24px' }}>
                        <MuiButton onClick={handleCloseConfirmDeleteModal} color="secondary">Cancelar</MuiButton>
                        <MuiButton onClick={handleConfirmDelete} variant="contained" color="error" startIcon={<DeleteIcon />} disabled={cargando}>
                            {cargando ? <CircularProgress size={24} color="inherit" /> : "Eliminar"}
                        </MuiButton>
                    </DialogActions>
                </Dialog>
            )}
        </>
    );
};

export default AltaBajaModificion;