async function getVariableFile(city, role) {
    // IR AO TSE
    let cityCode = await getCityCode(city);
    const roleCode = String(roleStringToRoleCode(role)).padStart(4, "0");
    const host = "exemplos";
    const ciclo = "ele2020";
    const ambiente = "simulado";
    const codigo_eleicao = "8707";
    const uf = await getCityUF(city);
    const filepath = `${host}/${ciclo}/divulgacao/${ambiente}/${codigo_eleicao}/dados/${uf}/${uf}${cityCode}-c${roleCode}-e${codigo_eleicao.padStart(
        6,
        "0"
    )}-v.json`;
    let raw_file = await fetch(filepath, {
        mode: "no-cors",
        "Content-Type": "application/json",
        Accept: "application/json",
    });
    let json_file = await raw_file.json();
    return json_file;
}

async function getFixedFile(filename) {
    const host = "exemplos";
    const ciclo = "ele2020";
    const ambiente = "simulado";
    const codigo_eleicao = "8707";
    const filepath = `${host}/${ciclo}/divulgacao/${ambiente}/${codigo_eleicao}/dados/${filename.slice(
        0,
        2
    )}/${filename}.json`;
    let raw_file = await fetch(filepath, {
        mode: "no-cors",
        "Content-Type": "application/json",
        Accept: "application/json",
    });
    let json_file = await raw_file.json();
    return json_file;
}

function getCandidateByNumber(number, fixedFile) {
    // NO AGUARDO DO TSE
    let coligacoes = fixedFile.carg.col;
    for (let colig of coligacoes) {
        for (let party of colig.par) {
            for (let candidate of party.cand) {
                if (candidate.n == number) {
                    return candidate.nm;
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

async function getCityCode(city) {
    let codesDB = await fetch(
        "https://raw.githubusercontent.com/betafcc/Municipios-Brasileiros-TSE/master/municipios_brasileiros_tse.json"
    );
    let codesDBJSON = await codesDB.json();
    let DBCity = codesDBJSON.filter(
        (elt) => elt.nome_municipio == city.toUpperCase()
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

async function getCityUF(city) {
    let raw_data = await fetch(
        "https://raw.githubusercontent.com/betafcc/Municipios-Brasileiros-TSE/master/municipios_brasileiros_tse.json"
    );
    let json_data = await raw_data.json();
    let municipio = json_data.filter(
        (o) => o.nome_municipio == String(city).toUpperCase()
    )[0];
    return municipio.uf.toLowerCase();
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
