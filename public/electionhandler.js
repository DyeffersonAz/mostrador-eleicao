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

async function plotVotesPerCandidate(data) {
    console.log(data);
    if (document.getElementById("votesPerCandidate")) {
        document.getElementById("votesPerCandidate").remove();
    }
    let myCanvas = document.createElement("canvas");
    myCanvas.id = "votesPerCandidate";

    document.querySelector("#graphs").appendChild(myCanvas);

    let votesArray = [];
    let names = [];

    console.log(Object.getOwnPropertyNames(data));
    for (let i = 0; i < data.candidates.length; i++) {
        votesArray.push(data.candidates[i].votes);
        names.push(data.candidates[i].name);
    }

    let cityName = await getCityByCode(data.cl);

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

            labels: names,
        },
        options: {
            title: {
                display: true,
                text: `Apuração de ${data.cl} para ${data.role}`,
            },
            tooltips: {
                callbacks: {
                    label: function (tooltipItem, data) {
                        let label = data.datasets[0].data[tooltipItem.index];

                        label = `${names[tooltipItem.index]}: ${label} votos`;
                        return label;
                    },
                },
            },
        },
        maintainAspectRatio: false,
    });

    graph.options.title.text = `Apuração de ${cityName} para ${data.role}`;
}

function plotUrnasApuradas(data) {
    console.log(data);
    if (document.getElementById("urnasApuradas")) {
        document.getElementById("urnasApuradas").remove();
    }
    let myCanvas = document.createElement("canvas");
    myCanvas.id = "urnasApuradas";

    document.querySelector("#graphs").appendChild(myCanvas);

    let urnasApuradas = parseFloat(data.as.replace(",", "."));

    let graph = new Chart(document.getElementById("urnasApuradas"), {
        type: "pie",
        data: {
            datasets: [
                {
                    data: [urnasApuradas, 100 - urnasApuradas],
                    backgroundColor: ["#00b31b", "#e61e1e"],
                },
            ],

            labels: ["Apuradas", "Não apuradas"],
        },
        options: {
            title: {
                display: true,
                text: `Urnas Apuradas`,
            },
            tooltips: {
                callbacks: {
                    label: function (tooltipItem, data) {
                        let label = data.datasets[0].data[tooltipItem.index];

                        label += "%";
                        return label;
                    },
                },
            },
        },
        maintainAspectRatio: false,
    });

    graph.options.title.text = `Urnas Apuradas`;
}

function generateTable(data) {
    if (document.querySelector("table")) {
        document.querySelector("table").remove();
    }

    let table = document.createElement("table");
    table.className = "table-responsive";
    let headerRow = document.createElement("tr");
    table.appendChild(headerRow); // Creating the row that has headers

    // ==> Appending headers
    let candidateName = document.createElement("th");
    candidateName.textContent = "Candidato";
    headerRow.appendChild(candidateName);

    let votes = document.createElement("th");
    votes.textContent = "# de votos";
    headerRow.appendChild(votes);

    let elected = document.createElement("th");
    elected.textContent = "Eleito?";
    headerRow.appendChild(elected);

    // ==> Creating the actual rows
    data.candidates
        .sort((a, b) => a.votes - b.votes)
        .reverse()
        .forEach((candidate) => {
            let row = document.createElement("tr");
            table.appendChild(row);

            let currCandidateName = document.createElement("td");
            currCandidateName.textContent = candidate.name;
            row.appendChild(currCandidateName);

            let currCandidateVotes = document.createElement("td");
            currCandidateVotes.textContent = candidate.votes;
            row.appendChild(currCandidateVotes);
            table.appendChild(row);

            let isCurrCandidateElected = document.createElement("td");
            isCurrCandidateElected.textContent = candidate.elected
                ? "Sim"
                : "Não";
            row.appendChild(isCurrCandidateElected);
            table.appendChild(row);
        });

    document.querySelector("#graphs").appendChild(table);
}

async function parseDataObject(data) {
    let obj = {};

    // Código de Local
    obj.cl = String(data.abr[0].cdabr);

    // Role parsing
    obj.role = roleCodeToRoleString(data.carper);

    //Date and hour
    obj.dh = String(data.dg) + " " + String(data.hg);

    // Seções apuradas (%)
    obj.as = String(data.abr[0].psa);

    // => Dados fixos
    obj.dadosFixos = await getFixedFile(data.nadf);

    //Candidatos e votos
    obj.candidates = [];
    data.abr[0].cand.forEach((candidate) => {
        obj.candidates.push({});
        obj.candidates[obj.candidates.length - 1].number = String(candidate.n);
        obj.candidates[obj.candidates.length - 1].name = getCandidateByNumber(String(candidate.n), obj.dadosFixos);
        // VOTOS .......
        if (String(candidate.e) == "S") {
            obj.candidates[obj.candidates.length - 1].elected = true;
        } else if (String(candidate.e) == "N") {
            obj.candidates[obj.candidates.length - 1].elected = false;
        }

        obj.candidates[obj.candidates.length - 1].votes = parseInt(
            candidate.vap
        ); // Número de votos
    });

    obj.candidates = obj.candidates.sort((a, b) => b.vap - a.vap);

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
