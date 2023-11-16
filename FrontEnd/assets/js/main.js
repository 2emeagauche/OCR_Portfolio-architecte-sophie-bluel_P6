import {getAllWorks, getAllCategories, deleteWork, addWork} from "./api-requests.js";

// Get all the works from localStorage or server
let allWorks = [];

// Used at first use or after admin modifications
allWorks = await getAllWorks();

// Get all the categories from localStorage or server
let allCategories = [];
allCategories = await getAllCategories();

// Display all works
displayWorks(allWorks);
// Build and display filters
buildAndDisplayFilters(allCategories);


let adminMode = sessionStorage.getItem("adminMode") ?? false;
let token = sessionStorage.getItem("auth") ?? "";
const bodyElem = document.querySelector("body");
const loginCta = document.getElementById("login-cta");

const adminModal = document.getElementById("admin-modal");
const adminModalContent = document.querySelector(".protect-from-close-event");
const buttonEdit = document.querySelector(".edit-gallery");

let imgUploadedType = "";
// let imgUploadedSize = 0;
let imgBin = null;
let workTitle = "";
let workCat = null;

// Display admin mode on Home Page
if(adminMode) {
  bodyElem.classList.add("admin-mode");
  // Change Login link in header to Logout
  loginCta.innerText = "Logout";
  // Apply reset routine to logout
  loginCta.addEventListener("click", (e) => disableAdminMode(e), {once: true});

  // Opening the modal when "modifier" is clicked
  buttonEdit.addEventListener("click", () => {
    // Populate the modal with photos to delete
    feedModalWithPhotos(adminModalContent);
    adminModal.showModal();
  });

  // Closing the modal when the X symbol is clicked
  const buttonCloseModal = document.querySelector(".close-modal");
  buttonCloseModal.addEventListener("click", () => {
    closingModal(adminModal);
    // adminModal.close();
  });
  
  // Allow click on outside the modal to close it
  adminModal.addEventListener("click", () => {
    closingModal(adminModal);
    // adminModal.close();
  });
  adminModalContent.addEventListener("click", (e) => {
    e.stopPropagation();
  });

}

function closingModal(modal) {
  modal.close();
}

// Populate the modal with photos to delete / declaration
function feedModalWithPhotos(contentZone) {
  let htmlTemplate = `<button class="close-modal"></button>
                      <h2>Galerie photo</h2>
                      <div class="gallery">`;
  
  // We loop through the works to display each images in the modal
  for (let i = 0; i < allWorks.length; i++) {
    htmlTemplate += `<figure>
    <img
    src="${allWorks[i].imageUrl}"
    alt="${allWorks[i].title}"
    />
    <button class="remove-work" data-id="${allWorks[i].id}"></button>
    </figure>`;
  }
  htmlTemplate +=  `</div>
  <hr />
  <button class="add-work">Ajouter une photo</button>`;
  contentZone.innerHTML = htmlTemplate;
  
  // we attach the delete request to each trash button
  const trashButtons = document.querySelectorAll(".remove-work");
  for (let i = 0; i < trashButtons.length; i++) {
    trashButtons[i].addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      if(isTokenGood()) {
        await deleteWork(id, token).then((response) => {
          // When the API confirms the deletion we remove the image from the popin and from the home page and we refresh the array allWorks
          if(/^2\d{2}$/.test(response.status)) {
            e.target.parentNode.remove();
            galleryElement.querySelector(`[data-id="${id}"]`).remove();
            allWorks = getAllWorks();
          }
        });
      } else {
        alert("La connexion a expiré");
      }
    }, {once: true});
  }

  // Modify the modal when click on "Ajouter"
  const addWorkButton = document.querySelector(".add-work");
  addWorkButton.addEventListener("click", () => {
    feedModalWithAddForm(contentZone);
  });
}

function isTokenGood() {
  const date = new Date();
  const now = date.getTime();
  const twentyfourhours = 24 * 60 * 60 * 1000;
  if(token) {
    return (twentyfourhours - (now - sessionStorage.getItem("dob"))) > 0 ? true : false;
  } else {
    return false;
  }
}


// Populate the modal with add photo form
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
    
  // Go back to deleting step when click on left arrow
  document.querySelector(".debut-modal").addEventListener("click", () => {
    feedModalWithPhotos(contentZone);
  }, {once:true});
    
  checkForm(document.getElementById("add-work-form"));
  // contentZone.querySelector(".modal-submit").removeAttribute("disabled");
  document.getElementById("add-work-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    let loginstatus = NaN;
    if(isTokenGood()) {
      const loginResponse = await addWork(imgBin, workTitle, workCat, token)
      .then(response => {
        loginstatus = response.status;
        return response.text();
      })
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
      if(/^2\d{2}$/.test(loginstatus)) {
        closingModal(adminModal);
      } else {
        alert("Erreur : " + loginstatus || "inconnue");
      }
    } else {
      alert("La connexion a expiré");
    }
  });
  
}


function checkForm(theform) {
  let valid = true;
  const fileElt = theform.querySelector("#img");
  const titleElt = theform.querySelector("#titre");
  const categoryElt = theform.querySelector("#category");
  const submitElt = theform.querySelector(".modal-submit");
  const specsText = theform.querySelector(".file-label-limits");
  const filePreview = theform.querySelector(".file-preview");
  fileElt.addEventListener("change", (e) => {
    if(filePreview.hasChildNodes()) {
      filePreview.childNodes[0].remove();
      theform.querySelector(".file-box").classList.remove("file-box__preview");
    }
    if(theform.querySelector(".img-error-msg") !== null) theform.querySelector(".img-error-msg").remove();
    if(checkImage(fileElt)) {
      previewImage(fileElt.files[0]);
      enableSubmit(fileElt.files[0], titleElt.value, categoryElt.value, submitElt);
    } else {
      displayImgErrorMsg(specsText);
    }
  });
  titleElt.addEventListener("change", (e) => {
    enableSubmit(fileElt.files[0], titleElt.value, categoryElt.value, submitElt);
  });
  categoryElt.addEventListener("change", (e) => {
    enableSubmit(fileElt.files[0], titleElt.value, categoryElt.value, submitElt);
  });
}

function checkImage(fileElt) {
  // Calcul de la taille totale
  let numberOfBytes = 0;
  const file = fileElt.files[0];
  imgUploadedType = file.type;
  numberOfBytes = file.size;

  // Approximation à l'unité humaine la plus proche
  const units = ["o", "Ko", "Mo", "Go", "To", "Po", "Eo", "Zo", "Yo"];
  const exponent = Math.min(
    Math.floor(Math.log(numberOfBytes) / Math.log(1024)),
    units.length - 1,
  );
  const approx = numberOfBytes / 1024 ** exponent;
  // imgUploadedSize = exponent === 0
  //                 ? `${numberOfBytes} octets`
  //                 : `${approx.toFixed(3)} ${units[exponent]}`;
                
  return ((exponent === 2 && approx.toFixed(3) < 4) || exponent < 2) && /jpeg|png/.test(imgUploadedType);

}

function displayImgErrorMsg(spectext) {
  const imgErrorMsg = document.createElement("span");
  imgErrorMsg.classList.add("img-error-msg");
  imgErrorMsg.innerText = "L'image excède 4Mo ou elle n'est pas un jpg ou un png";
  spectext.after(imgErrorMsg);
}

function previewImage(file) {
    const img = document.createElement("img");
    const filePreview = document.querySelector(".file-preview");
    img.classList.add("obj");
    img.file = file;
    filePreview.innerHTML = "";
    document.querySelector(".file-box").classList.add("file-box__preview");
    filePreview.appendChild(img); // Où  "preview" correspond à l'élément div où on affiche le contenu.

    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
  
function enableSubmit(a,b,c,d) {
  if(a && !!b && !!c) {
    imgBin = a;
    workTitle = b;
    workCat = c;
    d.removeAttribute("disabled");
  }
  else d.setAttribute("disabled","");
}

// On logout we remove admin mode specific styles and session infos
function disableAdminMode(e) {
  e.preventDefault();
  bodyElem.classList.remove("admin-mode");
  adminMode = false;
  token = "";
  sessionStorage.removeItem("adminMode");
  sessionStorage.removeItem("auth");
  sessionStorage.removeItem("dob");
  loginCta.innerText = "Login";
}

// Displaying a list of works
function displayWorks(list) {
  // We flush the gallery from its content
  galleryElement.innerHTML = "";
  // We loop through the works and using an html template
  for (let i = 0; i < list.length; i++) {
    galleryElement.innerHTML += `<figure data-id="${list[i].id}">
    <img
    src="${list[i].imageUrl}"
    alt="${list[i].title}"
    />
    <figcaption>${list[i].title}</figcaption>
    </figure>`;
  }
}

// Build and display filters
function buildAndDisplayFilters(cat) {
  let filtersElement = document.createElement("div");

  // Create button "All" in any case to display all works
  let buttonAllCatElement = document.createElement("button");
  let portfolioTitle = portfolioElement.querySelector(".portfolio-title-block");
  filtersElement.classList.add("filtres");
  buttonAllCatElement.classList.add("button","active");
  buttonAllCatElement.innerText = "Tous";
  filtersElement.appendChild(buttonAllCatElement);

  // Display all works
  filtering(buttonAllCatElement);
  
  // Based on the categories return by the API we create a button for each one
  for (let i = 0; i < cat.length; i++) {
    let button = document.createElement("button");
    button.classList.add("button");
    button.innerText = cat[i].name;
    filtersElement.appendChild(button);
   
    // Display specific works based on their category
    filtering(button, cat[i].id);
  }
  
  portfolioTitle.after(filtersElement);
}

// Selecting works based on their categories
function filtering(button, id) {
  button.addEventListener("click", (e) => {
    if(id !== undefined) {
      const catWorks = allWorks.filter(work => work.categoryId === id);
      displayWorks(catWorks);
    } else {
      displayWorks(allWorks);
    }
    // Update active state on the buttons
    document.querySelector(".active").classList.remove("active");
    button.classList.add("active");
  });
}