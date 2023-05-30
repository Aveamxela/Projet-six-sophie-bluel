// Récupération données depuis API
async function collectWorks (){
    const response = await fetch ("http://localhost:5678/api/works", {
        method :'GET',
        //On attend une réponse au format json
        headers : {
            'Accept': 'application/json',
        },
    }) 
    //stocke les données récupérées depuis l'API  au format JSON dans variable
    const jsonData = await response.json() ;
    return jsonData
}
//Appeler la fonction pour récupérer les données depuis l'API
collectWorks()
const gallery = document.querySelector('.gallery')

// Ajout des travaux à la galerie
async function addWorks () {
    //Récupération des données depuis l'API
    const works = await collectWorks();
    // Création balises HTML pour chaque élément
    works.forEach(work => {
        const addTag = `
                    <figure>
                        <img src = ${work.imageUrl} alt = ${work.title} >
                        <figcaption> ${work.title} </figcaption>
                    </figure>`
        //Ajout des balises à la gallerie
        gallery.innerHTML += addTag;
    });
    console.log(works)
}
//Ajout des balises à la galerie
addWorks()
