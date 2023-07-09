//Import
import { getWorks, getBtn, deleteWorkFromApi, sendData } from "./service.js";
// Variables globales
const hideModal = document.querySelector(".hideModal");
const hideModal2 = document.querySelector(".hideModal2");
const gallery = document.querySelector(".gallery");
let works = await getWorks();
const categories = await getBtn();
const sectionBtn = document.querySelector(".allBtn");
const closeModalBtns = document.querySelectorAll(".close");
const modalContainers = document.querySelectorAll(".positionModal");
const removeHide = document.querySelectorAll(".hide");
const btnAddImg = document.querySelector(".addImg");
const editionMode = document.querySelector(".editionMode");
const login = document.querySelector(".login");
const imageModif = document.querySelectorAll(".imageModif");
const imgForm = document.getElementById("validationImg");
const titleForm = document.getElementById("title");
const categoryForm = document.getElementById("chooseCategory");
const full = document.querySelector(".btnValid");
const containerImg = document.querySelector(".containerImg");
const afterUpdateImg = document.querySelector(".beforeUpdateImg");

/**
 * Vérification authentification
 * Pas de paramètres
 * return void
 */
function checkLogin() {
    const token = localStorage.getItem("token");
    if (token) {
        return true;
    } else {
        return false;
    }
}

// Ajout des travaux à la galerie
async function addWorks() {
    gallery.innerHTML = works
        .map(
            // Création balises HTML pour chaque élément
            (work) => `
      <figure>
        <img src="${work.imageUrl}" alt="${work.title}">
        <figcaption>${work.title}</figcaption>
      </figure>
    `
        )
        .join(""); // sert à concaténer tous les éléments du tableau généré par map
    console.log("ca fonctionne");
}

// Ajout des boutons de catégorie à la galerie
async function addBtn() {
    categories.push({ id: 0, name: "Tous" }); // Tri des catégories par ID
    categories.sort((a, b) => a.id - b.id); // Ajout des boutons pour chaque catégorie
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
        .filter(
            // filtre les elements du tableau selon certaines conditions
            (work) =>
                selectedBtns.length === 0 ||
                selectedBtns.map((btn) => btn.id).includes("btn0") ||
                selectedBtns
                    .map((btn) => btn.id)
                    .includes(`btn${work.categoryId}`)
        )
        .map(
            // si condition OK ajout à la gallerie
            (work) => `
      <figure>
        <img src="${work.imageUrl}" alt="${work.title}">
        <figcaption>${work.title}</figcaption>
      </figure>
    `
        )
        .join("");
}

// Gérer le changement de style des boutons lors du clic
function btnActive() {
    const btnAll = document.getElementById("btn0");
    const btnsOthers = document.querySelectorAll("#btn1, #btn2, #btn3");

    //Si bouton "Tous" selectionné désélectionner les autres
    btnAll.addEventListener("click", () => {
        btnAll.classList.toggle("btnActive"); //ajoute ou supprime la classe au bouton "tous"
        btnsOthers.forEach((btnClick) => {
            //supression de la classe autres boutons
            btnClick.classList.remove("btnActive");
        });
        filter(); //MAJ du filtrage des éléments
    });
    //Si un bouton sélectionné, déselectionner le bouton "tous"
    btnsOthers.forEach((btnClick) => {
        btnClick.addEventListener("click", () => {
            btnClick.classList.toggle("btnActive"); //ajoute ou supprime la classe
            btnAll.classList.remove("btnActive"); // Supprime la classe "btnActive" du bouton "Tous"
            const allBtnsActive = Array.from(btnsOthers).every(
                (
                    btn // vérifie si ts les autres boutons sont sélectionnés
                ) => btn.classList.contains("btnActive")
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
function showBanner() {
    editionMode.style.setProperty("display", "flex");
    removeHide.forEach((element) => {
        element.classList.remove("hide");
    });
}

function hideLoginBtn() {
    login.classList.add("hide");
    sectionBtn.style.setProperty("display", "none");
}

// Ajout des images dans la modale
function addWorksToModal() {
    const modalContent = document.querySelector(".modalContent");
    modalContent.innerHTML = ""; //vide le contenu existant
    works.forEach((work) => {
        //insertion de chaque work
        const addTag = `
      <figure class="position work" data-workid="${work.id}">
        <img src="${work.imageUrl}" alt="${work.title}" class="img-modal">
        <figcaption>éditer</figcaption>
        <div class="sup-img2 hide"></div>
        <i class="fa-solid fa-arrows-up-down-left-right hide clickable"></i>
        <div class="sup-img"></div>
        <i class="fa-solid fa-trash-can clickable"></i>
      </figure>
    `;
        modalContent.insertAdjacentHTML("beforeend", addTag);
    });
    addRemoveArrow();
    deleteWorks();
}

// au hover, afficher flèche et son conteneur
function addRemoveArrow() {
    const allWorks = document.querySelectorAll(".work");
    allWorks.forEach((work) => {
        const arrow = work.querySelector(".fa-arrows-up-down-left-right");
        const containerArrow = work.querySelector(".sup-img2");
        const elements = [arrow, containerArrow];
        work.addEventListener("mouseover", () => {
            elements.forEach((element) => {
                element.classList.remove("hide");
            });
        });
        // à la sortie du hover, recacher les éléments flèche et conteneur
        work.addEventListener("mouseout", () => {
            elements.forEach((element) => {
                element.classList.add("hide");
            });
        });
    });
}

async function deleteWork(id) {
    //appel de la fonction pour supprimer l'image
    try {
        await deleteWorkFromApi(id);
        console.log("Image supprimée avec succès !");
    } catch (error) {
        console.error("Erreur lors de la suppression de l'image :", error);
    }
}
function deleteWorks() {
    const allWorks = document.querySelectorAll(".work");
    allWorks.forEach((workElement) => {
        const trash = workElement.querySelector(".fa-trash-can");
        trash.addEventListener("click", async (event) => {
            event.preventDefault();
            await deleteWork(workElement.dataset.workid);
            works = await getWorks();
            await addWorks();
            addWorksToModal();
            filter();
        });
    });
}
//------------------------------------------------------------------------------------------

function changeModal() {
    btnAddImg.addEventListener("click", () => {
        hideModal.style.setProperty("display", "none");
        hideModal2.style.setProperty("display", "flex");
    });
}

//Ajouter photo (lorsque l'utilisateur modifie la valeur de l'élément)
imgForm.addEventListener("change", updateImage);
function updateImage() {
    let newImg = imgForm.files[0]; //récupération des fichiers sélectionnés par l'User
    if (newImg && validFileSize(newImg) && validFileType(newImg)) {
        const displayImg = document.createElement("img");
        displayImg.classList.add("sizing");
        displayImg.setAttribute("id", "imgForm");
        displayImg.src = window.URL.createObjectURL(newImg);
        containerImg.appendChild(displayImg);
        afterUpdateImg.style.setProperty("display", "none");
        console.log("img OK");
    }
}

function validFileSize(file) {
    if (file.size < 4000000) {
        console.log("size OK");
        return true;
    } else {
        displayErrorMessage("La taille du fichier doit être inférieur à 4 Mo");
        return false;
    }
}
function validFileType(file) {
    const acceptedTypes = ["image/jpeg", "image/png"]; //types fichier acceptés
    if (acceptedTypes.includes(file.type)) {
        return true;
    } else {
        displayErrorMessage("Le type de fichier n'est pas valide");
        return false;
    }
}
//Ajout catégorie dans liste déroulante
async function addCategory() {
    categories.shift(); //enlève le premier élément du tableau donc id=0 (tous)
    categories.sort((a, b) => a.id - b.id); // Tri des catégories par ID
    const chooseCategory = document.getElementById("chooseCategory");
    categories.forEach((category) => {
        const option = new Option(category.name, category.id); //le nom est affiché et l'id est sa valeur
        chooseCategory.add(option);
    });
}
//Soumission du formulaire
function submitForm() {
    const validationForm = document.getElementById("validationForm");
    validationForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (
            imgForm.files.length === 0 || //si aucun fichier sélectionné
            titleForm.value.trim() === "" || //si champ vide
            categoryForm.value === "" // si aucune catégorie sélectionnée
        ) {
            displayErrorMessage("Veuillez renseigner tous les champs");
        } else {
            // si champs remplis
            const formData = new FormData(); // contient les données du formulaire
            formData.append("image", imgForm.files[0]); //ajoute les données
            formData.append("title", titleForm.value);
            formData.append("category", categoryForm.value);
            sendData(formData);
            console.log("en premier");
            changeUserForm();
            hideModal2.style.display = "none";
            works = await getWorks();
            await addWorks();
            console.log("en deuxieme");
            filter();
            addWorksToModal();
            validationForm.reset();
            const previewImage = document.getElementById("imgForm");
            previewImage.remove();
            afterUpdateImg.style.setProperty("display", "contents");
        }
    });
}
function changeUserForm() {
    // chaque fois qu'un des trois champs est modifié on fait appel aux fonctions de rappel
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
}

function updateButtonColor() {
    if (
        // vérifie si tous les champs sont remplis et valides
        imgForm.files.length > 0 &&
        titleForm.value.trim() !== "" &&
        categoryForm.value !== ""
    ) {
        full.style.setProperty("background-color", "#1D6154"); // Changer la couleur du bouton si tous les champs sont remplis
    } else {
        full.style.backgroundColor = ""; // Réinitialise la couleur du bouton si l'un des champs est vide
    }
}
//masque l'élément d'erreur
function removeErrorMessage() {
    const error = document.querySelector(".error");
    error.style.setProperty("display", "none");
}

//affiche le message d'erreur spécifié
function displayErrorMessage(message) {
    const error = document.querySelector(".error");
    error.style.setProperty("display", "contents"); //affiche l'élément
    error.textContent = message;
}

function openModal() {
    // Open Modal
    if (hideModal.classList.contains("hideModal")) {
        imageModif.forEach((btn) => {
            btn.addEventListener("click", () => {
                hideModal.style.display = "block";
                addWorksToModal();
            });
        });
    }
}

function closeModal() {
    // Close Modal au clic
    closeModalBtns.forEach((closeBtn) => {
        closeBtn.addEventListener("click", () => {
            hideModal.style.display = "none";
            hideModal2.style.display = "none";
        });
    });

    // Close Modal en dehors Modal
    modalContainers.forEach((modalContainer) => {
        modalContainer.addEventListener("click", (event) => {
            if (event.target === modalContainer) {
                //verifie si le clic de l'utilisateur est sur modalContainers et non sur l'un de ses enfants
                hideModal.style.display = "none";
                hideModal2.style.display = "none";
            }
        });
    });
}
function arrowBack() {
    const back = document.querySelector(".back");
    back.addEventListener("click", () => {
        hideModal.style.setProperty("display", "flex");
        hideModal2.style.setProperty("display", "none");
    });
}

// suppression du token si logout
function logOut() {
    const logout = document.querySelector(".logout");
    logout.addEventListener("click", () => {
        if (checkLogin) {
            localStorage.removeItem("token");
        }
    });
}

async function init() {
    await addBtn();
    btnActive();
    filter();
    logOut();

    await addWorks();
    if (checkLogin()) {
        // si connecte
        showBanner();
        hideLoginBtn();
        openModal();
        closeModal();
        addWorksToModal();
        deleteWorks();
        addRemoveArrow();
        changeModal();
        arrowBack();
        addCategory();
        updateImage();
        changeUserForm();
        updateButtonColor();
        removeErrorMessage();
        displayErrorMessage();
        submitForm();
    }
}
init();
