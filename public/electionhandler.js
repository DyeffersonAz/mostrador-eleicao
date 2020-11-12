/* eslint-disable no-unused-vars */
/**
 * Generates an array of color strings.
 * @param {Number} qnt - Determines how many colors you want.
 * @return {Array} List of colors Strings "rgba(r, g, b)".
 */
function generateColors(qnt) {
  const colors = [];

  for (let i = 0; i < qnt; i++) {
    colors.push(
        // eslint-disable-next-line max-len
        `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.8)`);
  }
  return colors;
}

/**
 * Returns the string of a number but with periods on thousands.
 * @param {Number} x - The number which will be used.
 * @return {String} The formatted number with periods on thousands.
 */
function numberWithPeriods(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Makes the candidates' votes chart on the DOM.
 * @param {Object} data - Data object as specified in parseDataObject().
 */
async function plotVotesPerCandidate(data) {
  if (document.getElementById('votesPerCandidate')) {
    document.getElementById('votesPerCandidate').remove();
  }
  const myCanvas = document.createElement('canvas');
  myCanvas.id = 'votesPerCandidate';

  document.querySelector('#graphs').appendChild(myCanvas);

  const votesArray = [];
  let names = [];

  const candidates = data.candidates.sort((a, b) => a.seq - b.seq);
  for (let i = 0; i < candidates.length; i++) {
    votesArray.push(candidates[i].votes);
    names.push(candidates[i].name);
  }

  let graphVotes = votesArray;

  const maxCandidates = 20;
  if (votesArray.length > maxCandidates) {
    // let others = votesArray // May be used someday but not now.
    //     .slice(maxCandidates - 1)
    //     .reduce((a, b) => a + b);
    names = names.slice(0, maxCandidates - 1);
    // names.push("Outros");
    graphVotes = votesArray.slice(0, maxCandidates - 1);
    // votesArray.push(others);
  }

  if (names.length <= 0) {
    return;
  }

  let cityName = await getCityByCode(data.cl);
  cityName = cityName.replace(/^\w/, (c) => c.toUpperCase());
  if (names.length <= 4) {
    new Chart(document.getElementById('votesPerCandidate'), {
      type: 'bar',
      data: {
        datasets: [
          {
            data: graphVotes,
            backgroundColor: generateColors(Object.keys(data.candidates)
                .length),
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
            label: function(tooltipItem, data) {
              let label = data.datasets[0].data[tooltipItem.index];
              let percentage = (
                (parseInt(graphVotes[tooltipItem.index]) * 100) /
                votesArray.reduce(function(a, b) {
                  return a + b;
                })).toFixed(2);

              percentage = percentage == NaN ? 0 : percentage;

              // eslint-disable-next-line max-len
              label = `≅ ${String(percentage).replace('.', ',')}% dos votos (${graphVotes[tooltipItem.index]})`;
              return label;
            },
          },
        },

        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
    });
  } else if (names.length > 4) {
    new Chart(document.getElementById('votesPerCandidate'), {
      type: 'horizontalBar',
      data: {
        datasets: [
          {
            data: graphVotes,
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
            label: function(tooltipItem, data) {
              let label = data.datasets[0].data[tooltipItem.index];
              let percentage = (
                (parseInt(graphVotes[tooltipItem.index]) * 100) /
                votesArray.reduce(function(a, b) {
                  return a + b;
                })
              ).toFixed(2);

              percentage = percentage == NaN ? 0 : percentage;

              // eslint-disable-next-line max-len
              label = `≅ ${String(percentage).replace('.', ',')}% dos votos (${graphVotes[tooltipItem.index]})`;
              return label;
            },
          },
        },
        scales: {
          xAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
    });
  }
}

/**
 * Makes the votosApurados chart on the DOM.
 * @param {Object} data - Data object as specified in parseDataObject().
 */
function plotUrnasApuradas(data) {
  if (document.getElementById('urnasApuradas')) {
    document.getElementById('urnasApuradas').remove();
  }
  if (data.candidates.length <= 0) {
    return;
  }
  const myCanvas = document.createElement('canvas');
  myCanvas.id = 'urnasApuradas';

  document.querySelector('#graphs').appendChild(myCanvas);

  const urnasApuradas = parseFloat(data.as.replace(',', '.'));

  new Chart(document.getElementById('urnasApuradas'), {
    type: 'pie',
    data: {
      datasets: [
        {
          data: [urnasApuradas, 100 - urnasApuradas],
          backgroundColor: ['#00b31b', '#e61e1e'],
        },
      ],

      labels: ['Apuradas', 'Não apuradas'],
    },
    options: {
      title: {
        display: true,
        text: `Urnas Apuradas`,
      },
      tooltips: {
        callbacks: {
          label: function(tooltipItem, data) {
            let label = data.datasets[0].data[tooltipItem.index];

            label += '%';
            return label;
          },
        },
      },
    },
  });
}

/**
 * Makes the votes' table on the DOM.
 * @param {Object} data - Data object as specified in parseDataObject().
 */
function generateCandTable(data) {
  if (document.querySelector('#candTable')) {
    document.querySelector('#candTable').remove();
  }

  const votesArray = [];

  for (let i = 0; i < data.candidates.length; i++) {
    votesArray.push(data.candidates[i].votes);
  }

  const table = document.createElement('table');
  table.className = 'table-responsive';
  table.id = 'candTable';
  const headerRow = document.createElement('tr');
  table.appendChild(headerRow); // Creating the row that has headers

  // ==> Appending headers
  const candidateName = document.createElement('th');
  candidateName.textContent = 'Candidato';
  headerRow.appendChild(candidateName);

  const partyAbbr = document.createElement('th');
  partyAbbr.textContent = 'Partido';
  headerRow.appendChild(partyAbbr);

  const votes = document.createElement('th');
  votes.textContent = '# de votos';
  headerRow.appendChild(votes);

  const elected = document.createElement('th');
  elected.textContent = 'Eleito?';
  headerRow.appendChild(elected);

  if (data.candidates.length <= 0) {
    return;
  }

  // ==> Creating the actual rows
  data.candidates.forEach((candidate) => {
    const row = document.createElement('tr');
    table.appendChild(row);

    const currCandidateName = document.createElement('td');
    currCandidateName.innerHTML = candidate.name;
    row.appendChild(currCandidateName);

    

    const partyAbbrLine = document.createElement('td');
    // eslint-disable-next-line max-len
    partyAbbrLine.innerHTML = `<abbr title="${candidate.partyName}">${candidate.partyAbbr}</abbr>`;
    row.appendChild(partyAbbrLine);

    const currCandidateVotes = document.createElement('td');
    currCandidateVotes.textContent = numberWithPeriods(candidate.votes);

    let currCandidatePercentage = (
      (parseInt(candidate.votes) * 100) /
      votesArray.reduce(function(a, b) {
        return a + b;
      })
    ).toFixed(2);

    if (currCandidatePercentage == 'NaN') {
      currCandidatePercentage = 0;
    }

    const currCandidatePercentageSpan = document.createElement('span');
    currCandidatePercentageSpan.className = 'small';
    // eslint-disable-next-line max-len
    currCandidatePercentageSpan.textContent = ` (${String(currCandidatePercentage).replace('.', ',')}%)`;
    currCandidateVotes.appendChild(document.createElement('br'));
    currCandidateVotes.appendChild(currCandidatePercentageSpan);

    row.appendChild(currCandidateVotes);
    table.appendChild(row);

    if (candidate.status != 'Válido' &&
    candidate.status != 'Válido (legenda)') {
      currCandidateName.style.backgroundColor = 'rgba(255, 250, 184, 1)';
      partyAbbrLine.style.backgroundColor = 'rgba(255, 250, 184, 1)';
      currCandidateVotes.style.backgroundColor = 'rgba(255, 250, 184, 1)';
      const currCandidateStatusSpan = document.createElement('span');
      currCandidateStatusSpan.className = 'small';
      // eslint-disable-next-line max-len
      currCandidateStatusSpan.textContent = candidate.status;
      currCandidateName.appendChild(document.createElement('br'));
      currCandidateName.appendChild(currCandidateStatusSpan);
    }

    const isCurrCandidateElected = document.createElement('td');

    if (candidate.elected) {
      isCurrCandidateElected.textContent = 'Sim';
      isCurrCandidateElected.style.backgroundColor = '#30ff91';
      isCurrCandidateElected.style.color = '#000000';
    } else if (candidate.matematicamente) {
      isCurrCandidateElected.textContent = 'Matematicamente';
      isCurrCandidateElected.style.backgroundColor = '#fde910';
      isCurrCandidateElected.style.color = '#000000';
    } else if (!candidate.elected) {
      isCurrCandidateElected.textContent = 'Não';
      isCurrCandidateElected.style.backgroundColor = '#ff3037';
      isCurrCandidateElected.style.color = '#FFFFFF';
    }

    row.appendChild(isCurrCandidateElected);
    if (candidate.seq <= 55) {
      const candidatePicture = document.createElement('img');
      candidatePicture.id = `imagem${candidate.sqcand}`;
      candidatePicture.className = 'candidatePicture';
      candidatePicture.src = provideImageLink(candidate.sqcand, data.uf);
      row.appendChild(candidatePicture);
    }

    table.appendChild(row);
  });

  document.querySelector('#graphs').appendChild(table);
}

/**
 * Makes the null and white votes' table on the DOM.
 * @param {Object} data - Data object as specified in parseDataObject().
 */
function generateNullVotesTable(data) {
  if (document.querySelector('#nullVotesTable')) {
    document.querySelector('#nullVotesTable').remove();
  }

  const table = document.createElement('table');
  table.className = 'table-responsive';
  table.id = 'nullVotesTable';

  const whiteVotes = document.createElement('tr');
  const whiteVotesText = document.createElement('th');
  whiteVotesText.textContent = 'Votos Brancos';
  whiteVotes.appendChild(whiteVotesText);
  const whiteVotesNumber = document.createElement('td');
  whiteVotesNumber.textContent = numberWithPeriods(data.whiteVotes);
  whiteVotes.appendChild(whiteVotesNumber);

  const nullVotes = document.createElement('tr');
  const nullVotesText = document.createElement('th');
  nullVotesText.textContent = 'Votos Nulos';
  nullVotes.appendChild(nullVotesText);
  const nullVotesNumber = document.createElement('td');
  nullVotesNumber.textContent = numberWithPeriods(data.nullVotes);
  nullVotes.appendChild(nullVotesNumber);

  table.appendChild(whiteVotes);
  table.appendChild(nullVotes);

  document.querySelector('#graphs').appendChild(table);
}

/**
 * Checks if anyone is elected in this election.
 * @param {Object} data - Data object as specified in parseDataObject().
 * @return {String|Boolean} 'eleito' if elected;
 * 'matematicamente' if mathematically elected;
 * false if not elected in any way.
 */
function checkElected(data) {
  if (data.candidates.filter((c) => c.elected).length > 0) {
    return 'eleito';
  } else if (data.candidates.filter((c) => c.matematicamente).length > 0) {
    return 'matematicamente';
  } else {
    return false;
  }
}

/**
 * Checks if any candidate in this election is mathematically elected.
 * @param {Object} data - Data object as specified in parseDataObject().
 */
function matematicamenteEleito(data) {
  if (data.role == 'vereador') {
    return;
  }

  const urnasApuradas = parseFloat(data.as.replace(',', '.'));
  const candidates = data.candidates.sort((a, b) => b.votes - a.votes);
  const eleitores = parseInt(data.dadosFixos.br.uf[0].mun[0].e);

  // => Votos totais
  const votesArray = [];
  for (let i = 0; i < candidates.length; i++) {
    votesArray.push(candidates[i].votes);
  }

  const totalVotes = votesArray.reduce((a, b) => a + b);

  if (totalVotes <= 0) {
    return;
  }

  const firstPlacePercentage = (candidates[0].votes * 100) / totalVotes;
  const secondPlacePercentage = (candidates[1].votes * 100) / totalVotes;
  if (candidates.filter((candidate) => candidate.elected == true).length <= 0) {
    if (eleitores > 200000 && candidates.length > 2) {
      // Pode ter segundo turno

      const thirdPlacePercentage = (candidates[2].votes * 100) / totalVotes;

      if (100 - urnasApuradas < 50 - firstPlacePercentage &&
        !(firstPlacePercentage < 50)) {
        candidates[0].matematicamente = true; // ELEITO EM 1º TURNO
      } else if (100 - urnasApuradas + firstPlacePercentage < 50 &&
        100 - urnasApuradas + thirdPlacePercentage < secondPlacePercentage) {
        candidates[0].matematicamente = true;
        candidates[1].matematicamente = true;
      }
    } else {
      // Não tem segundo turno
      if (!(100 - urnasApuradas + secondPlacePercentage >
        firstPlacePercentage)) {
        // ELEITO POR NÃO TER COMO O 2º GANHAR E CONSEQUENTEMENTE OS OUTROS
        candidates[0].matematicamente = true;
      }
    }
  }
}

/**
 * Creates a data object with a model used in the rest of the script.
 * @param {Object} data - Data object as provided by Brazillian TSE
 * @return {Object} Data object that is used in the rest of the script.
 * This will be specified later in due course.
 */
async function parseDataObject(data) {
  const obj = {};

  // Código de Local
  obj.cl = String(data.abr[0].cdabr);

  // Nome de Local
  obj.nl = await getCityByCode(obj.cl);

  // Role parsing
  obj.role = roleCodeToRoleString(data.carper);

  // Date and hour
  obj.dh = String(data.dg) + ' ' + String(data.hg);

  // Seções apuradas (%)
  obj.as = String(data.abr[0].pst);

  // Votos brancos
  obj.whiteVotes = String(data.abr[0].vb);

  // Votos nulos
  obj.nullVotes = String(data.abr[0].tvn);

  // => Dados fixos
  obj.dadosFixos = await getFixedFile(data.nadf);

  // Unidade da Federação
  obj.uf = obj.dadosFixos.br.uf[0].sg.toLowerCase();

  // Candidatos e votos
  obj.candidates = [];
  data.abr[0].cand.forEach((candidate) => {
    obj.candidates.push({});
    obj.candidates[obj.candidates.length - 1].number = String(candidate.n);
    obj.candidates[obj.candidates.length - 1].name = getCandidateByNumber(
        String(candidate.n), obj.dadosFixos);
    obj.candidates[obj.candidates.length - 1].partyAbbr = getPartyAbbrByNumber(
        String(candidate.n), obj.dadosFixos);

    obj.candidates[obj.candidates.length - 1].partyName = getPartyNameByNumber(
        String(candidate.n), obj.dadosFixos);


    obj.candidates[obj.candidates.length - 1].sqcand = getSqcandByNumber(
        String(candidate.n), obj.dadosFixos);

    obj.candidates[obj.candidates.length - 1].status = getStatusByNumber(
        String(candidate.n), obj.dadosFixos);

    // VOTOS .......
    if (String(candidate.e) == 'S') {
      obj.candidates[obj.candidates.length - 1].elected = true;
    } else if (String(candidate.e) == 'N') {
      obj.candidates[obj.candidates.length - 1].elected = false;
    }

    obj.candidates[obj.candidates.length - 1].matematicamente = false;

    // Número de votos
    obj.candidates[obj.candidates.length - 1].votes = parseInt(candidate.vap);

    obj.candidates[obj.candidates.length - 1].seq = candidate.seq;
  });

  matematicamenteEleito(obj);
  obj.candidates = obj.candidates.sort((a, b) => b.seq - a.seq);

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
