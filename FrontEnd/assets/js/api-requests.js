// We declare all the API interfaces and export them to be used in main.js and login.js

async function getAllWorks() {
  return fetch(apiLocalPath + "/works").then(response => response.json());
}

async function getAllCategories() {
  return fetch(apiLocalPath + "/categories").then(response => response.json());
}

async function authentication(emailVal, passwordVal) {
  return fetch(apiLocalPath + "/users/login", {
    method: "POST",
    body: `{
      "email":"${emailVal}",
      "password":"${passwordVal}"
    }`,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

async function deleteWork(id, token) {
  return fetch(apiLocalPath + "/works/" + id, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    }
  });
}

async function addWork(image, title, category, token) {
  const formData = new FormData();
  formData.append("image", image);
  formData.append("title", title);
  formData.append("category", parseInt(category));
  return fetch(apiLocalPath + "/works", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token
    },
    body: formData
  });
}

export {getAllWorks, getAllCategories, authentication, deleteWork, addWork};