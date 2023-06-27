
const form = document.querySelector('form')

//vérifie si message d'erreur existant, si oui, on le supprime
function removeErrorMessage () {
    const errorMessageExist = document.querySelector('.error')
        if (errorMessageExist ){
                errorMessageExist.remove()
            }
        }

//Ecouteur d'événements sur la soumission du formulaire
form.addEventListener('submit', async (event)=> {
        event.preventDefault(); // Empêche le rechargement de la page après la soumission du formulaire
        
        // Récupération des valeurs des champs e-mail et mot de passe
        const currentEmail = document.getElementById("mail").value;
        const currentPassword = document.getElementById("password").value;
        try{
        // Construction de l'objet à envoyer à l'API
        const data = {
            email: currentEmail,
            password: currentPassword
        };
        console.log(data)
        // Appel à l'API avec les données du formulaire
        const response = await fetch("http://localhost:5678/api/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        //Récupère la réponse de l'API au format JSON
        const jsonData = await response.json() ;

         // Vérification si la réponse contient un jeton d'accès
        if (jsonData.token) {
            // Stockage du jeton d'accès dans le stockage local
            localStorage.setItem("token", jsonData.token);
            console.log("Jeton d'accès enregistré dans le stockage local.");
            window.location.href = "./index.html";//page rédirigée vers l'index
        }
        else {  
        //Affichage message erreur si l'identification échoue
            removeErrorMessage();

            const logIn= document.querySelector('h2')
            const errorMessage = document.createElement ('p');
            errorMessage.classList.add("error")
            errorMessage.innerText = "Erreur dans l'identifiant ou le mot de passe"
            logIn.insertAdjacentElement('afterend',errorMessage)
            }

           const border = document.querySelectorAll('input')
           border.forEach(element => {
                element.classList.add ("borderError")
            });
        } 
                   
    catch (error){
        console.log(error)
    }

})
