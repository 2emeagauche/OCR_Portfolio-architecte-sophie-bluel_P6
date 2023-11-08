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
  })
  .then(response => response.json());
 }

export {getAllWorks, getAllCategories, authentication};