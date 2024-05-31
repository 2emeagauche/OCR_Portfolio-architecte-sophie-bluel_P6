// const apiLocalPath = "http://localhost:5678/api";
const apiLocalPath = "https://ocr-portfolio-architecte-sophie-bluel-p6.onrender.com/api";

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
