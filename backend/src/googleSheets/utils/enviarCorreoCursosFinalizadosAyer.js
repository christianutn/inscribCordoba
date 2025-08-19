
import cron from "node-cron";
import envioCorreo from "../../utils/enviarCorreo.js"; // Asegúrate que esta ruta es correcta
import obtenerFilasPorFechaRelativa  from "./buscarCursosARevisarPorFechaDesde.js"; // Reutiliza la misma función
import { DateTime } from "luxon"; // Importa DateTime de Luxon

const enviarCorreoCursosFinalizadosAyer = () => {
    // Configuración de la tarea cron (ej. todos los días a las 8:30 AM)
    // '30 8 * * *' -> (Minuto 30, Hora 8, todos los días del mes, etc.)
    // Se ejecuta un poco después del otro cron para no superponer logs o carga.
    console.log("Configurando tarea de CRON para enviar correo de control de cursos iniciados ayer.");
    cron.schedule('0 0 8 * * *', async () => {
        const timestamp = DateTime.now().setZone("America/Argentina/Buenos_Aires").toISO();
        console.log(`[${timestamp}] CRON TAREA: Iniciando revisión de cursos que comenzaron AYER.`);

        try {
            // *** LLAMADA A LA FUNCIÓN REUTILIZADA, PERO CON -1 ***
            const cursosFinalizadosAyer = await obtenerFilasPorFechaRelativa(
                "principal",               // Nombre de la hoja
                "A:AF",                    // Rango
                "Fecha fin del curso",  // Columna de fecha
                -1                         // Días a buscar (-1 para ayer)
            );

            console.log(`[${timestamp}] CRON TAREA: Se obtuvieron ${cursosFinalizadosAyer.length} cursos que iniciaron ayer.`);

            if (cursosFinalizadosAyer.length === 0) {
                console.log(`[${timestamp}] CRON TAREA: No hay cursos que hayan iniciado ayer. No se enviará correo.`);
                return;
            }

            // Construir el HTML de la tabla con los resultados
            let tableRowsHtml = '';
            cursosFinalizadosAyer.forEach(curso => {
                const escapeHtml = (unsafe) => {
                    if (typeof unsafe !== 'string') return '';
                    return unsafe
                         .replace(/&/g, "&amp;")
                         .replace(/</g, "&lt;")
                         .replace(/>/g, "&gt;")
                         .replace(/"/g, "&quot;")
                         .replace(/'/g, "&#039;");
                };

                const fechaFormateada = DateTime.fromISO(curso['Fecha inicio del curso']).toFormat('dd/MM/yyyy');

                tableRowsHtml += `
                    <tr>
                        <td>${escapeHtml(curso['Código del curso'] || 'N/A')}</td>
                        <td>${escapeHtml(curso['Nombre del curso'] || 'N/A')}</td>
                        <td>${escapeHtml(fechaFormateada)}</td>
                        <td>${escapeHtml(curso['ADM'] || 'Sin asignar')}</td>

                    </tr>
                `;
            });

            // Usar Luxon para la fecha de ayer a mostrar en el correo
            const fechaAyer = DateTime.local().minus({ days: 1 }).setZone("America/Argentina/Buenos_Aires");
            const fechaAyerStr = fechaAyer.toFormat('dd/MM/yyyy');

            // *** HTML DEL CORREO ADAPTADO PARA ESTA ALERTA ***
            const htmlEmailBody = `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                  <meta charset="UTF-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                  <title>Alerta de Cursos Finalizados Ayer</title>
                  <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8f8f8; }
                    .container { background-color: #ffffff; padding: 25px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 700px; margin: 20px auto; }
                    .alert-box { background-color: #fffbe6; border-left: 6px solid #ffc107; padding: 20px; border-radius: 6px; margin-bottom: 20px; } /* Color amarillo para esta alerta */
                    .alert-box h3 { margin-top: 0; font-size: 1.2em; color: #856404; }
                    .alert-icon { font-size: 1.5em; margin-right: 8px; vertical-align: middle; }
                    .alert-box ul { margin-top: 5px; padding-left: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                    th, td { border: 1px solid #dddddd; text-align: left; padding: 10px; font-size: 0.95em; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    h2 { color: #333333; border-bottom: 2px solid #eee; padding-bottom: 8px; margin-top: 0; }
                    .footer { margin-top: 25px; font-size: 0.9em; color: #777777; text-align: center; }
                    @media (max-width: 600px) { th, td { padding: 8px; font-size: 0.9em; } .container { padding: 15px; } }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <h2>Seguimiento de Cursos Finalizados</h2>
                
                    <div class="alert-box">
                      <h3><span class="alert-icon">ℹ️</span> Información</h3>
                      <p>
                        Los siguientes cursos finalizaron el día de ayer (<strong>${fechaAyerStr}</strong>). Se recomienda verificar el estado y seguimiento de los mismos:
                      </p>
                      <ul>
                        <li>Corroborar próximas instancias para determinar si es necesario limpiar el curso cuanto antes.</li>
                      </ul>
                
                      <table>
                        <thead>
                          <tr>
                            <th>Código del curso</th>
                            <th>Nombre del curso</th>
                            <th>Fecha de inicio</th>
                            <th>Asignado</th>

                          </tr>
                        </thead>
                        <tbody>
                          ${tableRowsHtml}
                        </tbody>
                      </table>
                    </div>
                
                    <p class="footer">
                      Este es un correo automático generado el ${DateTime.now().setZone('America/Argentina/Buenos_Aires').toFormat("dd/MM/yyyy 'a las' HH:mm 'hs.'")}.
                    </p>
                  </div>
                </body>
                </html>
            `;

            const emailSubject = `Seguimiento: ${cursosFinalizadosAyer.length} Curso${cursosFinalizadosAyer.length > 1 ? 's' : ''} iniciado${cursosFinalizadosAyer.length > 1 ? 's' : ''} el ${fechaAyerStr}`;
            
            const emailRecipients = process.env.EMAIL_RECIPIENTS || "soportecampuscordoba@gmail.com";

            if (!emailRecipients) {
                console.error(`[${timestamp}] CRON TAREA (AYER): No se configuraron destinatarios de correo. No se puede enviar el correo.`);
                return;
            }

            await envioCorreo(htmlEmailBody, emailSubject, emailRecipients);
            console.log(`[${timestamp}] CRON TAREA (AYER): Correo enviado exitosamente a: ${emailRecipients}`);

        } catch (error) {
            console.error(`[${timestamp}] CRON TAREA (AYER): Error general durante la ejecución:`, error);
        }

    }, {
        scheduled: true,
        timezone: "America/Argentina/Buenos_Aires"
    });
}

export default enviarCorreoCursosFinalizadosAyer;