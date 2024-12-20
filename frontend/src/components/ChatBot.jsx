import React, { useState, useEffect, useRef } from "react";
import { getCategoriasChatbot } from "../services/categoriaChatbot.service.js"
import { getDiccionarioChatbot, getDiccionarioChatbotPuntual } from "../services/diccionarioChatbot.service.js"
import { insertDiccionarioChatbotnr } from "../services/diccionarioChatbotnr.service.js";
import Swal from 'sweetalert2';

const ChatBoot = ({ chatMessages }) => {
    const [newMessage, setNewMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [estado, setEstado] = useState("1");
    const [estadoPregunta, setEstadoP] = useState("0");
    const [isTyping, setIsTyping] = useState(false); // Nuevo estado

    const chatBoxRef = useRef(null); // Referencia al contenedor de mensajes
    const lastMessageRef = useRef(null); // Referencia al último mensaje
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

        // Simula que el bot está escribiendo
        setIsTyping(true);

        // Lógica para validar si el mensaje es un número entero
        // if (validarEntero(parseInt(newMessage, 10))) {
        if (estado === "0") {

            let preguntas = "Estas con las opciones que puedo darte:\r\n";
            preguntas += "0: Volver al menú principal\r\n";
            const misOpciones = [];

            const opcionesValidas = JSON.parse(localStorage.getItem('opcionesValidas')) || [];
            console.log(opcionesValidas);
            let idOriginal = "";
            if (opcionesValidas.length > 0) {
                const opcionEspecial = opcionesValidas.find((opcion) => opcion.idSecuencial === newMessage);
                if (opcionEspecial) {
                    idOriginal = opcionEspecial.idOriginal;
                }
            }
            if (idOriginal) {
                if (idOriginal === "x" || idOriginal === "X") {
                    // Acción para "x", cuando el usuario quiera hacer una pregunta personalizada
                    setEstado("2");
                    setEstadoP("1");
                    let mens = "Por favor, escribí tu pregunta que voy a tratar de responderte, \r\nIgresá 0 (cero) para volver al menú principal."
                    mens = mens.replace(/\r\n/g, "<br>");
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        {
                            side: 1,
                            menssage: mens
                        },
                    ]);
                    setEstado("2");
                    setIsTyping(false);
                    console.log("Estado final: ", estado);
                    return;
                }

                const datosDeDiccionariosChatbotPorIdCategoria = (idOriginal) ? await getDiccionarioChatbot("", idOriginal) : null;

                if (datosDeDiccionariosChatbotPorIdCategoria.length > 0) {
                    let secuenciaId = 1; // Inicia un id secuencial
                    datosDeDiccionariosChatbotPorIdCategoria.forEach((element) => {
                        // Guarda el id original y el id secuencial en localStorage
                        misOpciones.push({
                            idOriginal: element.id.toString(),
                            idSecuencial: secuenciaId.toString(), // Convierte el id secuencial a cadena
                        });

                        // Añade la pregunta con el id secuencial a la cadena 'preguntas'
                        preguntas += `${secuenciaId}) ${element.pregunta}\r\n`;

                        // Incrementa el contador de id secuencial
                        secuenciaId++;
                    });
                    console.log("Preguntas reordenadas: ", preguntas)
                    // Guarda el array de opciones en localStorage

                    // Agrega la opción de escribir una pregunta si no se encuentra una opción
                    preguntas += `${secuenciaId}) &#128073; Escribí tu pregunta si no encontrás una opción\r\n`;
                    preguntas = preguntas.replace(/\r\n/g, "<br>");
                    misOpciones.push({
                        idOriginal: "x",
                        idSecuencial: secuenciaId.toString()
                    })
                    localStorage.setItem('opcionesValidas', JSON.stringify(misOpciones));

                    // Reemplaza los saltos de línea para formato HTML

                    // Actualiza el estado con las preguntas
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        {
                            side: 1,
                            menssage: preguntas || 'Sin respuesta'
                        },
                    ]);

                    // Actualiza el estado
                    setEstado("1");
                    setEstadoP("0");
                    setIsTyping(false);

                    console.log("Estado final: ", estado);
                    return;
                }
            }
            else {
                let error = `&#10060; La opción ingresada es incorrecta.\r\nIngrese una de las opciones siguientes:\r\n`;
                const categorias = await getCategoriasChatbot();
                // categorias.forEach((element) => {
                //     error += `${element.id}) ${element.nombre}\r\n`;
                // });

                let misOpciones = []; // Array para guardar los ids y secuenciales

                // Contador para los ids secuenciales
                let secuenciaId = 1;

                categorias.forEach((element) => {
                    // Guarda el id original y el id secuencial en el array misOpciones
                    misOpciones.push({
                        idOriginal: element.id.toString(),
                        idSecuencial: secuenciaId.toString(), // Convierte el id secuencial a cadena
                    });

                    // Añade la opción con el id secuencial a la cadena primerPregunta
                    error += `${secuenciaId}) ${element.nombre}\r\n`;

                    // Incrementa el contador de id secuencial
                    secuenciaId++;
                });

                error += `${secuenciaId}) &#128073; Escribí tu pregunta si no encontrás una opción\r\n`;

                // Reemplaza los saltos de línea para formato HTML
                error = error.replace(/\r\n/g, "<br>");
                misOpciones.push({
                    idOriginal: "x",
                    idSecuencial: secuenciaId.toString()
                })
                // Guarda el array de opciones en localStorage
                localStorage.setItem('opcionesValidas', JSON.stringify(misOpciones));

                error = error.replace(/\r\n/g, "<br>");
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        side: 1,
                        menssage: error || 'Sin respuesta'
                    },
                ]);
                setEstado("0");
                setEstadoP("0");
                setIsTyping(false);
                console.log("Estado final: ", estado);
                return;
            }
        }
        if (estado === "1") {
            const opcionesValidas = JSON.parse(localStorage.getItem('opcionesValidas')) || [];
            console.log(opcionesValidas);
            if (newMessage === "0") {
                setEstado("0");
                const categorias = await getCategoriasChatbot();
                let primerPregunta = "Ingresá una opción:\r\n";
                let misOpciones = []; // Array para guardar los ids y secuenciales

                // Contador para los ids secuenciales
                let secuenciaId = 1;

                categorias.forEach((element) => {
                    // Guarda el id original y el id secuencial en el array misOpciones
                    misOpciones.push({
                        idOriginal: element.id.toString(),
                        idSecuencial: secuenciaId.toString(), // Convierte el id secuencial a cadena
                    });

                    // Añade la opción con el id secuencial a la cadena primerPregunta
                    primerPregunta += `${secuenciaId}) ${element.nombre}\r\n`;

                    // Incrementa el contador de id secuencial
                    secuenciaId++;
                });

                primerPregunta += `${secuenciaId}) &#128073; Escribí tu pregunta si no encontrás una opción\r\n`;

                // Reemplaza los saltos de línea para formato HTML
                primerPregunta = primerPregunta.replace(/\r\n/g, "<br>");
                misOpciones.push({
                    idOriginal: "x",
                    idSecuencial: secuenciaId.toString()
                })
                // Guarda el array de opciones en localStorage
                localStorage.setItem('opcionesValidas', JSON.stringify(misOpciones));

                // Agrega la opción de escribir una pregunta si no se encuentra una opción

                // Actualiza el estado con el mensaje
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        side: 1,
                        menssage: primerPregunta || 'Sin respuesta'
                    },
                ]);

                // Cambia el estado
                setIsTyping(false);
                setEstado("0");
                setEstadoP("0");
                console.log("Estado final: ", estado);
                return;

            }

            let idOriginal = "";
            if (opcionesValidas.length > 0) {
                const opcionEspecial = opcionesValidas.find((opcion) => opcion.idOriginal === "x" && opcion.idSecuencial === newMessage);
                if (opcionEspecial) {
                    idOriginal = opcionEspecial.idOriginal;
                }
            }

            if (idOriginal === "x" || idOriginal === "X") {
                // Acción para "x", cuando el usuario quiera hacer una pregunta personalizada
                setEstado("2");
                setEstadoP("1");
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        side: 1,
                        menssage: "Por favor, escribí tu pregunta que voy a tratar de responderte, o sino ingresá 0 (cero) para volver al menú principal."
                    },
                ]);
                setEstado("2");
                setIsTyping(false);
                console.log("Estado final: ", estado);
                return;
            }
            if (estadoPregunta === "0") {
                if (newMessage === "0") {
                    setEstado("0");
                    console.log("Estado inicial: ", estado);
                    const categorias = await getCategoriasChatbot();
                    let primerPregunta = "Ingresá una opción:\r\n";
                    let misOpciones = []; // Array para guardar los ids y secuenciales
                    let secuenciaId = 1;

                    categorias.forEach((element) => {
                        // Guarda el id original y el id secuencial en el array misOpciones
                        misOpciones.push({
                            idOriginal: element.id.toString(),
                            idSecuencial: secuenciaId.toString(), // Convierte el id secuencial a cadena
                        });

                        // Añade la opción con el id secuencial a la cadena primerPregunta
                        primerPregunta += `${secuenciaId}) ${element.nombre}\r\n`;

                        // Incrementa el contador de id secuencial
                        secuenciaId++;
                    });
                    primerPregunta += `${secuenciaId}) &#128073; Escribí tu pregunta si no encontrás una opción\r\n`;
                    misOpciones.push({
                        idOriginal: "x",
                        idSecuencial: secuenciaId.toString()
                    })
                    // Guarda el array de opciones en localStorage
                    localStorage.setItem('opcionesValidas', JSON.stringify(misOpciones));

                    // Agrega la opción de escribir una pregunta si no se encuentra una opción

                    // Reemplaza los saltos de línea para formato HTML
                    primerPregunta = primerPregunta.replace(/\r\n/g, "<br>");
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        {
                            side: 1,
                            menssage: primerPregunta || 'Sin respuesta'
                        },
                    ]);
                    setIsTyping(false);
                    setEstadoP("0");
                    setEstado("0");
                    console.log("Estado final: ", estado);
                    return;
                }
                if (idOriginal === "x" || idOriginal === "X") {
                    // Acción para "x", cuando el usuario quiera hacer una pregunta personalizada
                    setEstado("2");
                    setEstadoP("1");
                    console.log("Estado inicial: ", estado);
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        {
                            side: 1,
                            menssage: "Por favor, escribí tu pregunta que voy a tratar de responderte, o sino ingresá 0 (cero) para volver al menú principal."
                        },
                    ]);
                    setIsTyping(false);
                    setEstado("2");
                    console.log("Estado final: ", estado);
                    return;
                }
                if (newMessage != "0") {
                    // Validación de una opción seleccionada
                    console.log("Estado inicial: ", estado);
                    const opcionesValidas = JSON.parse(localStorage.getItem('opcionesValidas')) || [];
                    console.log(opcionesValidas);

                    if (opcionesValidas.length > 0) {

                        const opcionSeleccionada = opcionesValidas.find((opcion) => opcion.idSecuencial === newMessage.trim());

                        if (opcionSeleccionada) {
                            const idOriginal = opcionSeleccionada.idOriginal;
                            const preguntaPuntual = await getDiccionarioChatbotPuntual(idOriginal);
                            let respuesta = "";
                            respuesta += `0: Volver al menú principal\r\n`;
                            preguntaPuntual.forEach((element) => {
                                respuesta += `&#9989; ${element.respuesta}\r\n`;
                            });
                            respuesta = respuesta.replace(/\r\n/g, "<br>");
                            setMessages((prevMessages) => [
                                ...prevMessages,
                                {
                                    side: 1,
                                    menssage: respuesta || 'Sin respuesta'
                                },
                            ]);
                            setEstado("1");
                            setEstadoP("1");
                            setIsTyping(false);
                            console.log("Estado final: ", estado);
                            localStorage.setItem('opcionesValidas', JSON.stringify([]));
                            return;
                        }
                        else {
                            let condicion = "Debe ingresar una opción válida";
                            setMessages((prevMessages) => [
                                ...prevMessages,
                                {
                                    side: 1,
                                    menssage: condicion || 'Sin respuesta'
                                },
                            ]);
                            setIsTyping(false);
                            return;
                        }
                    }
                }
            }
            else {
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
            }
            //}
        }
        if (estado === "2") {
            if (newMessage === "0") {
                setEstado("0");
                const categorias = await getCategoriasChatbot();
                let primerPregunta = "Ingresá una opción:\r\n";

                let misOpciones = []; // Array para guardar los ids y secuenciales

                let secuenciaId = 1;

                categorias.forEach((element) => {
                    // Guarda el id original y el id secuencial en el array misOpciones
                    misOpciones.push({
                        idOriginal: element.id.toString(),
                        idSecuencial: secuenciaId.toString(), // Convierte el id secuencial a cadena
                    });

                    // Añade la opción con el id secuencial a la cadena primerPregunta
                    primerPregunta += `${secuenciaId}) ${element.nombre}\r\n`;

                    // Incrementa el contador de id secuencial
                    secuenciaId++;
                });

                primerPregunta += `${secuenciaId}) &#128073; Escribí tu pregunta si no encontrás una opción\r\n`;
                misOpciones.push({
                    idOriginal: "x",
                    idSecuencial: secuenciaId.toString()
                })
                primerPregunta = primerPregunta.replace(/\r\n/g, "<br>");
                // Guarda el array de opciones en localStorage
                localStorage.setItem('opcionesValidas', JSON.stringify(misOpciones));

                // Agrega la opción de escribir una pregunta si no se encuentra una opción
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        side: 1,
                        menssage: primerPregunta || 'Sin respuesta'
                    },
                ]);
                setEstado("0");
                setIsTyping(false);
                return;
            }
            else {
                if (validarEntero(parseInt(newMessage, 10))) {
                    const opcionesValidas = JSON.parse(localStorage.getItem('opcionesValidas')) || [];
                    console.log(opcionesValidas);

                    if (opcionesValidas.length > 0) {

                        const opcionSeleccionada = opcionesValidas.find((opcion) => opcion.idSecuencial === newMessage.trim());

                        if (opcionSeleccionada) {

                            const preguntaPuntual = await getDiccionarioChatbotPuntual(opcionSeleccionada.idOriginal);
                            let respuesta = "";
                            respuesta += `0: Volver al menú principal\r\n`;
                            preguntaPuntual.forEach((element) => {
                                respuesta += `&#9989; ${element.respuesta}\r\n`;
                            });
                            respuesta = respuesta.replace(/\r\n/g, "<br>");
                            setMessages((prevMessages) => [
                                ...prevMessages,
                                {
                                    side: 1,
                                    menssage: respuesta || 'Sin respuesta'
                                },
                            ]);
                            setEstado("1");
                            setIsTyping(false);
                            return;
                        }
                        else {
                            let condicion = "Debe ingresar una opción válida";
                            setMessages((prevMessages) => [
                                ...prevMessages,
                                {
                                    side: 1,
                                    menssage: condicion || 'Sin respuesta'
                                },
                            ]);
                            setIsTyping(false);
                            return;
                        }

                    }
                    else {
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
                    }
                }
                else {
                    let misOpciones = []; // Array para guardar los ids y secuenciales
                    let secuenciaId = 1;

                    const busqueda = newMessage.split(" ");
                    let coincidencias = "";

                    // Lista de palabras a excluir (preposiciones y artículos)
                    const palabrasExcluidas = ["el", "la", "los", "las", "del", "de", "un", "una", "al", "a", "por", "con", "sin", "y", "o", "mi", "unos", "mis", "desde", "para", "que", "qué", "quén", "quiénes"];

                    // Filtra las palabras no relevantes
                    const palabrasFiltradas = busqueda.filter((q) => !palabrasExcluidas.includes(q.toLowerCase()));

                    console.log("Palabras relevantes:", palabrasFiltradas);

                    // Mapea las palabras relevantes a promesas y resuélvelas en paralelo
                    const resultados = await Promise.all(
                        palabrasFiltradas.map(async (q) => {
                            try {
                                const pregunta = await getDiccionarioChatbot(q, "");
                                if (pregunta.length > 0) {
                                    pregunta.forEach((element) => {
                                        coincidencias += `${secuenciaId}) ${element.pregunta}\r\n`;
                                        misOpciones.push({
                                            idOriginal: element.id.toString(),
                                            idSecuencial: secuenciaId.toString(), // Convierte el id secuencial a cadena
                                        });
                                        secuenciaId++;
                                    });
                                }
                            } catch (error) {
                                console.error(`Error procesando la palabra "${q}":`, error);
                            }
                        })
                    );



                    // Guarda el array de opciones en localStorage
                    localStorage.setItem('opcionesValidas', JSON.stringify(misOpciones));
                    console.log("Coincidencias: ", coincidencias);


                    // const preguntaPuntual = await getDiccionarioChatbot(newMessage, "");
                    if (coincidencias) {
                        let respuesta = "";
                        respuesta += `Estas son las opciones que puedo brindarte respecto al texto que me proporcionaste:\r\n`;
                        respuesta += `0: Volver al menú principal\r\n`;

                        respuesta += coincidencias;
                        respuesta = respuesta.replace(/\r\n/g, "<br>");
                        setMessages((prevMessages) => [
                            ...prevMessages,
                            {
                                side: 1,
                                menssage: respuesta || 'Sin respuesta'
                            },
                        ]);
                        setIsTyping(false);
                    }
                    else {

                        try {
                            const response = await insertDiccionarioChatbotnr({ pregunta: newMessage });
                            let respuesta = "";

                            respuesta += `0: Volver al menú principal\r\n`;
                            // respuesta += `&#10060;Mis disculpas, no tengo una respuesta concreta para tu pregunta, pero podes escribir a nuestro equipo de administradores que sabrán brindarte una atención mas especializada. Escribinos a <span style='color:blue'>consultascampuscordoba@cba.gov.ar</span>.`;
                            respuesta += `&#10060; Lamento no poder ofrecer una respuesta específica a tu pregunta en este momento. Te invito a reescribir tu pregunga o bien a ponerte en contacto con nuestro equipo de administradores, quienes estarán encantados de ayudarte con atención especializada. Puedes escribirnos a <span style='color:blue'>consultascampuscordoba@cba.gov.ar</span>.`;
                            respuesta = respuesta.replace(/\r\n/g, "<br>");
                            setMessages((prevMessages) => [
                                ...prevMessages,
                                {
                                    side: 1,
                                    menssage: respuesta || 'Sin respuesta'
                                },
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
        // Finaliza la simulación de escritura
        console.log("Estado final: ", estado);
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
            let misOpciones = []; // Array para guardar los ids y secuenciales
            let primerPregunta =
                "Hola!....soy ChatBoot-Campus, en qué te puedo ayudar??\r\n Ingresá una opción:\r\n";

            let secuenciaId = 1;

            categorias.forEach((element) => {
                // Guarda el id original y el id secuencial en el array misOpciones
                misOpciones.push({
                    idOriginal: element.id.toString(),
                    idSecuencial: secuenciaId.toString(), // Convierte el id secuencial a cadena
                });

                // Añade la opción con el id secuencial a la cadena primerPregunta
                primerPregunta += `${secuenciaId}) ${element.nombre}\r\n`;

                // Incrementa el contador de id secuencial
                secuenciaId++;
            });


            // Agrega la opción de escribir una pregunta si no se encuentra una opción
            primerPregunta += `${secuenciaId}) &#128073; Escribí tu pregunta si no encontrás una opción\r\n`;
            primerPregunta = primerPregunta.replace(/\r\n/g, "<br>");
            misOpciones.push({
                idOriginal: "x",
                idSecuencial: secuenciaId.toString()
            })
            // Guarda el array de opciones en localStorage
            localStorage.setItem('opcionesValidas', JSON.stringify(misOpciones));

            // Reemplaza los saltos de línea para formato HTML
            setMessages([{ side: 1, menssage: primerPregunta }]);
            setEstado("0");
            console.log("Estado inicial: ", estado);
        })();
    }, []);
    useEffect(() => {
        if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
        }
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTo({
                top: chatBoxRef.current.scrollHeight,
                behavior: "smooth", // Animación suave
            });
        }
    }, [messages]);
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
                                    maxHeight: "400px", // Altura máxima del contenedor de mensajes
                                    overflowY: "auto", // Habilitar desplazamiento vertical
                                    paddingBottom: "100px" // Espaciado para evitar que los mensajes oculten el área fija
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

                            {/* Área de entrada fija */}
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
