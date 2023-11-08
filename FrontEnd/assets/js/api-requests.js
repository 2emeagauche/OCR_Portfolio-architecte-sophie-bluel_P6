async function getAllWorks() {
  return fetch(apiLocalPath + "/works").then(response => response.json());
}
async function getAllCategories() {
  return fetch(apiLocalPath + "/categories").then(response => response.json());
}

export {getAllWorks, getAllCategories};