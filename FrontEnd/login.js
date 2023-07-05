const form = document.querySelector("form");
import { postLog } from "./service.js";
//vérifie si message d'erreur existant, si oui, on le supprime
function removeErrorMessage() {
    const errorMessageExist = document.querySelector(".error");
    if (errorMessageExist) {
        errorMessageExist.remove();
    }
}


//Ecouteur d'événements sur la soumission du formulaire
form.addEventListener("submit", async (event) => {
    event.preventDefault(); // Empêche le rechargement de la page après la soumission du formulaire

    // Récupération des valeurs des champs e-mail et mot de passe
    const currentEmail = document.getElementById("mail").value;
    const currentPassword = document.getElementById("password").value;
    try {
        // Construction de l'objet à envoyer à l'API
        const data = {
            email: currentEmail,
            password: currentPassword,
        };
        console.log(data);
       
        // Vérification si la réponse contient un jeton d'accès
        const response = await postLog(data)
        console.log(response)
        if (response.token) {
            console.log("fonctionne")
            // Stockage du jeton d'accès dans le stockage local
            localStorage.setItem("token", response.token);
            console.log("Jeton d'accès enregistré dans le stockage local.");
            window.location.href = "./index.html"; //page rédirigée vers l'index
        } else {
            //Affichage message erreur si l'identification échoue
            removeErrorMessage();

            const logIn = document.querySelector("h2");
            const errorMessage = document.createElement("p");
            errorMessage.classList.add("error");
            errorMessage.textContent =
                "Erreur dans l'identifiant ou le mot de passe";
            logIn.insertAdjacentElement("afterend", errorMessage);
        }

        const border = document.querySelectorAll("input");
        border.forEach((element) => element.classList.add("borderError"));
    } catch (error) {
        console.log(error);
    }
});
