const URL = "http://localhost:4000/api/cursos";

export const getCursos = async () => {
    try {
        const response = await fetch(URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            }
        });
        const data = await response.json();
        if(response.status !== 200) {
            throw new Error("No se encontraron los cursos");
        }
        
        return data
    } catch (error) {
        throw error
    }
}


export const postCurso = async (req, res, next) => {
    try {
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        if(response.status !== 200) {
            throw new Error(data.message || "Error al registrar el curso");
        }
        
        return data
    } catch (error) {
        throw error
    }
}


export const putCurso = async (curso) => {
    try {

        console.log("PUT CURSO", curso)
        
        const response = await fetch(URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: JSON.stringify({
                ...curso
            })
        });


        const data = await response.json();
        if(response.status !== 200) {
            throw new Error(data.message || "Error al registrar el curso");
        }
        
        return data
    } catch (error) {
        throw error
    }
}