import {getAllWorks, getAllCategories, deleteWork, addWork} from "./api-requests.js";

// ENREGISTRE TOUS LES PROJETS RETOURNER PAR LE SERVEUR DANS UNE VARIABLE
let allWorks = [];
allWorks = await getAllWorks();

// ENREGISTRE TOUTES LES CATEGORIES RETOURNER PAR LE SERVEUR DANS UNE VARIABLE
let allCategories = [];
allCategories = await getAllCategories();

// AFFICHE TOUS LES PROJETS SUR LA PAGE
displayWorks(allWorks);

// CONSTRUIT ET AFFICHE LES CATEGORIES DANS LES BOUTONS DE FILTRES
buildAndDisplayFilters(allCategories);
console.log("Categories", allCategories);

// AFFICHE LES PROJETS DANS LA GALERIE
function displayWorks(list) {
  console.log("Projets", list);
  // ON VIDE LE CONTENEUR 
  galleryElement.innerHTML = "";
  // ON BOUCLE SUR LE TABLEAU ET ON UTILISE UN TEMPLATE HTML
  for (let i = 0; i < list.length; i++) {
    galleryElement.innerHTML += galleryTileTemplate(list[i].id, list[i].imageUrl, list[i].title);
  }
}

function galleryTileTemplate(id, url, title) {
  return `<figure data-id="${id}">
            <img src="${url}" alt="${title}" />
            <figcaption>${title}</figcaption>
          </figure>`;
}

function buildAndDisplayFilters(cat) {
  let filtersElement = document.createElement("div");

  // ON CREER DE TOUTE FACON LE BOURON "TOUS"
  let buttonAllCatElement = document.createElement("button");
  let portfolioTitle = portfolioElement.querySelector(".portfolio-title-block");
  filtersElement.classList.add("filtres");
  buttonAllCatElement.classList.add("button","active");
  buttonAllCatElement.innerText = "Tous";
  filtersElement.appendChild(buttonAllCatElement);

  // ON APPELLE LA FONCTION DE FILTRAGE SUR LE BOUTON "TOUS"
  filtering(buttonAllCatElement);
  
  // ON BOUCLE SUR LE TABLEAU DE CATEGORIE POUR CREER LES BOUTONS SUIVANTS
  for (let i = 0; i < cat.length; i++) {
    let button = document.createElement("button");
    button.classList.add("button");
    button.innerText = cat[i].name;
    filtersElement.appendChild(button);
   
    // ON APPELLE LA FONCTION DE FILTRAGE AVEC L'ID DE LA CATEGORIE
    filtering(button, cat[i].id);
  }
  
  // AFFICHE LES FILTRES
  portfolioTitle.after(filtersElement);
}

// ON SELECTIONNE LES PROJETS DE LA CATEGORIE DEMANDEE
function filtering(button, id) {
  button.addEventListener("click", (e) => {
    if(id !== undefined) {
      const catWorks = allWorks.filter(work => work.categoryId === id);
      displayWorks(catWorks);
    } else {
      displayWorks(allWorks);
    }
    // ON CHANGE L'ETAT ACTIF DU BOUTON
    document.querySelector(".active").classList.remove("active");
    button.classList.add("active");
  });
}



/*---------------------------------------------
                MODE EDITION
----------------------------------------------*/

let adminMode = sessionStorage.getItem("adminMode") ?? false;
let token = sessionStorage.getItem("auth") ?? "";
const bodyElem = document.querySelector("body");
const loginCta = document.getElementById("login-cta");

const adminModal = document.getElementById("admin-modal");
const adminModalContent = document.querySelector(".admin-modal-content");
const buttonEditGallery = document.querySelector(".edit-gallery");

let imgUploadedType = "";
let imgFile = null;
let workTitle = "";
let workCat = null;

// SI LOGIN OK ON MODIFIE LA PAGE D'ACCUEIL
if(adminMode) {
  // QUAND LA CLASSE "admin-mode" EST AJOUTEE AU BODY :
  // - LE BANDEAU "mode edition" EST AFFICHE
  // - LES FILTRES SONT CACHES
  // - LE BOUTON "modifier" EST AFFICHE ET ACTIVE
  bodyElem.classList.add("admin-mode");
  
  // LOGIN DEVIENT LOGOUT
  loginCta.innerText = "Logout";

  // AU LOGOUT ON RETOURNE AU MODE PUBLIC
  loginCta.addEventListener("click", (e) => {
    disableAdminMode(e);
  }, {once: true});

  // OUVERTURE DE LA MODAL
  buttonEditGallery.addEventListener("click", () => {
    // ON CONSTRUIT L'AFFICHAGE DES PROJETS DANS LA MODAL
    feedModalWithPhotos(adminModalContent);
    adminModal.showModal();
  });
  
  // FERMETURE DE LA MODAL AU CLIC A L'EXTERIEUR
  adminModal.addEventListener("click", () => {
    closingModal(adminModal);
  });

  // EMPECHE LA FERMETURE DE LA MODAL AU CLIC A L'INTERIEUR DE LA MODAL SAUF SUR LE BOUTON CROIX
  adminModalContent.addEventListener("click", (e) => {
    if(e.target.classList[0] === "close-modal") {
      closingModal(adminModal);
    } else {
      e.stopPropagation();
    }
  });
}

function disableAdminMode(e) {
  e.preventDefault();
  bodyElem.classList.remove("admin-mode");
  adminMode = false;
  token = "";
  sessionStorage.removeItem("adminMode");
  sessionStorage.removeItem("auth");
  sessionStorage.removeItem("tokenCreationDate");
  loginCta.innerText = "Login";
}

function closingModal(modal) {
  modal.close();
}

function feedModalWithPhotos(contentZone) {
  let htmlTemplate = `<button class="close-modal"></button>
                      <h2>Galerie photo</h2>
                      <div class="gallery">`;
  
  // ON BOUCLE SUR LE TABLEAU POUR AFFICHER CHAQUE IMAGE DES PROJETS ET ON AJOUTE LES BOUTONS CORBEILLE
  for (let i = 0; i < allWorks.length; i++) {
    htmlTemplate += `<figure data-id="${allWorks[i].id}">
                      <img
                      src="${allWorks[i].imageUrl}"
                      alt="${allWorks[i].title}"
                      />
                      <button class="remove-work"></button>
                    </figure>`;
  }
  htmlTemplate +=  `</div>
  <hr />
  <button class="add-work">Ajouter une photo</button>`;
  contentZone.innerHTML = htmlTemplate;

  // ON SUPPRIME LA CLASS "add-content" SPECIFIQUE A LA PHASE 2
  contentZone.classList.remove("add-content");
  
  // POUR CHAQUE BOUTON CORBEILLE ("button.remove-work")
  const trashButtons = document.querySelectorAll(".remove-work");
  for (let i = 0; i < trashButtons.length; i++) {
    trashButtons[i].addEventListener("click", async (e) => {
      // IDENTIFIE LE PROJET ID VIA L'ATTRIBUT "data-id"
      const id = e.target.parentNode.dataset.id;
      // INITIALISATION DU STATUT DE LA REPONSE DE L'API
      let responseStatus = 0;
      // SI LE TOKEN N'EST PAS EXPIRE ON REQUETE L'API POUR SUPPRIMER LE PROJET
      if(isTokenGood()) {
        await deleteWork(id, token).then((response) => {
          responseStatus = response.status;
        });
        // QUAND L'API CONFIRME LA SUPPRESSION PAR UN STATUT 2**:
        // - ON SUPPRIME L'IMAGE DE LA MODAL
        // - ET DE LA PAGE
        // - MET A JOUR LE TABLEAU "allWorks"
        if(/^2\d{2}$/.test(responseStatus)) {
          contentZone.querySelector(`[data-id="${id}"]`).remove();
          galleryElement.querySelector(`[data-id="${id}"]`).remove();
          allWorks = await getAllWorks();
        }
      } else {
        alert("La connexion a expiré");
      }
    }, {once: true});
  }

  // AU CLIC SUR AJOUTER ON CHANGE LE HTML DE LA MODAL POUR AFFICHER A LA PLACE LE FORMULAIRE DE CONNEXION
  const addWorkButton = document.querySelector(".add-work");
  addWorkButton.addEventListener("click", () => {
    feedModalWithAddForm(contentZone);
  }, {once: true});
}

function isTokenGood() {
  const date = new Date();
  const now = date.getTime();
  const twentyfourhours = 24 * 60 * 60 * 1000;
  if(token) {
    return (twentyfourhours - (now - sessionStorage.getItem("tokenCreationDate"))) > 0 ? true : false;
  } else {
    return false;
  }
}

function feedModalWithAddForm(contentZone) {
  let htmlTemplate = `<button class="close-modal"></button>
                      <button class="debut-modal"></button>
                      <h2>Ajout photo</h2>
                      <form action="#" id="add-work-form">
                        <div class="file-box">
                          <div class="file-select-box">
                            <label for="img"
                              ><span class="file-label-cta">+ Ajouter photo</span>
                              <span class="file-label-limits"
                                >jpg, png : 4mo max</span
                              ></label
                            >
                            <input
                              type="file"
                              accept=".png, .jpeg, .jpg"
                              name="img"
                              id="img"
                            />
                          </div>
                          <div class="file-preview"></div>
                        </div>
                        <label for="titre">Titre</label>
                        <input type="text" name="titre" id="titre" />
                        <label for="category">Catégorie</label>
                        <select name="category" id="category">
                          <option value=""></option>`;
                          for (let i = 0; i < allCategories.length; i++) {
                            htmlTemplate += `<option value="${allCategories[i].id}">${allCategories[i].name}</option>`;
                          }
                          htmlTemplate += `</select>
                        <hr />
                        <input
                          class="modal-submit"
                          type="submit"
                          value="valider"
                          disabled
                        />
                      </form>`;
  contentZone.innerHTML = htmlTemplate;
  contentZone.classList.add("add-content");
    
  // AU CLIC SUR LA FLECHE EN HAUT A GAUCHE ON REAFFICHE LA GALERIE DE SUPPRESSION
  document.querySelector(".debut-modal").addEventListener("click", () => {
    feedModalWithPhotos(contentZone);
  }, {once:true});
    
  const theForm = document.getElementById("add-work-form");
  // LE BOUTON DE SOUMISSION EST DESACTIVE PAR DEFAUT
  // LA FONCTION "checkForm" VERIFIE QUE TOUS LES CHAMPS SONT OK ET ACTIVE LE BOUTON DE SOUMISSION
  checkForm(theForm);
  // ON A PAS BESOIN D'ATTENDRE LA VALIDATION POUR CREER LE COMPORTEMENT DE SOUMISSION
  theForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    let responseStatus = NaN;
    // SI LE TOKEN N'EST PAS EXPIRE ON REQUETE L'API POUR AJOUTER LE PROJET
    if(isTokenGood()) {
      const response = await addWork(imgFile, workTitle, workCat, token)
      .then(response => {
        responseStatus = response.status;
        return response.json();
      });
      // QUAND L'API RENVOI UN STATUT 2** CELA CONFIRME QUE LE PROJET A ETE AJOUTE EN BASE
      // - ON AJOUTE LE PROJET A LA GALERIE DE LA PAGE D'ACCUEIL
      // - ON MET A JOUR LA TABLEAU "allWorks" EN REFESANT UNE REQUETE A L'API (SI ON RETOURNE A L'ETAPE 1 LA MODAL SE MET A JOUR)
      // - ON AFFICHE UNE BOITE DE CONFIRMATION ET ON DEMANDE STOP OU ENCORE. SI ENCORE ON REINITIALISE LE FORMULAIRE SINON ON FERME LA MODAL
      if(/^2\d{2}$/.test(responseStatus)) {
        galleryElement.innerHTML += galleryTileTemplate(response.id, response.imageUrl, response.title);
        allWorks = await getAllWorks();
        if(window.confirm("L'élément a été ajouté avec succès. Continuer ?")) resetForm(theForm);
        else closingModal(adminModal);
      // SI L'API NE RENVOIE PAS UN STATUT 2** ON AFFICHE LE CODE ERREUR OU ERREUR INCONNUE
      } else {
        alert("Erreur : " + responseStatus || "inconnue");
      }
    } else {
      alert("La connexion a expiré");
    }
  });
}

function checkForm(theform) {
  const fileElt = theform.querySelector("#img");
  const titleElt = theform.querySelector("#titre");
  const categoryElt = theform.querySelector("#category");
  const submitElt = theform.querySelector(".modal-submit");
  const specsText = theform.querySelector(".file-label-limits");
  const filePreview = theform.querySelector(".file-preview");
  
  // ON VERIFIE LE CHAMP FILE SUR L'EVENEMENT CHANGE
  fileElt.addEventListener("change", (e) => {
    // ON RESET LE HTML SI CE N'EST PAS LA PREMIERE FOIS
    // - CAS OU ON VEUX CHANGER D'IMAGE
    if(filePreview.hasChildNodes()) {
      filePreview.childNodes[0].remove();
      theform.querySelector(".file-box").classList.remove("file-box__preview");
    }
    // - SUPPRESSION DU MESSAGE D'ERREUR
    if(theform.querySelector(".img-error-msg") !== null) theform.querySelector(".img-error-msg").remove();

    // VERIFICATION DU POIDS ET DU TYPE D'IMAGE. SI OK AFFICHAGE D'UNE PREVISUALISATION
    if(checkImage(fileElt)) {
      previewImage(fileElt.files[0]);
      // ON VERIFIE TOUS LES CHAMPS POUR POUVOIR ACTIVER LE BOUTON VALIDER
      enableSubmit(fileElt.files[0], titleElt.value, categoryElt.value, submitElt);
    // SINON AFFICHE DU MESSAGE D'ERREUR
    } else {
      displayImgErrorMsg(specsText);
    }
  });
  
  // VERIFICATION DU CHAMP TITRE
  titleElt.addEventListener("change", (e) => {
    // ON VERIFIE TOUS LES CHAMPS POUR POUVOIR ACTIVER LE BOUTON VALIDER
    enableSubmit(fileElt.files[0], titleElt.value, categoryElt.value, submitElt);
  });
  
  // VERIFICATION DU SELECTEUR DE CATEGORIES
  categoryElt.addEventListener("change", (e) => {
    // ON VERIFIE TOUS LES CHAMPS POUR POUVOIR ACTIVER LE BOUTON VALIDER
    enableSubmit(fileElt.files[0], titleElt.value, categoryElt.value, submitElt);
  });
}

function checkImage(fileElt) {
  let numberOfBytes = 0;
  const file = fileElt.files[0];
  imgUploadedType = file.type;
  numberOfBytes = file.size;
  // RENVOIE VRAI SI LA TAILLE EST INFERIEUR A 4 Mo ET QUE LE TYPE EST JPG OU PNG. REVOIE FAUX SINON
  return ((numberOfBytes / 1048576).toFixed(1) < 4 && /jpeg|png/.test(imgUploadedType));

}

function previewImage(file) {
  const img = document.createElement("img");
  const filePreview = document.querySelector(".file-preview");
  filePreview.innerHTML = "";
  document.querySelector(".file-box").classList.add("file-box__preview");
  
  // https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications#example_showing_thumbnails_of_user-selected_images
  const reader = new FileReader();
  reader.onload = (e) => {
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);

  filePreview.appendChild(img);
}
  
function enableSubmit(a,b,c,d) {
  // SI TOUS LES CHAMPS SONT OK ON ENREGISTRE LES VALEURS DANS DES VARIABLES ET ON AUTORISE LE CHAMP VALIDER
  if(a && !!b && !!c) {
    imgFile = a;
    workTitle = b;
    workCat = c;
    d.removeAttribute("disabled");
  }
  // SINON ON DESACTIVE LE CHAMP VALIDER
  else d.setAttribute("disabled","");
}

function displayImgErrorMsg(spectext) {
  const imgErrorMsg = document.createElement("span");
  imgErrorMsg.classList.add("img-error-msg");
  imgErrorMsg.innerText = "L'image excède 4Mo ou elle n'est pas un jpg ou un png";
  spectext.after(imgErrorMsg);
}

function resetForm(theform) {
  theform.querySelector(".file-preview").childNodes[0].remove();
  theform.querySelector(".file-box").classList.remove("file-box__preview");
  theform.querySelector(".modal-submit").setAttribute("disabled","");
  theform.querySelector("#titre").value = "";
  theform.querySelector("#category").value = "";
}