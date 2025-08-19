import nodemailer from 'nodemailer';
import 'dotenv/config';
// archivo: enviarTest.js

async function enviarCorreo(htmlMensaje, asunto, correoDestino) {
    // 1. Crear el Transporter (ejemplo Gmail)
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER, // Cambia esto
            pass: process.env.EMAIL_PASS // Contraseña de aplicación
        }
    });

    // 2. Definir Opciones del Correo
    const mailOptions = {
        from: `"InscribCórdoba" <${process.env.EMAIL_USER}>`,
        to: correoDestino, // Cambia esto
        subject: asunto,
        text: "¡Hola! Si ves esto, Nodemailer funciona (texto plano).",
        html: htmlMensaje
    };

    // 3. Enviar el Correo
    try {
        
        let info = await transporter.sendMail(mailOptions);
        console.log("Correo enviado con éxito!");
        console.log("Message ID:", info.messageId);
    } catch (error) {
        console.error("Error al enviar correo:", error);
    }
}


//enviarCorreo("<h1>¡Hola!</h1><p>Este es un correo de prueba desde Nodemailer.</p>", "Asunto del Correo","christian.javier.bergero@gmail.com");

export default enviarCorreo;