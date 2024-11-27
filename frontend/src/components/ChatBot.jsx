import React, { useState, useEffect } from "react";
import { getCategoriasChatbot } from "../services/categoriaChatbot.service.js"
import { getDiccionarioChatbot, getDiccionarioChatbotPuntual } from "../services/diccionarioChatbot.service.js"
import Swal from 'sweetalert2';

const ChatBoot = ({ chatMessages }) => {
    const [newMessage, setNewMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [opcionesValidas, setValidas] = useState([]);
    const [estado, setEstado] = useState("1");
    const [estadoPregunta, setEstadoP] = useState("0");
    const [isTyping, setIsTyping] = useState(false); // Nuevo estado

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
        console.log("Estado inicial: ", estado);
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
            const datosDeDiccionariosChatbotPorIdCategoria = await getDiccionarioChatbot("", newMessage);
            let preguntas = "Estas con las opciones que puedo darte:\r\n";
            preguntas += "0: Volver al menú principal\r\n";
            const misOpciones = [];
            if (datosDeDiccionariosChatbotPorIdCategoria.length > 0) {
                datosDeDiccionariosChatbotPorIdCategoria.forEach((element) => {
                    preguntas += `${element.id}: ${element.pregunta}\r\n`;
                    misOpciones.push(element.id.toString());
                });
                localStorage.setItem('opcionesValidas', JSON.stringify(misOpciones));
                preguntas += `x: &#128073; Escribí tu pregunta si no encontrás una opción\r\n`;
                preguntas = preguntas.replace(/\r\n/g, "<br>");
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        side: 1,
                        menssage: preguntas || 'Sin respuesta'
                    },
                ]);
                setEstado("1");
                setEstadoP("0");
                setIsTyping(false);
                console.log("Estado final: ", estado);
                return;
            } else {
                let error = `&#10060; La opción ingresada es incorrecta.\r\nIngrese una de las opciones siguientes:\r\n`;
                const categorias = await getCategoriasChatbot();
                categorias.forEach((element) => {
                    error += `${element.id}: ${element.nombre}\r\n`;
                });
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
            if (newMessage === "0") {
                setEstado("0");
                const categorias = await getCategoriasChatbot();
                let primerPregunta = "Ingresá una opción:\r\n";
                categorias.forEach((element) => {
                    primerPregunta += `${element.id}) ${element.nombre}\r\n`;
                });
                primerPregunta = primerPregunta.replace(/\r\n/g, "<br>");
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        side: 1,
                        menssage: primerPregunta || 'Sin respuesta'
                    },
                ]);
                setIsTyping(false);
                setEstado("0");
                setEstadoP("0");
                console.log("Estado final: ", estado);
                return;
            }
            if (newMessage === "x" || newMessage === "X") {
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
            // if (estado === "1") {
            if (estadoPregunta === "0") {
                if (newMessage === "0") {
                    setEstado("0");
                    console.log("Estado inicial: ", estado);
                    const categorias = await getCategoriasChatbot();
                    let primerPregunta = "Ingresá una opción:\r\n";
                    categorias.forEach((element) => {
                        primerPregunta += `${element.id}) ${element.nombre}\r\n`;
                    });
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
                if (newMessage === "x" || newMessage === "X") {
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
                if (newMessage != "0" && newMessage != "x" && newMessage != "X") {
                    // Validación de una opción seleccionada
                    console.log("Estado inicial: ", estado);
                    const opcionesValidas = JSON.parse(localStorage.getItem('opcionesValidas')) || [];
                    console.log(opcionesValidas);
                    if (opcionesValidas.includes(newMessage.trim())) {
                        const preguntaPuntual = await getDiccionarioChatbotPuntual(newMessage);
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
                        console.log("Estado final: ", estado);
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
                let primerPregunta = "";
                categorias.forEach((element) => {
                    primerPregunta += `${element.id}: ${element.nombre}\r\n`;
                });
                primerPregunta = primerPregunta.replace(/\r\n/g, "<br>");
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
                const preguntaPuntual = await getDiccionarioChatbot(newMessage, "");
                if (preguntaPuntual.length > 0) {
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
                    setIsTyping(false);
                }
                else {
                    let respuesta = "";
                    respuesta += `0: Volver al menú principal\r\n`;
                    respuesta += `&#10060;Mis disculpas, no tengo una respuesta concreta para tu pregunta, pero podes escribir a nuestro equipo de administradores que sabrán brindarte una atención mas especializada. Escribinos a <span style='color:blue'>consultascampuscordoba@cba.gov.ar</span>.`;
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
            let primerPregunta =
                "Hola!....soy ChatBoot-Campus, en qué te puedo ayudar??\r\n Ingresá una opción:\r\n";
            categorias.forEach((element) => {
                primerPregunta += `${element.id}) ${element.nombre}\r\n`;
            });
            primerPregunta = primerPregunta.replace(/\r\n/g, "<br>");
            setMessages([{ side: 1, menssage: primerPregunta }]);
            setEstado("0");
            console.log("Estado inicial: ", estado);
        })();
    }, []);
    return (
        <section style={{ backgroundColor: "#eee" }}>
            <div className="container py-5 scrollable-div">
                <div className="row d-flex justify-content-center">
                    <div className="col-md-12 col-lg-12 col-xl-12">
                        <div className="card" id="chat1" style={{ borderRadius: "15px" }}>
                            <div
                                className="card-header d-flex justify-content-between align-items-center p-3 bg-info text-white border-bottom-0"
                                style={{
                                    borderTopLeftRadius: "15px",
                                    borderTopRightRadius: "15px",
                                }}
                            >
                                <i className="fas fa-angle-left"></i>
                                <p className="mb-0 fw-bold">Asistencia Campus</p>
                                <i className="fas fa-times"></i>
                            </div>
                            <div className="card-body" style={{ maxHeight: '500px', overflow: "auto" }}>
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
                                                style={{ borderRadius: "15px", backgroundColor: "rgba(57, 192, 237,.2)" }}
                                            >
                                                <p className="small mb-0" dangerouslySetInnerHTML={{ __html: elemento.menssage }}></p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div key={index} className="d-flex flex-row justify-content-end mb-4">
                                            <div
                                                className="p-3 me-3 border"
                                                style={{ borderRadius: "15px", backgroundColor: "#fbfbfb" }}
                                            >
                                                <p className="small mb-0" dangerouslySetInnerHTML={{ __html: elemento.menssage }}></p>
                                            </div>
                                            <img
                                                src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava2-bg.webp"
                                                alt="avatar 2"
                                                style={{ width: "45px", height: "100%" }}
                                            />
                                        </div>
                                    )
                                ))}
                                {isTyping && ( // Mostrar "escribiendo" si isTyping es true
                                    <div className="d-flex flex-row justify-content-start mb-4">
                                        <img
                                            src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp"
                                            alt="avatar typing"
                                            style={{ width: "45px", height: "100%" }}
                                        />
                                        <div
                                            className="p-3 ms-3"
                                            style={{ borderRadius: "15px", backgroundColor: "rgba(57, 192, 237,.2)" }}
                                        >
                                            <p className="small mb-0"><i>Escribiendo...</i></p>
                                        </div>
                                    </div>
                                )}
                                <div className="form-outline">
                                    <textarea
                                        className="form-control"
                                        id="textAreaExample"
                                        rows="4"
                                        value={newMessage}
                                        onKeyDown={onKeyDown}
                                        onChange={handleNewMessageChange}
                                    ></textarea>
                                    <label className="form-label" htmlFor="textAreaExample">Escribí tu pregunta</label>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-primary btn-block"
                                    onClick={validar}
                                    style={{ display: "block" }}
                                >
                                    Preguntar
                                </button>
                                <button
                                    id="btnPreguntar"
                                    type="submit"
                                    className="btn btn-primary btn-block"
                                    onClick={handleSendMessage}
                                    style={{ display: "none" }}
                                >
                                    Preguntar
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
