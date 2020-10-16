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
    "Rio de Janeiro",
    "São Paulo",
    "Nova Friburgo",
    "Cabo Frio",
    "Rio das Ostras"
].sort();

const cityDOM = document.querySelector("#city");
const roleDOM = document.querySelector("#role");
//const socket = io("http://localhost:3000");

// Functions ====

function getCity() {
    return cityDOM.selectedOptions[0].value;
}

function getRole() {
    return roleDOM.selectedOptions[0].value;
}

async function changedForm() {
    let varfile = await getStoredFile(getCity(), getRole());
    varfile = await parseDataObject(varfile);
    plotVotesPerCandidate(varfile);
    generateCandTable(varfile);
    generateNullVotesTable(varfile);
    plotUrnasApuradas(varfile);
}

// On page load ====
cities.forEach((city) => {
    let currCityOption = document.createElement("option");
    currCityOption.value = city;
    currCityOption.textContent = city;
    cityDOM.appendChild(currCityOption);
});

askNotificationPermission();

getFiles();

setInterval(getFiles, 300000);

// GET all files 5 in 5 minutes

//Just show as needed

/*io.on("election", (data) => {
    console.log(
        `${data.candidate} foi eleito em ${data.city} para ${data.role}`
    );
});*/
