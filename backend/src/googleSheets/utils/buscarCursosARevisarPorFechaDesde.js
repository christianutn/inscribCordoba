// src/services/googleSheetsService.js (o el nombre que prefieras)

import { google } from 'googleapis';
import authorize from './getAuth.js'; // Asumo que este archivo exporta la autorización
import { getDataRange } from './getDataRange.js'; // Asumo que este archivo exporta getDataRange
import { DateTime } from 'luxon'; // <-- Importa DateTime de Luxon

/**
 * Obtiene y procesa los datos de una hoja de Google Sheets para encontrar filas
 * que coincidan con una fecha específica, relativa al día actual.
 * @param {string} nombreHoja - El nombre de la hoja de cálculo a consultar (ej. "principal").
 * @param {string} rango - El rango a consultar (ej. "A:AF").
 * @param {string} nombreColumnaFecha - El nombre exacto del encabezado de la columna de fecha a filtrar.
 * @param {number} diasABuscar - El número de días a sumar o restar de la fecha actual para la búsqueda.
 *                               (ej. -1 para ayer, 0 para hoy, 5 para 5 días en el futuro).
 * @returns {Promise<Array<Object>>} Un array de objetos, donde cada objeto representa una fila que coincide con el criterio.
 */
const obtenerFilasPorFechaRelativa = async (nombreHoja, rango, nombreColumnaFecha, diasABuscar) => {
  try {
    const auth = await authorize;
    const googleSheets = google.sheets({ version: 'v4', auth });
    const data = await getDataRange(googleSheets, auth, nombreHoja, rango);

    if (!data || data.length < 2) {
      console.warn(`No se encontraron datos o solo encabezados en la hoja "${nombreHoja}".`);
      return [];
    }

    const headers = data[0];
    const rows = data.slice(1);
    const transformedData = rows.map(row => {
      return headers.reduce((acc, header, index) => {
        acc[header] = row[index] || null;
        return acc;
      }, {});
    });

    const fechaObjetivo = DateTime.local().plus({ days: diasABuscar }).startOf('day');
    console.log(`Buscando filas en la columna "${nombreColumnaFecha}" con fecha objetivo: ${fechaObjetivo.toISODate()}`);

    const filasFiltradas = transformedData.filter(row => {
      const fechaRaw = row[nombreColumnaFecha];

      if (!fechaRaw || typeof fechaRaw !== 'string') {
        return false;
      }
      
      // *** CAMBIO REALIZADO AQUÍ ***
      // Parsear la fecha de la hoja de cálculo en formato AAAA-MM-DD.
      // fromISO es el método ideal para esto.
      const fechaFila = DateTime.fromISO(fechaRaw).startOf('day');
      // *** FIN DEL CAMBIO ***

      if (!fechaFila.isValid) {
        return false;
      }
      
      const esFechaCoincidente = fechaFila.equals(fechaObjetivo);
      const estadoValido = row['Estado'] !== 'SUSPENDIDO' && row['Estado'] !== 'CANCELADO';
      
      return esFechaCoincidente && estadoValido;
    });

    return filasFiltradas;

  } catch (error) {
    console.error("Error al obtener y procesar datos de Google Sheets:", error);
    throw error;
  }
};

export default obtenerFilasPorFechaRelativa;