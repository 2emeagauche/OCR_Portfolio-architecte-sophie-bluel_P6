const apiLocalPath = "http://localhost:5678/api";
const users = [
  {
    email: "",
    password: ""
  }
];

const portfolioElement = document.querySelector("#portfolio");
const galleryElement = document.querySelector(".gallery");
const templateWork = `
          <figure>
            <img
              src="{{imageUrl}}"
              alt="{{title}}"
            />
            <figcaption>{{title}}</figcaption>
          </figure>
`;
