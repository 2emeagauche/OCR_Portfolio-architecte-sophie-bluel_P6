// manage login to admin mode

const loginForm = document.querySelector("#login-form");
const emailField = document.getElementById("email");
const passwordField = document.getElementById("password");

emailField.addEventListener("focus", removeError);
passwordField.addEventListener("focus", removeError);

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  let emailVal = emailField.value.trim();
  let passwordVal = passwordField.value.trim();
  const loginResponse = await fetch(apiLocalPath + "/users/login", {
    method: "POST",
    body: `{
      "email":"${emailVal}",
      "password":"${passwordVal}"
    }`,
    headers: {
      "Content-Type": "application/json"
    }
  }).then(response => response.json());
  if(Object.keys(loginResponse).length > 1) {
    enableAdminMode(loginResponse);
  } else {
    displayError();
  }
});

function enableAdminMode(loginResponse) {
  sessionStorage.setItem("adminMode", "true");
  sessionStorage.setItem("auth", loginResponse.token);
  window.location = "./index.html";
}

function displayError() {
  const errorMessage = document.createElement("p");
  loginForm.classList.add("error");
  errorMessage.innerText = "Erreur dans l’identifiant ou le mot de passe";
  loginForm.appendChild(errorMessage);
}

function removeError() {
  loginForm.classList.remove("error");
  const errorMessage = loginForm.querySelector("p");
  if(errorMessage) errorMessage.remove();
}