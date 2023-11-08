import {getAllWorks, getAllCategories} from "./api-requests.js";

// Get all the works from the server
const allWorks = await getAllWorks();
// Get all the categories from the server
const allCategories = await getAllCategories();

let adminMode = sessionStorage.getItem("adminMode") ?? false;
let token = sessionStorage.getItem("auth") ?? "";
const bodyElem = document.querySelector("body");
const loginCta = document.getElementById("login-cta");

// Display all works
displayWorks(allWorks);
// Build and display filters
buildAndDisplayFilters(allCategories);

// Display admin mode on Home Page
if(adminMode) {
  bodyElem.classList.add("admin-mode");
  // Change Login link in header to Logout
  loginCta.innerText = "Logout";
  // Apply reset routine to logout
  loginCta.addEventListener("click", (e) => disableAdminMode(e), {once: true});
}

// On logout we remove admin mode specific styles and session infos
function disableAdminMode(e) {
  e.preventDefault();
  bodyElem.classList.remove("admin-mode");
  adminMode = false;
  token = "";
  sessionStorage.removeItem("adminMode");
  sessionStorage.removeItem("auth");
  loginCta.innerText = "Login";
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

// Displaying a list of works
function displayWorks(list) {
  // We flush the gallery from its content
  galleryElement.innerHTML = "";
  // We loop through the works and using an html template
  for (let i = 0; i < list.length; i++) {
    galleryElement.innerHTML += `<figure>
    <img
    src="${list[i].imageUrl}"
    alt="${list[i].title}"
    />
    <figcaption>${list[i].title}</figcaption>
    </figure>`;
  }
}