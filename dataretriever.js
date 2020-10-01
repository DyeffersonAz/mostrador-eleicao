async function getVariableFile(city, role) {
    // NO AGUARDO DO TSE
    await getCityCode(city).then((response) => {
        getCityUF(city).then((response) => {
            let uf = response;
        });
        city = response;
    });
    console.log(city);
    console.log(role);

    return {
        carper: roleStringToRoleCode(role),
        dg: "02/10/2020",
        hg: "14:30:10",
        abr: [
            {
                cdabr: parseInt(city),
                psa: "90%",
                cand: [
                    {
                        n: "Zé Moreira",
                        e: "N",
                        vap: 1522,
                    },
                    {
                        n: "Zé Ferreira",
                        e: "N",
                        vap: 1788,
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
    let rawURL = await fetch(
        "https://raw.githubusercontent.com/betafcc/Municipios-Brasileiros-TSE/master/municipios_brasileiros_tse.json"
    );
    let data = await rawURL.json();

    return data.find((o) => o.nome_municipio == String(city).toUpperCase())
        .codigo_tse;
}

async function getCityUF(city) {
    let rawURL = await fetch(
        "https://raw.githubusercontent.com/betafcc/Municipios-Brasileiros-TSE/master/municipios_brasileiros_tse.json"
    );
    let data = await rawURL.json();

    return data.find((o) => o.nome_municipio == String(city).toUpperCase()).uf;
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
