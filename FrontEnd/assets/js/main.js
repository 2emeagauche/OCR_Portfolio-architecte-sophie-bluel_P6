import {getAllWorks, getAllCategories, deleteWork, addWork} from "./api-requests.js";

// Store all the works from server
let allWorks = [];
allWorks = await getAllWorks();

// Get all the categories from server
let allCategories = [];
allCategories = await getAllCategories();

// Display all works on Home Page
displayWorks(allWorks);
// Build and display filters by categories
buildAndDisplayFilters(allCategories);
console.log("Categories", allCategories);

// Displaying a list of works
function displayWorks(list) {
  console.log("Projets", list);
  // We flush the gallery from its content
  galleryElement.innerHTML = "";
  // We loop through the works and using an html template
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

  // Filtering all works
  filtering(buttonAllCatElement);
  
  // Based on the category returned by the API we create a button for each one
  for (let i = 0; i < cat.length; i++) {
    let button = document.createElement("button");
    button.classList.add("button");
    button.innerText = cat[i].name;
    filtersElement.appendChild(button);
   
    // Filtering by category
    filtering(button, cat[i].id);
  }
  
  // Inserting filters buttons in the DOM
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

/*---------------------------------------------
                Admin Mode 
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

// Display admin mode on Home Page when login successfull
if(adminMode) {
  // When class "admin-mode" is added to the body then :
  // - the banner "Mode édition" is shown
  // - the filters are hidden
  // - the button "modifier" is shown and activated to open the modal
  bodyElem.classList.add("admin-mode");
  
  // Change Login link in header to "Logout"
  loginCta.innerText = "Logout";

  // When Logout is clicked return to public mode
  loginCta.addEventListener("click", (e) => {
    // On logout we remove admin mode specific styles and session infos
    disableAdminMode(e);
  }, {once: true});

  // Opening the modal when "modifier" is clicked
  buttonEditGallery.addEventListener("click", () => {
    // Populate the modal with the list of works to delete then open the modal
    feedModalWithPhotos(adminModalContent);
    adminModal.showModal();
  });
  
  // Allow click on outside the modal to close it
  adminModal.addEventListener("click", () => {
    closingModal(adminModal);
  });

  // Prevent closing the modal when clicking in the modal except for button.close-modal
  adminModalContent.addEventListener("click", (e) => {
    if(e.target.classList[0] === "close-modal") {
      closingModal(adminModal);
    } else {
      e.stopPropagation();
    }
  });
}

function disableAdminMode(e) {
  e.preventDefault(); // empèche la navigation vers le lien spécifié dans la balise
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
  
  // We loop through the works to display each image in the modal
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

  // Removing class ".add-content" specific to phase 2 of the modal for styling specificities
  contentZone.classList.remove("add-content");
  
  // For each trash button ("button.remove-work")
  const trashButtons = document.querySelectorAll(".remove-work");
  for (let i = 0; i < trashButtons.length; i++) {
    trashButtons[i].addEventListener("click", async (e) => {
      // Identifying the work Id via the "data-id" attribute
      const id = e.target.parentNode.dataset.id;
      // Initialize the api response status
      let responseStatus = 0;
      // if the token is not expired then requesting the api to delete the work
      if(isTokenGood()) {
        await deleteWork(id, token).then((response) => {
          responseStatus = response.status;
        });
        // When the API confirms the deletion with a status of 2**:
        // - we remove the image from the popin
        // - and from the home page
        // - we refresh the array allWorks
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

  // Modify the modal when click on "Ajouter" to display the form to add a work
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
  // building the form to add a work
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
    
  // Go back to previous phase of the modal (works to delete) when click on left arrow
  document.querySelector(".debut-modal").addEventListener("click", () => {
    feedModalWithPhotos(contentZone);
  }, {once:true});
    
  const theForm = document.getElementById("add-work-form");
  // The submit input is disabled by default
  // The checkForm function verifyies if all inputs are ok and then enables the submit input
  checkForm(theForm);
  // We don't need to wait for the submit input to be enabled to attach the submit listener to the form
  theForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    let responseStatus = NaN;
    // if the token is not expired then requesting the api to add the work
    if(isTokenGood()) {
      const response = await addWork(imgFile, workTitle, workCat, token)
      .then(response => {
        responseStatus = response.status;
        return response.json();
      });
      // When the API confirms the work is added in database with a status of 2**:
      // - we add the new work at the end of the home page gallery
      // - we refresh the allWorks array by requesting all the works to the API (so if go back to modal step 1 the gallery of works to delete is updated)
      // - we display a confirm popin to inform it is a success and ask to add another work. If agreed we reset the form. If denied we close the modal.
      if(/^2\d{2}$/.test(responseStatus)) {
        galleryElement.innerHTML += galleryTileTemplate(response.id, response.imageUrl, response.title);
        allWorks = await getAllWorks();
        if(window.confirm("L'élément a été ajouté avec succès. Continuer ?")) resetForm(theForm);
        else closingModal(adminModal);
      // If not display an alert with status code or unknown error
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
  
  // Verifying the file input on change event
  fileElt.addEventListener("change", (e) => {
    // Cleaning the html
    // - Dealing with the case where an image has been chosen but we want to change
    if(filePreview.hasChildNodes()) {
      filePreview.childNodes[0].remove();
      theform.querySelector(".file-box").classList.remove("file-box__preview");
    }
    // - Removing the error message if a wrong image was chosen
    if(theform.querySelector(".img-error-msg") !== null) theform.querySelector(".img-error-msg").remove();

    // Checking the image size and type. If good display a preview and test other inputs to enable submit
    if(checkImage(fileElt)) {
      previewImage(fileElt.files[0]);
      enableSubmit(fileElt.files[0], titleElt.value, categoryElt.value, submitElt);
    // if not good display an error message
    } else {
      displayImgErrorMsg(specsText);
    }
  });
  
  // Verifying the title input on change event
  titleElt.addEventListener("change", (e) => {
    // test inputs to enable submit
    enableSubmit(fileElt.files[0], titleElt.value, categoryElt.value, submitElt);
  });
  
  // Verifying the category selector on change event
  categoryElt.addEventListener("change", (e) => {
    // test inputs to enable submit
    enableSubmit(fileElt.files[0], titleElt.value, categoryElt.value, submitElt);
  });
}

function checkImage(fileElt) {
  let numberOfBytes = 0;
  const file = fileElt.files[0];
  imgUploadedType = file.type;
  numberOfBytes = file.size;
  // Return true if size is below 4 Mo and type is jpg or png. False otherwise.
  return ((numberOfBytes / 1048576).toFixed(1) < 4 && /jpeg|png/.test(imgUploadedType));

}

function previewImage(file) {
  const img = document.createElement("img");
  const filePreview = document.querySelector(".file-preview");
  filePreview.innerHTML = "";
  document.querySelector(".file-box").classList.add("file-box__preview");
  
  // Code from MDN https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications#example_showing_thumbnails_of_user-selected_images
  const reader = new FileReader();
  reader.onload = (e) => {
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);

  filePreview.appendChild(img);
}
  
function enableSubmit(a,b,c,d) {
  // If all fields ok store values in variables
  if(a && !!b && !!c) {
    imgFile = a;
    workTitle = b;
    workCat = c;
    d.removeAttribute("disabled");
  }
  // if not disabling submit
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