/* eslint-disable no-unused-vars */
// Data ====
const cities = [
  {name: 'Bom Jesus do Itabapoana', uf: 'rj'},
  {name: 'Italva', uf: 'rj'},
  {name: 'Itaperuna', uf: 'rj'},
  {name: 'Laje do Muriaé', uf: 'rj'},
  {name: 'Natividade', uf: 'rj'},
  {name: 'Porciúncula', uf: 'rj'},
  {name: 'Varre-Sai', uf: 'rj'},
  {name: 'Aperibé', uf: 'rj'},
  {name: 'Cambuci', uf: 'rj'},
  {name: 'Itaocara', uf: 'rj'},
  {name: 'Miracema', uf: 'rj'},
  {name: 'Santo Antônio de Pádua', uf: 'rj'},
  {name: 'São José de Ubá', uf: 'rj'},
  {name: 'Rio de Janeiro', uf: 'rj'},
  {name: 'São Paulo', uf: 'sp'},
  {name: 'Nova Friburgo', uf: 'rj'},
  {name: 'Cabo Frio', uf: 'rj'},
  {name: 'Rio das Ostras', uf: 'rj'},
].sort((a, b) => {
  const textA = a.name.toUpperCase();
  const textB = b.name.toUpperCase();
  return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
});

const cityDOM = document.querySelector('#city');
const roleDOM = document.querySelector('#role');
// const socket = io("http://localhost:3000");

// Functions ====

/**
 * Gets the city selected in the DOM form
 * @return {String} The name of the city selected
 */
function getCity() {
  return cityDOM.selectedOptions[0].value;
}


/**
 * Gets the role selected in the DOM form
 * @return {String} The name of the role selected
 */
function getRole() {
  return roleDOM.selectedOptions[0].value;
}

/**
 * Updates all of the DOM elements when called.
 * It will get what is in the form and will get the data and show it.
 */
async function changedForm() {
  const varfile = await getStoredFile(getCity(), getRole());

  Object.keys(fileCache).forEach((electionName) => {
    if (fileCache[electionName].role == getRole().toLowerCase()) {
      const thisCityElement = document.getElementById(fileCache[electionName].nl
          .replaceAll(' ', '-')
          .toLowerCase());
      if (checkElected(fileCache[electionName]) == 'eleito') {
        thisCityElement.textContent = `${fileCache[electionName].nl} ✅`;
      } else if (
        checkElected(fileCache[electionName]) == 'matematicamente'
      ) {
        thisCityElement.textContent = `${fileCache[electionName].nl} ⚠`;
      } else if (!checkElected(fileCache[electionName])) {
        thisCityElement.textContent = `${fileCache[electionName].nl} ❌`;
      }
    }
  });

  plotVotesPerCandidate(varfile);
  generateCandTable(varfile);
  generateNullVotesTable(varfile);
  plotUrnasApuradas(varfile);
}

// On page load put all registered cities ====
cities.forEach((city) => {
  // eslint-disable-next-line prefer-const
  let currCityOption = document.createElement('option');
  currCityOption.id = city.name.replaceAll(' ', '-').toLowerCase();
  currCityOption.value = city.name.toUpperCase();
  currCityOption.textContent = city.name.toUpperCase();
  cityDOM.appendChild(currCityOption);
});

askNotificationPermission();

getFiles();

setInterval(getFiles, 60000);
