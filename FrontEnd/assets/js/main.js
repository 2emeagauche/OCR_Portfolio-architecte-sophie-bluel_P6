const allWorks = [];
let categoriesIdList = [];
let categories = [];

// Get all the works from the server
fetch(apiLocalPath + "/works").then(response => response.json()).then(data => {
  if (data.length) {
    for (let i = 0; i < data.length; i++) {
      allWorks.push(data[i]);
    }
    displayWorks(allWorks);
    // Using Set object to store unique categories id ( => https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Set#d%C3%A9doublonner_un_tableau )
    categoriesIdList = [...new Set(allWorks.map(obj => obj.categoryId))];
    console.log(categoriesIdList);
    // Store categories pairs {id, name}
    for (let i = 1; i <= categoriesIdList.length; i++) {
      let catIdAndName = allWorks.find((obj) => obj.categoryId === i).category;
      categories.push(catIdAndName);
    }
    // Build and display filters
    buildAndDisplayFilters(categories);
  }
});

// Build and display filters
function buildAndDisplayFilters(cat) {
  let filtersElement = document.createElement("div");
  // Create button "All" in any case to display all works
  let buttonAllCatElement = document.createElement("button");
  let portfolioTitle = portfolioElement.querySelector("h2");

  filtersElement.classList.add("filtres");
  buttonAllCatElement.classList.add("button","active");
  buttonAllCatElement.innerText = "Tous";
  filtering(buttonAllCatElement);
  filtersElement.appendChild(buttonAllCatElement);
  // Based on the categories return by the API we create a button for each one
  for (let i = 0; i < cat.length; i++) {
    let button = document.createElement("button");
    button.classList.add("button");
    button.innerText = cat[i].name;
    filtering(button, cat[i].id);
    filtersElement.appendChild(button);
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