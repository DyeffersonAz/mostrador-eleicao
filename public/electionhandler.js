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
    //console.log(data);
    if (document.getElementById("votesPerCandidate")) {
        document.getElementById("votesPerCandidate").remove();
    }
    let myCanvas = document.createElement("canvas");
    myCanvas.id = "votesPerCandidate";

    document.querySelector("#graphs").appendChild(myCanvas);

    let votesArray = [];
    let names = [];

    //console.log(Object.getOwnPropertyNames(data));
    for (let i = 0; i < data.candidates.length; i++) {
        votesArray.push(data.candidates[i].votes);
        names.push(data.candidates[i].name);
    }

    if (names.length <= 0) {
        return;
    }

    let cityName = await getCityByCode(data.cl);
    cityName = cityName.replace(/^\w/, (c) => c.toUpperCase());
    if (names.length <= 2) {
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
                    text: `Apuração de ${cityName} para ${data.role}`,
                },
                tooltips: {
                    callbacks: {
                        label: function (tooltipItem, data) {
                            let label =
                                data.datasets[0].data[tooltipItem.index];

                            label = `${
                                names[tooltipItem.index]
                            }: ${label} votos`;
                            return label;
                        },
                    },
                },
            },
        });
    } else if (names.length > 2) {
        let graph = new Chart(document.getElementById("votesPerCandidate"), {
            type: "bar",
            data: {
                datasets: [
                    {
                        data: votesArray,
                        backgroundColor: generateColors(data.candidates.length),
                    },
                ],

                labels: names,
            },
            options: {
                legend: {
                    display: false,
                },
                title: {
                    display: true,
                    text: `Apuração de ${cityName} para ${data.role}`,
                },
                tooltips: {
                    callbacks: {
                        label: function (tooltipItem, data) {
                            let label =
                                data.datasets[0].data[tooltipItem.index];

                            label = `≅ ${Math.round(
                                (parseInt(votesArray[tooltipItem.index]) *
                                    100) /
                                    votesArray.reduce(function (a, b) {
                                        return a + b;
                                    })
                            )}% dos votos (${votesArray[tooltipItem.index]})`;
                            return label;
                        },
                    },
                },
            },
        });
    }
}

function plotUrnasApuradas(data) {
    //console.log(data);

    if (document.getElementById("urnasApuradas")) {
        document.getElementById("urnasApuradas").remove();
    }
    if (data.candidates.length <= 0) {
        return;
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
                    data: [urnasApuradas, (100 - urnasApuradas)],
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
    });
}

function generateCandTable(data) {
    if (document.querySelector("#candTable")) {
        document.querySelector("#candTable").remove();
    }

    let table = document.createElement("table");
    table.className = "table-responsive";
    table.id = "candTable";
    let headerRow = document.createElement("tr");
    table.appendChild(headerRow); // Creating the row that has headers

    // ==> Appending headers
    let candidateName = document.createElement("th");
    candidateName.textContent = "Candidato";
    headerRow.appendChild(candidateName);

    let partyAbbr = document.createElement("th");
    partyAbbr.textContent = "Partido";
    headerRow.appendChild(partyAbbr);

    let votes = document.createElement("th");
    votes.textContent = "# de votos";
    headerRow.appendChild(votes);

    let elected = document.createElement("th");
    elected.textContent = "Eleito?";
    headerRow.appendChild(elected);

    if (data.candidates.length <= 0) {
        return;
    }

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

            let partyAbbr = document.createElement("td");
            partyAbbr.textContent = candidate.party;
            row.appendChild(partyAbbr);

            let currCandidateVotes = document.createElement("td");
            currCandidateVotes.textContent = candidate.votes;
            row.appendChild(currCandidateVotes);
            table.appendChild(row);

            let isCurrCandidateElected = document.createElement("td");
            isCurrCandidateElected.textContent = candidate.elected
                ? "Sim"
                : "Não";
            isCurrCandidateElected.style.backgroundColor = candidate.elected
                ? "#30ff91"
                : "#ff3037";
            isCurrCandidateElected.style.color = candidate.elected
                ? "#000000"
                : "#FFFFFF";
            row.appendChild(isCurrCandidateElected);
            table.appendChild(row);
        });

    document.querySelector("#graphs").appendChild(table);
}

function generateNullVotesTable(data) {
    if (document.querySelector("#nullVotesTable")) {
        document.querySelector("#nullVotesTable").remove();
    }

    let table = document.createElement("table");
    table.className = "table-responsive";
    table.id = "nullVotesTable";

    let whiteVotes = document.createElement("tr");
    let whiteVotesText = document.createElement("th");
    whiteVotesText.textContent = "Votos Brancos";
    whiteVotes.appendChild(whiteVotesText);
    let whiteVotesNumber = document.createElement("td");
    whiteVotesNumber.textContent = data.whiteVotes;
    whiteVotes.appendChild(whiteVotesNumber);

    let nullVotes = document.createElement("tr");
    let nullVotesText = document.createElement("th");
    nullVotesText.textContent = "Votos Nulos";
    nullVotes.appendChild(nullVotesText);
    let nullVotesNumber = document.createElement("td");
    nullVotesNumber.textContent = data.nullVotes;
    nullVotes.appendChild(nullVotesNumber);

    table.appendChild(whiteVotes);
    table.appendChild(nullVotes);


    document.querySelector("#graphs").appendChild(table);
}

function checkElected(data) {
    let elected = data.abr[0].cand.filter((c) => c.e == "S");

    return elected.length > 0;
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
    obj.as = String(data.abr[0].pst);

    // Votos brancos
    obj.whiteVotes = String(data.abr[0].vb);

    // Votos nulos
    obj.nullVotes = String(data.abr[0].tvn);

    // => Dados fixos
    obj.dadosFixos = await getFixedFile(data.nadf);

    //Candidatos e votos
    obj.candidates = [];
    data.abr[0].cand.forEach((candidate) => {
        obj.candidates.push({});
        obj.candidates[obj.candidates.length - 1].number = String(candidate.n);
        obj.candidates[obj.candidates.length - 1].name = getCandidateByNumber(
            String(candidate.n),
            obj.dadosFixos
        );
        obj.candidates[obj.candidates.length - 1].party = getPartyByNumber(
            String(candidate.n),
            obj.dadosFixos
        );
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
