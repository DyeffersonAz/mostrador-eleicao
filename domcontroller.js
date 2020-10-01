// Data ====
const cities = [
    "Bom Jesus do Itabapoana",
    "Italva",
    "Itaperuna",
    "Laje do Muriaé",
    "Natividade",
    "Porciúncula",
    "Varre-Sai",
    "Aperibé",
    "Cambuci",
    "Itaocara",
    "Miracema",
    "Santo Antônio de Pádua",
    "São José de Ubá",
].sort();

const cityDOM = document.querySelector("#city");
const roleDOM = document.querySelector("#role");

// Functions ====

function getCity() {
    return cityDOM.selectedOptions[0].value;
}

function getRole() {
    return roleDOM.selectedOptions[0].value;
}

function changedForm() {
    console.log(`FORMULÁRIO MUDOU!`);
    let variableFile = getVariableFile(getCity(), getRole()).then(
        (response) => {
            plotVotesPerCandidate(parseDataObject(response));
        }
    );
}

// On page load ====
cities.forEach((city) => {
    let currCityOption = document.createElement("option");
    currCityOption.value = city;
    currCityOption.textContent = city;
    cityDOM.appendChild(currCityOption);
});

Notification.requestPermission().then(r => {
    updateLoop();
});

let variableFile = getVariableFile(getCity(), getRole()).then((response) => {
    plotVotesPerCandidate(parseDataObject(response));
});
