import React, { useState, useEffect, useRef } from "react";
import { getCategoriasChatbot } from "../services/categoriaChatbot.service.js"
import { getDiccionarioChatbot, getDiccionarioChatbotPuntual } from "../services/diccionarioChatbot.service.js"
import { insertDiccionarioChatbotnr } from "../services/diccionarioChatbotnr.service.js";
import Swal from 'sweetalert2';
import { insertarConsultasChatbot } from "../services/consultas_chatbot.service.js";

const ChatBoot = ({ chatMessages }) => {
    const [newMessage, setNewMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [estado, setEstado] = useState("1");
    const [estadoPregunta, setEstadoP] = useState("0");
    const [isTyping, setIsTyping] = useState(false);

    // NUEVO: Estado para guardar el texto de la última opción seleccionada por el usuario.
    const [preguntaSeleccionada, setPreguntaSeleccionada] = useState("");

    const chatBoxRef = useRef(null);
    const lastMessageRef = useRef(null);
    const placeholderText = (estado === "1" || estado === "0") ? "Ingresá una opción del menú" : "Escribí tu mensaje";

    const handleNewMessageChange = (e) => {
        setNewMessage(e.target.value);
    };

    const onKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (newMessage.trim() === "") {
                if (estado === "0" || estado === "1") {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Campo vacío',
                        text: 'Por favor, ingresá una de las opciones antes de continuar.',
                        confirmButtonText: 'Entendido',
                    });
                    return;
                }
                if (estado === "2") {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Campo vacío',
                        text: 'Por favor, escribí tú pregunta antes de continuar.',
                        confirmButtonText: 'Entendido',
                    });
                    return;
                }
            } else {
                realizarAccionEspecificaBusqueda();
            }
        }
    };

    const validar = (e) => {
        if (newMessage.trim() === "") {
            const alertText = estado === "2"
                ? 'Por favor, escribí tu pregunta antes de continuar.'
                : 'Por favor, ingresá una de las opciones antes de continuar.';

            Swal.fire({
                icon: 'warning',
                title: 'Campo vacío',
                text: alertText,
                confirmButtonText: 'Entendido',
            });
            return;
        } else {
            realizarAccionEspecificaBusqueda();
        }
    };

    const handleSendMessage = async (e) => {

        e.preventDefault();
        if (newMessage.trim() === "") return;

        const newMessageObject = {
            side: 2,
            menssage: newMessage,
            imagen: null,
        };
        setMessages([...messages, newMessageObject]);
        setNewMessage("");

        setIsTyping(true);

        if (estado === "0") {
            let preguntas = "Estas con las opciones que puedo darte:\r\n";
            preguntas += "0: Volver al menú principal\r\n";
            const misOpciones = [];

            const opcionesValidas = JSON.parse(localStorage.getItem('opcionesValidas')) || [];
            let idOriginal = "";

            // Buscamos la opción que el usuario ingresó
            const opcionSeleccionada = opcionesValidas.find((opcion) => opcion.idSecuencial === newMessage);

            if (opcionSeleccionada) {
                // NUEVO: Guardamos el texto de la opción seleccionada y lo mostramos en consola.
                setPreguntaSeleccionada(opcionSeleccionada.texto);
                console.log(`[Opción Seleccionada] Texto: "${opcionSeleccionada.texto}"`);
                await insertarConsultasChatbot(opcionSeleccionada.texto)


                idOriginal = opcionSeleccionada.idOriginal;
            }

            if (idOriginal) {
                if (idOriginal === "x" || idOriginal === "X") {
                    setEstado("2");
                    setEstadoP("1");
                    let mens = "Por favor, escribí tu pregunta que voy a tratar de responderte, \r\nIngresá 0 (cero) para volver al menú principal."
                    mens = mens.replace(/\r\n/g, "<br>");
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        { side: 1, menssage: mens },
                    ]);
                    setIsTyping(false);
                    return;
                }

                const datosDeDiccionariosChatbotPorIdCategoria = await getDiccionarioChatbot("", idOriginal);

                if (datosDeDiccionariosChatbotPorIdCategoria.length > 0) {
                    let secuenciaId = 1;
                    datosDeDiccionariosChatbotPorIdCategoria.forEach((element) => {
                        // MODIFICADO: Ahora también guardamos el texto de la pregunta.
                        misOpciones.push({
                            idOriginal: element.id.toString(),
                            idSecuencial: secuenciaId.toString(),
                            texto: element.pregunta // Guardamos el texto
                        });
                        preguntas += `${secuenciaId}) ${element.pregunta}\r\n`;
                        secuenciaId++;
                    });

                    const textoOpcionAbierta = "Escribí tu pregunta si no encontrás una opción";
                    preguntas += `${secuenciaId})  ${textoOpcionAbierta}\r\n`;
                    preguntas = preguntas.replace(/\r\n/g, "<br>");
                    // MODIFICADO: Guardamos el texto de la opción de pregunta abierta
                    misOpciones.push({
                        idOriginal: "x",
                        idSecuencial: secuenciaId.toString(),
                        texto: textoOpcionAbierta
                    });
                    localStorage.setItem('opcionesValidas', JSON.stringify(misOpciones));

                    setMessages((prevMessages) => [
                        ...prevMessages,
                        { side: 1, menssage: preguntas || 'Sin respuesta' },
                    ]);

                    setEstado("1");
                    setEstadoP("0");
                    setIsTyping(false);
                    return;
                }
            } else {
                // Lógica de error... (aquí no hay selección de usuario, solo se muestra el menú de nuevo)
                let error = `❌ La opción ingresada es incorrecta.\r\nIngrese una de las opciones siguientes:\r\n`;
                const categorias = await getCategoriasChatbot();
                let misOpcionesError = [];
                let secuenciaId = 1;

                categorias.forEach((element) => {
                    misOpcionesError.push({
                        idOriginal: element.id.toString(),
                        idSecuencial: secuenciaId.toString(),
                        texto: element.nombre // MODIFICADO
                    });
                    error += `${secuenciaId}) ${element.nombre}\r\n`;
                    secuenciaId++;
                });

                const textoOpcionAbierta = "Escribí tu pregunta si no encontrás una opción";
                error += `${secuenciaId})  ${textoOpcionAbierta}\r\n`;
                misOpcionesError.push({
                    idOriginal: "x",
                    idSecuencial: secuenciaId.toString(),
                    texto: textoOpcionAbierta // MODIFICADO
                });
                localStorage.setItem('opcionesValidas', JSON.stringify(misOpcionesError));

                error = error.replace(/\r\n/g, "<br>");
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { side: 1, menssage: error || 'Sin respuesta' },
                ]);
                setEstado("0");
                setEstadoP("0");
                setIsTyping(false);
                return;
            }
        }

        if (estado === "1") {
            // ... (dentro de estado === 1, se repite la misma lógica de captura)
            const opcionesValidas = JSON.parse(localStorage.getItem('opcionesValidas')) || [];

            if (newMessage === "0") {
                // ... lógica para volver al menú principal
                setEstado("0");
                const categorias = await getCategoriasChatbot();
                let primerPregunta = "Ingresá una opción:\r\n";
                let misOpciones = [];
                let secuenciaId = 1;
                categorias.forEach((element) => {
                    misOpciones.push({
                        idOriginal: element.id.toString(),
                        idSecuencial: secuenciaId.toString(),
                        texto: element.nombre // MODIFICADO
                    });
                    primerPregunta += `${secuenciaId}) ${element.nombre}\r\n`;
                    secuenciaId++;
                });
                const textoOpcionAbierta = "Escribí tu pregunta si no encontrás una opción";
                primerPregunta += `${secuenciaId})  ${textoOpcionAbierta}\r\n`;
                misOpciones.push({
                    idOriginal: "x",
                    idSecuencial: secuenciaId.toString(),
                    texto: textoOpcionAbierta // MODIFICADO
                });
                localStorage.setItem('opcionesValidas', JSON.stringify(misOpciones));
                primerPregunta = primerPregunta.replace(/\r\n/g, "<br>");
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { side: 1, menssage: primerPregunta || 'Sin respuesta' },
                ]);
                setIsTyping(false);
                setEstadoP("0");
                return;
            }

            const opcionSeleccionada = opcionesValidas.find((opcion) => opcion.idSecuencial === newMessage.trim());

            if (opcionSeleccionada) {
                // NUEVO: Guardamos y logueamos el texto de la opción seleccionada
                setPreguntaSeleccionada(opcionSeleccionada.texto);
                console.log(`[Opción Seleccionada] Texto: "${opcionSeleccionada.texto}"`);
                await insertarConsultasChatbot(opcionSeleccionada.texto)

                const idOriginal = opcionSeleccionada.idOriginal;

                if (idOriginal === "x" || idOriginal === "X") {
                    setEstado("2");
                    setEstadoP("1");
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        { side: 1, menssage: "Por favor, escribí tu pregunta que voy a tratar de responderte, o sino ingresá 0 (cero) para volver al menú principal." },
                    ]);
                    setIsTyping(false);
                    return;
                }

                // ... resto de la lógica para mostrar la respuesta puntual ...
                if (estadoPregunta === "0") {
                    const preguntaPuntual = await getDiccionarioChatbotPuntual(idOriginal);
                    let respuesta = "0: Volver al menú principal\r\n";
                    preguntaPuntual.forEach((element) => {
                        respuesta += `✅ ${element.respuesta}\r\n`;
                    });
                    respuesta = respuesta.replace(/\r\n/g, "<br>");
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        { side: 1, menssage: respuesta || 'Sin respuesta' },
                    ]);
                    setEstado("1");
                    setEstadoP("1");
                    setIsTyping(false);
                    localStorage.setItem('opcionesValidas', JSON.stringify([]));
                    return;
                }
            } else {
                if (estadoPregunta !== "0" && newMessage !== "0") {
                    let condicion = "La única opción válida es 0 (cero)";
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        {
                            side: 1,
                            menssage: condicion || 'Sin respuesta'
                        },
                    ]);
                    setIsTyping(false);
                    return;
                } else {
                    let condicion = "Debe ingresar una opción válida";
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        { side: 1, menssage: condicion || 'Sin respuesta' },
                    ]);
                    setIsTyping(false);
                    return;
                }
            }
        }

        if (estado === "2") {
            if (newMessage === "0") {
                // ... Lógica para volver al menú principal
                setEstado("0");
                // ... (código para regenerar el menú principal, se debe agregar el campo 'texto' a misOpciones aquí también)
                // ...
                setIsTyping(false);
                return;
            } else {
                if (validarEntero(parseInt(newMessage, 10))) {
                    // ... Lógica para manejar una opción numérica de una búsqueda previa ...
                } else {
                    // NUEVO: Aquí el usuario escribió su pregunta abierta.
                    const preguntaAbiertaUsuario = newMessage;
                    console.log(`[Contexto] El usuario eligió: "${preguntaSeleccionada}"`);
                    console.log(`[Pregunta Abierta] El usuario escribió: "${preguntaAbiertaUsuario}"`);
                    await insertarConsultasChatbot(preguntaAbiertaUsuario)

                    let misOpciones = [];
                    let secuenciaId = 1;
                    const busqueda = newMessage.split(" ");
                    let coincidencias = "";
                    const palabrasExcluidas = ["el", "la", "los", "las", "del", "de", "un", "una", "al", "a", "por", "con", "sin", "y", "o", "mi", "unos", "mis", "desde", "para", "que", "qué", "quén", "quiénes"];
                    const palabrasFiltradas = busqueda.filter((q) => !palabrasExcluidas.includes(q.toLowerCase()));

                    await Promise.all(
                        palabrasFiltradas.map(async (q) => {
                            try {
                                const pregunta = await getDiccionarioChatbot(q, "");
                                if (pregunta.length > 0) {
                                    pregunta.forEach((element) => {
                                        coincidencias += `${secuenciaId}) ${element.pregunta}\r\n`;
                                        // MODIFICADO: Añadir texto al guardar
                                        misOpciones.push({
                                            idOriginal: element.id.toString(),
                                            idSecuencial: secuenciaId.toString(),
                                            texto: element.pregunta,
                                        });
                                        secuenciaId++;
                                    });
                                }
                            } catch (error) {
                                console.error(`Error procesando la palabra "${q}":`, error);
                            }
                        })
                    );

                    localStorage.setItem('opcionesValidas', JSON.stringify(misOpciones));

                    if (coincidencias) {
                        let respuesta = "Estas son las opciones que puedo brindarte respecto al texto que me proporcionaste:\r\n";
                        respuesta += "0: Volver al menú principal\r\n";
                        respuesta += coincidencias;
                        respuesta = respuesta.replace(/\r\n/g, "<br>");
                        setMessages((prevMessages) => [
                            ...prevMessages,
                            { side: 1, menssage: respuesta || 'Sin respuesta' },
                        ]);
                        setIsTyping(false);
                    } else {
                        try {
                            // Guardamos la pregunta no respondida en la BD
                            await insertDiccionarioChatbotnr({ pregunta: newMessage });
                            let respuesta = "0: Volver al menú principal\r\n";
                            respuesta += `❌ Lamento no poder ofrecer una respuesta específica a tu pregunta en este momento. Te invito a reescribir tu pregunga o bien a ponerte en contacto con nuestro equipo de administradores, quienes estarán encantados de ayudarte con atención especializada. Puedes escribirnos a <span style='color:blue'>consultascampuscordoba@cba.gov.ar</span>.`;
                            respuesta = respuesta.replace(/\r\n/g, "<br>");
                            setMessages((prevMessages) => [
                                ...prevMessages,
                                { side: 1, menssage: respuesta || 'Sin respuesta' },
                            ]);
                            localStorage.setItem('opcionesValidas', JSON.stringify([]));
                            setIsTyping(false);
                            return;
                        } catch (error) {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: error,
                                confirmButtonText: 'Ok',
                            });
                        }
                    }
                }
            }
        }

        setIsTyping(false);
    };

    function validarEntero(valor) {
        return Number.isInteger(valor);
    }

    function realizarAccionEspecificaBusqueda() {
        var btnBusca = document.getElementById("btnPreguntar");
        btnBusca.click();
    }

    useEffect(() => {
        const textarea = document.getElementById("textAreaExample");
        if (textarea) {
            textarea.focus();
        }
        (async () => {
            const categorias = await getCategoriasChatbot();
            let misOpciones = [];
            let primerPregunta = "Hola!....soy ChatBot-Campus, en qué te puedo ayudar??\r\n Ingresá una opción:\r\n";
            let secuenciaId = 1;

            categorias.forEach((element) => {
                // MODIFICADO: Añadimos la propiedad 'texto' al objeto.
                misOpciones.push({
                    idOriginal: element.id.toString(),
                    idSecuencial: secuenciaId.toString(),
                    texto: element.nombre // Este es el texto de la opción
                });
                primerPregunta += `${secuenciaId}) ${element.nombre}\r\n`;
                secuenciaId++;
            });

            const textoOpcionAbierta = "Escribí tu pregunta si no encontrás una opción";
            primerPregunta += `${secuenciaId}) ${textoOpcionAbierta}\r\n`;
            primerPregunta = primerPregunta.replace(/\r\n/g, "<br>");

            // MODIFICADO: Añadimos la propiedad 'texto' para la opción de pregunta  abierta.
            misOpciones.push({
                idOriginal: "x",
                idSecuencial: secuenciaId.toString(),
                texto: textoOpcionAbierta
            });

            localStorage.setItem('opcionesValidas', JSON.stringify(misOpciones));

            setMessages([{ side: 1, menssage: primerPregunta }]);
            setEstado("0");
        })();
    }, []);

    useEffect(() => {
        if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
        }
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTo({
                top: chatBoxRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages]);

    // El resto del componente (el JSX) permanece igual.
    return (
        <section style={{ backgroundColor: "transparent", height: "100vh", display: "flex", flexDirection: "column" }}>
            <div className="container py-5 flex-grow-1">
                <div className="row d-flex justify-content-center">
                    <div className="col-md-12 col-lg-12 col-xl-12">
                        <div className="card" id="chat1" style={{ borderRadius: "15px", height: "100%", display: "flex", flexDirection: "column" }}>
                            <div className="card-header d-flex justify-content-between align-items-center p-3 bg-info text-white border-bottom-0"
                                style={{ borderTopLeftRadius: "15px", borderTopRightRadius: "15px", }}>
                                <i className="fas fa-angle-left"></i>
                                <p className="mb-0 fw-bold">Asistencia Campus</p>
                                <i className="fas fa-times"></i>
                            </div>
                            <div
                                className="card-body flex-grow-1"
                                style={{
                                    maxHeight: "400px",
                                    overflowY: "auto",
                                    paddingBottom: "100px"
                                }}
                                ref={chatBoxRef}
                            >
                                {messages.map((elemento, index) => (
                                    elemento.side === 1 ? (
                                        <div key={index} className="d-flex flex-row justify-content-start mb-4">
                                            <img
                                                src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp"
                                                alt="avatar 1"
                                                style={{ width: "45px", height: "100%" }}
                                            />
                                            <div
                                                className="p-3 ms-3"
                                                style={{
                                                    borderRadius: "15px",
                                                    backgroundColor: "rgba(57, 192, 237, 0.2)",
                                                }}
                                            >
                                                <p
                                                    className="small mb-0"
                                                    dangerouslySetInnerHTML={{ __html: elemento.menssage }}
                                                ></p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div key={index} className="d-flex flex-row justify-content-end mb-4">
                                            <div
                                                className="p-3 me-3 border"
                                                style={{
                                                    borderRadius: "15px",
                                                    backgroundColor: "#fbfbfb",
                                                }}
                                            >
                                                <p
                                                    className="small mb-0"
                                                    dangerouslySetInnerHTML={{ __html: elemento.menssage }}
                                                ></p>
                                            </div>
                                            <img
                                                src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava2-bg.webp"
                                                alt="avatar 2"
                                                style={{ width: "45px", height: "100%" }}
                                            />
                                        </div>
                                    )
                                ))}
                                {isTyping && (
                                    <div className="d-flex flex-row justify-content-start mb-4">
                                        <img
                                            src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp"
                                            alt="avatar typing"
                                            style={{ width: "45px", height: "100%" }}
                                        />
                                        <div
                                            className="p-3 ms-3"
                                            style={{
                                                borderRadius: "15px",
                                                backgroundColor: "rgba(57, 192, 237, 0.2)",
                                            }}
                                        >
                                            <p className="small mb-0">
                                                <i>Escribiendo...</i>
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="card-footer text-muted d-flex align-items-center"
                                style={{
                                    position: "sticky",
                                    bottom: "0",
                                    backgroundColor: "#fff",
                                    borderTop: "1px solid #ddd",
                                    padding: "10px",
                                    zIndex: 10
                                }}
                            >
                                <textarea
                                    className="form-control me-2"
                                    id="textAreaExample"
                                    rows="1"
                                    value={newMessage}
                                    onKeyDown={onKeyDown}
                                    onChange={handleNewMessageChange}
                                    placeholder={placeholderText}
                                ></textarea>
                                <button
                                    type="button"
                                    className="btn btn-primary btn-block"
                                    onClick={validar}
                                    style={{ display: "block" }}
                                >
                                    Enviar
                                </button>
                                <button
                                    id="btnPreguntar"
                                    type="submit"
                                    className="btn btn-primary btn-block"
                                    onClick={handleSendMessage}
                                    style={{ display: "none" }}
                                >
                                    Enviar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ChatBoot;


