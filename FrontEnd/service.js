// Récupération données depuis API
export { getWorks, getBtn, deleteWorkFromApi, sendData, postLog };

async function collectData(url) {
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    //stocke les données récupérées depuis l'API  au format JSON dans variable
    const jsonData = await response.json();
    return jsonData;
}

async function getWorks() {
    const works = await collectData("http://localhost:5678/api/works"); // Récupération des données depuis l'API
    return works;
}
async function getBtn() {
    const categories = await collectData(
        "http://localhost:5678/api/categories"
    );
    return categories;
}
async function deleteWorkFromApi(id) {
    const response = await fetch(`http://localhost:5678/api/works/${id}`, {
        method: "DELETE",
        headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
}
const token = localStorage.getItem("token");
console.log(token);
// envoie requete post avec les données du formulaire
async function sendData(formData) {
    const response = await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });
    // Stocke les données JSON récupérées depuis l'API dans une variable
    const dataResponse = await response.json();
    return dataResponse;
}

// Appel à l'API avec les données du formulaire
async function postLog(data) {
    const response = await fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    //Récupère la réponse de l'API au format JSON
    const jsonData = await response.json();
    return jsonData;
}
