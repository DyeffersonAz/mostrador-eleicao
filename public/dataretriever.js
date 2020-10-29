var fileCache = {}; // Arquivos (mais recentes) salvos
var electionFeed = [];

if (localStorage.getItem("elected") === null) {
    localStorage.setItem("elected", JSON.stringify([]));
}

const host = "https://resultados.tse.jus.br/publico";
const ciclo = "ele2020";
const ambiente = "simulado";
const codigo_eleicao = "8334";

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getVariableFile(city, uf, role) {
    // IR AO TSE
    console.log(`Pegando arquivo da eleição de ${city.name} para ${role}`);
    let cityCode = await getCityCode(city, uf);
    const roleCode = String(roleStringToRoleCode(role)).padStart(4, "0");
    const filepath = `${host}/${ciclo}/divulgacao/${ambiente}/${codigo_eleicao}/dados/${uf}/${uf}${String(
        cityCode
    ).padStart(5, "0")}-c${roleCode}-e${codigo_eleicao.padStart(
        6,
        "0"
    )}-v.json`;
    let raw_file = await fetch(`fetchJSON/${filepath}`, {
        // mode: "no-cors",
        "Content-Type": "application/json",
        Accept: "application/json",
    });

    if (raw_file.status == 429) {
        await sleep(1000);
        raw_file = await fetch(`fetchJSON/${filepath}`, {
            "Content-Type": "application/json",
            Accept: "application/json",
        });
    }

    let json_file = await raw_file.json();
    return json_file;
}

async function getFixedFile(filename) {
    const filepath = `${host}/${ciclo}/divulgacao/${ambiente}/${codigo_eleicao}/dados/${filename.slice(
        0,
        2
    )}/${filename}.json`;

    let raw_file = await fetch(`fetchJSON/${filepath}`, {
        "Content-Type": "application/json",
        Accept: "application/json",
    });

    if (raw_file.status == 429) {
        await sleep(1000);
        raw_file = await fetch(`fetchJSON/${filepath}`, {
            "Content-Type": "application/json",
            Accept: "application/json",
        });
    }

    let json_file = await raw_file.json();
    return json_file;
}

async function getFiles() {
    let electedCache = await JSON.parse(localStorage.getItem("elected"));

    for (let city of cities) {
        let prefeito = await getVariableFile(city, city.uf, "prefeito");
        let vereador = await getVariableFile(city, city.uf, "vereador");

        prefeito = await parseDataObject(prefeito);
        vereador = await parseDataObject(vereador);

        fileCache[`${city.name.toLowerCase()}_prefeito`] = prefeito;
        fileCache[`${city.name.toLowerCase()}_vereador`] = vereador;

        // => PREFEITO
        if (!electedCache.includes(`${city.name.toLowerCase()}_prefeito`)) {
            if (checkElected(prefeito) == "eleito") {
                electedCache.push(`${city.name.toLowerCase()}_prefeito`);
                notifyElection(
                    "ELEIÇÃO!",
                    `Prefeito(a) eleito(a) em ${city.name}`
                );
            } else if (checkElected(prefeito) == "matematicamente") {
                notifyMatematicamente(
                    "MATEMATICAMENTE ELEITO!",
                    `Prefeito(a) matematicamente eleito(a) em ${city.name}. Resta aguardar ainda se o TSE vai considerar eleito(a) ou não.`
                );
            }
        }

        // => VEREADOR
        if (!electedCache.includes(`${city.name.toLowerCase()}_vereador`)) {
            if (checkElected(vereador) == "eleito") {
                electedCache.push(`${city.name.toLowerCase()}_vereador`);
                notifyElection(
                    "ELEIÇÃO!",
                    `Vereador(a) eleito(a) em ${city.name}`
                );
            } else if (checkElected(vereador) == "matematicamente") {
                notifyMatematicamente(
                    "MATEMATICAMENTE ELEITO!",
                    `Vereador(a) matematicamente eleito(a) em ${city.name}. Resta aguardar ainda se o TSE vai considerar eleito(a) ou não.`
                );
            }
        }
    }
    console.log(fileCache);
    localStorage.setItem("elected", JSON.stringify(electedCache));
    console.log(localStorage.getItem("elected"));
    changedForm();
}

function getStoredFile(city, role) {
    return fileCache[`${city.toLowerCase()}_${role}`];
}

function provideImageLink(sqCand, uf) {
    // https://divulgacao-resultados.tse.jus.br/ele2020/divulgacao/homologacaotre/7555/fotos/br/280000731765.jpeg

    const imageHost = "https://divulgacao-resultados.tse.jus.br";
    return `/fetchImage/${host}/${ciclo}/divulgacao/${ambiente}/${codigo_eleicao}/fotos/${uf}/${sqCand}.jpeg`
}

function getCandidateByNumber(number, fixedFile) {
    // NO AGUARDO DO TSE
    let coligacoes = fixedFile.carg.col;
    for (let colig of coligacoes) {
        for (let party of colig.par) {
            for (let candidate of party.cand) {
                if (candidate.n == number) {
                    return candidate.nmu;
                }
            }
        }
    }
}

function getPartyByNumber(number, fixedFile) {
    // NO AGUARDO DO TSE
    let coligacoes = fixedFile.carg.col;
    for (let col of coligacoes) {
        for (let par of col.par) {
            for (let cand of par.cand) {
                if (cand.n == number) {
                    return par.sg;
                }
            }
        }
    }
}

function getSqcandByNumber(number, fixedFile) {
    // NO AGUARDO DO TSE
    let coligacoes = fixedFile.carg.col;
    for (let col of coligacoes) {
        for (let par of col.par) {
            for (let cand of par.cand) {
                if (cand.n == number) {
                    return cand.sqcand;
                }
            }
        }
    }
}

async function getCityCode(city, uf) {
    let codesDB = await fetch(
        "https://raw.githubusercontent.com/betafcc/Municipios-Brasileiros-TSE/master/municipios_brasileiros_tse.json"
    );
    let codesDBJSON = await codesDB.json();
    let DBCity = codesDBJSON.filter(
        (elt) =>
            elt.nome_municipio == city.name.toUpperCase() &&
            elt.uf == uf.toUpperCase()
    )[0];
    let cityCode = DBCity.codigo_tse;

    return cityCode;
}

async function getCityByCode(cityCode) {
    let codesDB = await fetch(
        "https://raw.githubusercontent.com/betafcc/Municipios-Brasileiros-TSE/master/municipios_brasileiros_tse.json"
    );
    let codesDBJSON = await codesDB.json();
    let DBCity = codesDBJSON.filter((elt) => elt.codigo_tse == cityCode)[0];
    let cityName = DBCity.nome_municipio;

    return cityName;
}

function roleCodeToRoleString(roleCode) {
    switch (parseInt(roleCode)) {
        case 1:
            return "presidente";
        case 3:
            return "governador";
        case 5:
            return "senador";
        case 11:
            return "prefeito";
        case 6:
            return "deputado-federal";
        case 7:
            return "deputado-estadual";
        case 8:
            return "deputado-distrital";
        case 13:
            return "vereador";
    }
}

function roleStringToRoleCode(roleString) {
    switch (String(roleString).toLowerCase()) {
        case "presidente":
            return 1;
        case "governador":
            return 3;
        case "senador":
            return 5;
        case "prefeito":
            return 11;
        case "deputado-federal":
            return 6;
        case "deputado-estadual":
            return 7;
        case "deputado-distrital":
            return 8;
        case "vereador":
            return 13;
    }
}
