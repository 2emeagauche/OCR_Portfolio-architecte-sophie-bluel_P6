// const apiLocalPath = "http://localhost:5678/api";
const apiLocalPath = "https://web-production-ded9.up.railway.app:8080";

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
