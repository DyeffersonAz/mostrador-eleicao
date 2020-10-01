function generateColors(qnt) {
    let colors = [];

    for (let i = 0; i < qnt; i++) {
        colors.push(
            `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(
                Math.random() * 256
            )}, ${Math.floor(Math.random() * 256)}, 0.8)`
        );
    }
    return colors;
}

function plotVotesPerCandidate(data) {
    console.log(data);
    if (document.getElementById("votesPerCandidate")) {
        document.getElementById("votesPerCandidate").remove();
    }
    let myCanvas = document.createElement("canvas");
    myCanvas.id = "votesPerCandidate";

    document.body.appendChild(myCanvas);

    let votesArray = [];
    let numbers = [];

    console.log(Object.getOwnPropertyNames(data));
    for (let i = 0; i < Object.keys(data.candidates).length; i++) {
        votesArray.push(
            data.candidates[Object.getOwnPropertyNames(data.candidates)[i]]
                .votes
        );
        numbers.push(
            data.candidates[Object.getOwnPropertyNames(data.candidates)[i]]
                .number
        );
    }

    let graph = new Chart(document.getElementById("votesPerCandidate"), {
        type: "pie",
        data: {
            datasets: [
                {
                    data: votesArray,
                    backgroundColor: generateColors(
                        Object.keys(data.candidates).length
                    ),
                },
            ],

            labels: numbers,
        },
        options: {
            title: {
                display: true,
                text: `Apuração de ${data.cl} para ${data.role}`,
            },
        },
    });

    graph.options.title.text = `Apuração de ${data.cl} para ${data.role}`;
}

function parseDataObject(data) {
    let obj = {};

    // Código de Local
    obj.cl = String(data.abr[0].cdabr);

    // Role parsing
    obj.role = roleCodeToRoleString(data.carper);

    //Date and hour
    obj.dh = String(data.dg) + " " + String(data.hg);

    // Seções apuradas (%)
    obj.as = String(data.abr[0].psa);

    //Candidatos e votos
    obj.candidates = {};
    data.abr[0].cand.forEach((candidate) => {
        obj.candidates[String(candidate.n)] = {};
        obj.candidates[String(candidate.n)].number = String(candidate.n);
        // VOTOS .......
        if (String(candidate.e) == "S") {
            obj.candidates[String(candidate.n)].elected = true;
        } else if (String(candidate.e) == "N") {
            obj.candidates[String(candidate.n)].elected = false;
        }

        obj.candidates[String(candidate.n)].votes = parseInt(candidate.vap); // Número de votos
    });

    return obj;

    /* ESBOÇO DE ARQUIVO FINAL:
        {
            "cl": <código do lugar (BR, sigla do estado ou código do município)>
            "role": <cargo>
            "dh": <DATA HORA>
            "as": <porcentagem de seções apuradas>
            "candidates":
                "<numero>":
                    "number": <numero>
                    "elected": true/false,
                    "votes": <numero de votos>
                "<numero>":
                    "number": <numero>
                    "elected": true/false,
                    "votes": <numero de votos>
        }
    */
}

async function updateLoop() {
    while (true) {
        setInterval(() => {
            for (let c of cities) {
                let currCityMayor = parseDataObject(
                    getVariableFile(c, "prefeito")
                );
                let currCityCouncillor = parseDataObject(
                    getVariableFile(c, "vereador")
                );
                if (
                    currCityMayor.candidates.find((o) => o.e) ||
                    currCityCouncillor.candidates.find((o) => o.e)
                ) {
                    notify(`Eleição em ${currCityMayor.cl}!`, "Verifique no painel!");
                }
            }
        }, 4615);
    }
}
