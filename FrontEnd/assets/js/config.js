// const apiLocalPath = "http://localhost:5678/api";
const apiLocalPath = "https://ocrportfolio-architecte-sophie-production.up.railway.app/api";

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
