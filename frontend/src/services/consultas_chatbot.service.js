const URL = process.env.REACT_APP_API_URL + "/consultasChatbot";

export const insertarConsultasChatbot = async (consulta) => {
    try {
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ consulta: consulta }), // Convertir el objeto a JSON
        });

        if (response.status !== 201 && response.status !== 200) { // Verificar el estado adecuado para un POST exitoso (normalmente 201)
            const errorData = await response.json(); // Intentar obtener los detalles del error del servidor
            throw new Error(errorData.message || 'Error desconocido al procesar la solicitud.');
        }

        const data = await response.json(); // Procesar la respuesta si es necesario
        return data; // Devolver la respuesta procesada
    } catch (error) {
        console.error("Error al insertar la consulta:", error);
        throw error; // Propagar el error para manejarlo fuera
    }
}

