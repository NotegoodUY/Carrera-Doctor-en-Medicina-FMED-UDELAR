(function () {
  const allowedHosts = ['localhost'];
  const currentHost = window.location.hostname;

  if (!allowedHosts.includes(currentHost)) {
    window.location.href = 'https://tusitio.github.io/malla-medicina/';
  }
})();

// Altura para vh en móviles
let vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);
window.addEventListener('resize', () => {
  vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
});

// Parámetros y ruta
let relaPath = './';
let fullCareerName = "Medicina – UDELAR";
let texts = "Malla";

// Parámetro de carrera (fijo en MEDICINA)
let carr = "MED";
localStorage.setItem("currentCarreer", carr);

// Actualizar URL
let url = new URL(window.location.href);
url.searchParams.set('m', carr);
window.history.pushState({}, '', url);

// Cargar vistas y textos de bienvenida
let includes = document.querySelectorAll('[data-include]');
let promises = [];

includes.forEach(include => {
  let fileURL = relaPath + 'views/' + include.getAttribute('data-include') + '.html';
  promises.push(fetch(fileURL).then(r => r.text()).then(data => {
    include.insertAdjacentHTML("afterbegin", data);
  }));
});

promises.push(fetch(relaPath + 'data/welcomeTexts.json').then(r => r.json()));

Promise.all(promises).then((datas) => {
  let welcomeTexts = datas.pop()["Malla"];
  document.querySelector(".overlay-content h1").textContent = welcomeTexts.welcomeTitle;
  document.querySelector(".overlay-content h5").textContent = welcomeTexts.welcomeDesc;

  return fetch(new Request(relaPath + "date.txt"));
}).then(response => {
  let lastModified = response.headers.get("last-modified");
  let date = new Date(lastModified);
  document.getElementById("lastUpdate").textContent = date.toLocaleString();
});

// Función para cerrar bienvenida
function removePopUp() {
  d3.select("body").style("overflow", "initial");
  d3.selectAll(".overlay").style("backdrop-filter", "none");
  d3.select(".overlay-content").transition().style("filter", "opacity(0)");
  d3.select(".overlay").transition().style("filter", "opacity(0)").on('end', function () {
    d3.select(this).remove();
  });
}

// Inicialización
$(function () {
  let malla = new Malla(true);
  malla.enableCreditsStats();
  malla.enableCreditsSystem();
  malla.enableSave();
  document.getElementById("cleanApprovedButton").addEventListener("click", () => malla.cleanSubjects());

  malla.setCareer(carr, fullCareerName, relaPath).then(() => {
    return malla.drawMalla(".canvas");
  }).then(() => {
    malla.updateStats();
    malla.displayCreditSystem();
    malla.showColorDescriptions(".color-description");
    document.getElementById("overlay").addEventListener("click", () => {
      malla.loadApproved();
      malla.enablePrerCheck();
    });
  });
});
