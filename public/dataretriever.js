async function getVariableFile(city, role) {
    // IR AO TSE
    let cityCode = await getCityCode(city);
    return {
        carper: `${roleStringToRoleCode(role)}`,
        dg: "02/10/2020",
        hg: "14:30:10",
        abr: [
            {
                cdabr: `${cityCode}`,
                psa: "75,878%",
                cand: [
                    {
                        n: "Zé Moreira",
                        e: "N",
                        vap: 150,
                    },
                    {
                        n: "Zé Ferreira",
                        e: "N",
                        vap: 200,
                    },
                    {
                        n: "José Cavalo",
                        e: "N",
                        vap: 300,
                    },
                    {
                        n: "Fábio Mula",
                        e: "N",
                        vap: 258,
                    },
                ],
            },
        ],
    };
}

function getCandidateByNumber(number) {
    // NO AGUARDO DO TSE
}

async function getCityCode(city) {
    // pegar a porcaria do json com os codigos e depois procurar uma cidade que tenha o mesmo nome e o código tse dela...

    //https://raw.githubusercontent.com/betafcc/Municipios-Brasileiros-TSE/master/municipios_brasileiros_tse.json

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
    return fetch(
        "https://raw.githubusercontent.com/betafcc/Municipios-Brasileiros-TSE/master/municipios_brasileiros_tse.json"
    )
        .then((raw) => raw.json())
        .then(
            (resp) =>
                data.find((o) => o.nome_municipio == String(city).toUpperCase())
                    .uf
        );
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
