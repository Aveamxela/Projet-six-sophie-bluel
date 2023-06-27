const hideModal = document.querySelector(".hideModal");
const hideModal2 = document.querySelector(".hideModal2");
const gallery = document.querySelector(".gallery");
let works;
let categories;
const sectionBtn = document.querySelector(".allBtn");

// Récupération données depuis API
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

// Ajout des travaux à la galerie
async function addWorks() {
    //Récupération des données depuis l'API
    works = await collectData("http://localhost:5678/api/works");
    // Création balises HTML pour chaque élément
    gallery.innerHTML = works
        .map(
            (work) => `
      <figure>
        <img src="${work.imageUrl}" alt="${work.title}">
        <figcaption>${work.title}</figcaption>
      </figure>
    `
        )
        .join("");
}

// Ajout des boutons de catégorie à la galerie
async function addBtn() {
    categories = await collectData("http://localhost:5678/api/categories");
    categories.push({ id: 0, name: "Tous" });
    // Tri des catégories par ID
    categories.sort((a, b) => a.id - b.id);
    // Ajout des boutons pour chaque catégorie
    sectionBtn.innerHTML = categories
        .map(
            (category) => `
      <button class="btn clickable" id="btn${category.id}">${category.name}</button>
    `
        )
        .join("");
}

// Filtrage works en fonction de la catégorie sélectionnée
function filter() {
    //création tableau contenant les .btnActive
    const selectedBtns = Array.from(document.querySelectorAll(".btnActive"));

    gallery.innerHTML = works
        // filtre les elements du tableau selon certaines conditions
        .filter(
            //les différentes conditions
            (work) =>
                selectedBtns.length === 0 || //si aucun sélectionné, afficher tous
                selectedBtns.map((btn) => btn.id).includes("btn0") || //si bouton "tous" alors affihcer tous
                selectedBtns
                    .map((btn) => btn.id)
                    .includes(`btn${work.categoryId}`) // si bouton correspond à categorie alors afficher les works
        )
        // si condition OK ajout à la gallerie
        .map(
            (work) => `
      <figure>
        <img src="${work.imageUrl}" alt="${work.title}">
        <figcaption>${work.title}</figcaption>
      </figure>
    `
        )
        .join(""); // sert à concaténer tous les ééments du tableau généré par map
}

// Gérer le changement de style des boutons lors du clic
function btnActive() {
    const btnAll = document.getElementById("btn0");
    const btnsOthers = document.querySelectorAll("#btn1, #btn2, #btn3");
    const allBtns = document.querySelectorAll(".btn");

    //Si bouton "Tous" selectionné désélectionner les autres
    btnAll.addEventListener("click", () => {
        //ajoute ou supprime la classe au bouton "tous"
        btnAll.classList.toggle("btnActive");
        //supression de la classe aux aoutres boutons
        btnsOthers.forEach((btnClick) => {
            btnClick.classList.remove("btnActive");
        });
        //MAJ du filtrage des éléments
        filter();
    });
    //Si un bouton sélectionné, déselectionner le bouton "tous"
    btnsOthers.forEach((btnClick) => {
        btnClick.addEventListener("click", () => {
            //ajoute ou supprime la classe
            btnClick.classList.toggle("btnActive");
            // Supprime la classe "btnActive" du bouton "Tous"
            btnAll.classList.remove("btnActive");
            // vérifie si tous les autres boutons sont sélectionnés
            const allBtnsActive = Array.from(btnsOthers).every((btn) =>
                btn.classList.contains("btnActive")
            );
            // Si c'est le cas, alors sélectionner le bouton "Tous" et déselectionner les autres
            if (allBtnsActive) {
                btnsOthers.forEach((btn) => {
                    btn.classList.remove("btnActive");
                });
                btnAll.classList.add("btnActive");
            }
            filter();
        });
    });

    filter();
}

// Si utilisateur connecté :
const token = localStorage.getItem("token");
const removeHide = document.querySelectorAll(".hide");
const btnAddImg = document.querySelector(".addImg");
if (token) {
    const editionMode = document.querySelector(".editionMode");
    editionMode.style.setProperty("display", "flex");
    removeHide.forEach((element) => {
        element.classList.remove("hide");
    });
    const login = document.querySelector(".login");
    login.classList.add("hide");
    sectionBtn.style.setProperty("display", "none");

    //Apparation modale
    const imageModif = document.querySelectorAll(".imageModif");

    //requete pour supprimer image
    async function collectDeleteWorks(id) {
        const response = await fetch(`http://localhost:5678/api/works/${id}`, {
            method: "DELETE",
            headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
    }
    // Ajout des images dans la modale
    function addWorksToModal() {
        const modalContent = document.querySelector(".modalContent");
        //vide le contenu existant
        modalContent.innerHTML = "";
        //insertion de chaque work
        works.forEach((work) => {
            const addTag = `
      <figure class="position">
        <img src="${work.imageUrl}" alt="${work.title}" class="img-modal" data-id="${work.id}">
        <figcaption>éditer</figcaption>
        <div class="sup-img2 hide"></div>
        <i class="fa-solid fa-arrows-up-down-left-right hide clickable"></i>
        <div class="sup-img"></div>
        <i class="fa-solid fa-trash-can clickable"></i>
      </figure>
    `;
            modalContent.insertAdjacentHTML("beforeend", addTag);
        });

        const imgModal = document.querySelectorAll(".img-modal");
        // au hover, afficher flèche et son conteneur
        imgModal.forEach((img) => {
            img.addEventListener("mouseover", () => {
                img.parentNode
                    .querySelector(".sup-img2")
                    .classList.remove("hide");
                img.parentNode
                    .querySelector(".fa-arrows-up-down-left-right")
                    .classList.remove("hide");
            });
            // à la sortie du hover, recacher les éléments flèche et conteneur
            img.addEventListener("mouseout", () => {
                img.parentNode.querySelector(".sup-img2").classList.add("hide");
                img.parentNode
                    .querySelector(".fa-arrows-up-down-left-right")
                    .classList.add("hide");
            });
            //si poubelle cliqué alors
            img.parentNode
                .querySelector(".fa-trash-can")
                .addEventListener("click", async (event) => {
                    event.preventDefault();
                    //récupération de l'élément image associé à l'icone de la poubelle cliquée
                    const image = event.target //icone de la poubelle (élement de l'event)
                        .closest(".position") // recherche element le plus proche avec la classe .position (élément parent)
                        .querySelector(".img-modal"); // recherche element enfant de l'élément position correspondant à la classe .img-modal
                    //récupération de l'id de l'image
                    const id = image.dataset.id;
                    console.log(id);
                    //appel de la fonction pour supprimer l'image
                    try {
                        await collectDeleteWorks(id);
                        console.log("Image supprimée avec succès !");
                        //actualiser la galerie
                        await addWorks();
                        filter();
                    } catch (error) {
                        console.error(
                            "Erreur lors de la suppression de l'image :",
                            error
                        );
                    }
                });
        });
    }

    btnAddImg.addEventListener("click", () => {
        hideModal.style.setProperty("display", "none");
        hideModal2.style.setProperty("display", "flex");
    });

    //Ajout catégorie dans liste déroulante
    async function addCategory() {
        categories = await collectData("http://localhost:5678/api/categories");
        // Tri des catégories par ID
        categories.sort((a, b) => a.id - b.id);
        // Ajout option liste
        const chooseCategory = document.getElementById("chooseCategory");
        categories.forEach((category) => {
        const option = new Option(category.name, category.id); //le nom est affiché et l'id est sa valeur
        chooseCategory.add(option);
  });
}

addCategory();

    //Ajouter photo
    let addImgInput = document.getElementById("validationImg");

    addImgInput.addEventListener("change", updateImage);
    function updateImage() {
        const newImg = addImgInput.files; //récupération des fichiers sélectionnés par l'User
        const containerImg = document.querySelector(".containerImg");
        const afterUpdateImg = document.querySelector(".beforeUpdateImg");

        for (let i = 0; i < newImg.length; i++) {
            if (validFileSize(newImg[i])) { //vérification type de fichier valide
                const displayImg = document.createElement("img");
                displayImg.classList.add("sizing");
                displayImg.setAttribute("id", "imgForm");
                displayImg.src = window.URL.createObjectURL(newImg[i]);
                console.log("ok");
                containerImg.appendChild(displayImg);
                afterUpdateImg.style.setProperty("display", "none");
            } else {
                const errorType = document.createElement("p");
                errorType.textContent = "Format d'image non valide";
            }
        }
    }
    function validFileSize(file) {
            if (file.size < 4000000) {
                return true;
            } else {
                displayErrorMessage("La taille du fichier doit être inférieur à 4 Mo")
                return false
            }
        }
    //tous les champs remplis sinon message d'erreur
    const validationForm = document.getElementById("validationForm");
    const imgForm = document.getElementById("validationImg");
    const titleForm = document.getElementById("title");
    const categoryForm = document.getElementById("chooseCategory");
    const full = document.querySelector(".btnValid");

    validationForm.addEventListener("submit", (e) => { // Qd l'user soumet le formulaire
        e.preventDefault();

        if (
            imgForm.files.length === 0 || //si aucun fichier sélectionné
            titleForm.value.trim() === "" || //si champ vide
            categoryForm.value === "" // si aucune catégorie sélectionnée
        ) {
            displayErrorMessage("Veuillez renseigner tous les champs");
            return;
        } else {
            removeErrorMessage();
        }
    });
    // chaque fois qu'un des trois champs est modifié on fait appel aux fdonctions de rappel
    imgForm.addEventListener("input", () => {
        updateButtonColor();
        removeErrorMessage();
    });

    titleForm.addEventListener("input", () => {
        updateButtonColor();
        removeErrorMessage();
    });

    categoryForm.addEventListener("input", () => {
        updateButtonColor();
        removeErrorMessage();
    });

    function updateButtonColor() {
        if ( // vérifie si tous les champs sont remplis et valides
            imgForm.files.length > 0 &&
            titleForm.value.trim() !== "" &&
            categoryForm.value !== ""
        ) {
            full.style.setProperty("background-color", "#1D6154"); // Changer la couleur du bouton si tous les champs sont remplis
        } else {
            full.style.backgroundColor = ""; // Réinitialise la couleur du bouton si l'un des champs est vide
        }
    }
    //affiche le message d'erreur spécifié
    function displayErrorMessage(message) {
        const error = document.querySelector(".error");
        error.style.setProperty("display", "contents"); //affiche l'élément
        error.textContent = message;
    }
    //masque l'élément d'erreur
    function removeErrorMessage() {
        const error = document.querySelector(".error");
        error.style.setProperty("display", "none");
    }

    validationForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (imgForm.files[0] && titleForm.value && categoryForm.value) { // si champs remplis
            const formData = new FormData(); // contient les données du formulaire
            formData.append("image", imgForm.files[0]); //ajoute les données
            formData.append("title", titleForm.value);
            formData.append("category", categoryForm.value);
            sendData(formData);
        }
    });
    // envoie requete post avec les données du formulaire
    async function sendData(formData) {
        const response = await fetch("http://localhost:5678/api/works", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });
        console.log(token);

        // Stocke les données JSON récupérées depuis l'API dans une variable
        const dataResponse = await response.json();
        console.log(dataResponse);
    }

    //Ouvrir/fermer modale
    function openCloseModal() {
        const closeModalBtns = document.querySelectorAll(".close");
        const modalContainers = document.querySelectorAll(".positionModal");

        function closeModal() {
            hideModal.style.display = "none";
            hideModal2.style.display = "none";
        }

        // Open Modal
        if (hideModal.classList.contains("hideModal")) {
            imageModif.forEach((btn) => {
                btn.addEventListener("click", () => {
                    hideModal.style.display = "block";
                    addWorksToModal();
                });
            });
        }

        // Close Modal au clic
        closeModalBtns.forEach((closeBtn) => {
            closeBtn.addEventListener("click", () => {
                closeModal();
            });
        });

        // Close Modal en dehors Modal
        modalContainers.forEach((modalContainer) => {
            modalContainer.addEventListener("click", (event) => {
                if (event.target === modalContainer) { //verifie si le clic de l'utilisateur est le même élément 
                    closeModal();
                }
            });
        });
    }

    const arrowBack = document.querySelector(".back");
    arrowBack.addEventListener("click", () => {
        hideModal.style.setProperty("display", "flex");
        hideModal2.style.setProperty("display", "none");
        console.log("fonctionne");
    });
}

// suppression du token si logout
const logout = document.querySelector(".logout");
logout.addEventListener("click", () => {
    if (token) {
        localStorage.removeItem("token");
    }
});

async function init() {
    await addWorks();
    await addBtn();
    btnActive();
    filter();
    addWorksToModal();
    openCloseModal();
}
init();
