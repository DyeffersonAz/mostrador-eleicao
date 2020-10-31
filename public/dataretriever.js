/* eslint-disable no-unused-vars */
const fileCache = {}; // Arquivos (mais recentes) salvos

if (localStorage.getItem('elected') === null) {
  localStorage.setItem('elected', JSON.stringify([]));
}

const host = 'https://resultados.tse.jus.br/publico';
const ciclo = 'ele2020';
const ambiente = 'simulado';
const codigoEleicao = '8334';

/**
 * Sleeps for an specified amount of time (not executing anything).
 * @param {Integer} ms - Number of millisseconds
 * @return {Promisse}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Gets the specified file from Brazillian TSE.
 * @param {String} city - City of the election.
 * @param {String} uf - State of the election.
 * @param {String} role - Role of the election.
 * @return {Object} Parsed JSON retrieved from Brazillian TSE.
 */
async function getVariableFile(city, uf, role) {
  // IR AO TSE
  console.log(`Pegando arquivo da eleição de ${city.name} para ${role}`);
  const cityCode = await getCityCode(city, uf);
  const roleCode = String(roleStringToRoleCode(role)).padStart(4, '0');
  const filepath =
  `${
    host}/${
    ciclo}/divulgacao/${
    ambiente}/${
    codigoEleicao}/dados/${uf}/${uf}${
    String(cityCode).padStart(5, '0')}-c${
    roleCode}-e${codigoEleicao.padStart(6, '0')}-v.json`;
  let rawFile = await fetch(`fetchJSON/${filepath}`, {
    // mode: "no-cors",
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  });

  if (rawFile.status == 429) {
    await sleep(1000);
    rawFile = await fetch(`fetchJSON/${filepath}`, {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    });
  }

  const jsonFile = await rawFile.json();
  return jsonFile;
}

/**
 * Retrieves a fixed file from Brazillian TSE.
 * @param {String} filename - Name of the file inside Brazillian's TSE server.
 * @return {Object} Parsed JSON retrieved from Brazillian TSE.
 */
async function getFixedFile(filename) {
  const filepath =
  `${
    host}/${
    ciclo}/divulgacao/${
    ambiente}/${
    codigoEleicao}/dados/${
    filename.slice(0, 2)}/${
    filename}.json`;

  let rawFile = await fetch(`fetchJSON/${filepath}`, {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  });

  if (rawFile.status == 429) {
    await sleep(1000);
    rawFile = await fetch(`fetchJSON/${filepath}`, {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    });
  }

  const jsonFile = await rawFile.json();
  return jsonFile;
}

/**
 * Gets all files necessary and stores it in session's cache.
 * It also notifies the user when a non-documented election happens.
 */
async function getFiles() {
  const electedCache = await JSON.parse(localStorage.getItem('elected'));

  for (const city of cities) {
    let prefeito = await getVariableFile(city, city.uf, 'prefeito');
    let vereador = await getVariableFile(city, city.uf, 'vereador');

    prefeito = await parseDataObject(prefeito);
    vereador = await parseDataObject(vereador);

    fileCache[`${city.name.toLowerCase()}_prefeito`] = prefeito;
    fileCache[`${city.name.toLowerCase()}_vereador`] = vereador;

    // => PREFEITO
    if (!electedCache.includes(`${city.name.toLowerCase()}_prefeito`)) {
      if (checkElected(prefeito) == 'eleito') {
        electedCache.push(`${city.name.toLowerCase()}_prefeito`);
        notifyElection(
            'ELEIÇÃO!', `Prefeito(a) eleito(a) em ${city.name}`);
      } else if (checkElected(prefeito) == 'matematicamente') {
        notifyMatematicamente(
            'MATEMATICAMENTE ELEITO!',
            `Prefeito(a) matematicamente eleito(a) em ${city.name
            }. Resta aguardar ainda se o TSE vai considerar eleito(a) ou não.`);
      }
    }

    // => VEREADOR
    if (!electedCache.includes(`${city.name.toLowerCase()}_vereador`)) {
      if (checkElected(vereador) == 'eleito') {
        electedCache.push(`${city.name.toLowerCase()}_vereador`);
        notifyElection(
            'ELEIÇÃO!', `Vereador(a) eleito(a) em ${city.name}`);
      } else if (checkElected(vereador) == 'matematicamente') {
        notifyMatematicamente(
            'MATEMATICAMENTE ELEITO!',
            `Vereador(a) matematicamente eleito(a) em ${city.name
            }. Resta aguardar ainda se o TSE vai considerar eleito(a) ou não.`);
      }
    }
  }
  console.log(fileCache);
  localStorage.setItem('elected', JSON.stringify(electedCache));
  console.log(localStorage.getItem('elected'));
  changedForm();
}

/**
 * Gets a file in cache with specified arguments.
 * @param {String} city - City related to the file.
 * @param {String} role - Role related to the file.
 * @return {Object} File stored in cache.
 */
function getStoredFile(city, role) {
  return fileCache[`${city.toLowerCase()}_${role}`];
}

/**
 * Assemble's the URL of the image of a candidate.
 * @param {Integer} sqCand - Candidate Identifier.
 * @param {String} uf - Candidate's state.
 * @return {String} - URL of the image.
 */
function provideImageLink(sqCand, uf) {
  // https://divulgacao-resultados.tse.jus.br/ele2020/divulgacao/homologacaotre/7555/fotos/br/280000731765.jpeg

  return `/fetchImage/${
    host}/${
    ciclo}/divulgacao/${
    ambiente}/${
    codigoEleicao}/fotos/${uf}/${sqCand}.jpeg`;
}

/**
 * Gets the candidate's name with a defined value.
 * @param {Integer} number - The number of the candidate in this election.
 * @param {Object} fixedFile - The fixed file for this election.
 * @return {String} - The name of the candidate.
 */
function getCandidateByNumber(number, fixedFile) {
  // NO AGUARDO DO TSE
  const coligacoes = fixedFile.carg.col;
  for (const colig of coligacoes) {
    for (const party of colig.par) {
      for (const candidate of party.cand) {
        if (candidate.n == number) {
          return candidate.nmu;
        }
      }
    }
  }
}

/**
 * Returns the candidate's party name.
 * @param {Integer} number - The number of the candidate in this election.
 * @param {Object} fixedFile - The fixed file for this election.
 * @return {String} Party's name.
 */
function getPartyByNumber(number, fixedFile) {
  // NO AGUARDO DO TSE
  const coligacoes = fixedFile.carg.col;
  for (const col of coligacoes) {
    for (const par of col.par) {
      for (const cand of par.cand) {
        if (cand.n == number) {
          return par.sg;
        }
      }
    }
  }
}

/**
 * Returns the candidate's identifier.
 * @param {Integer} number - The number of the candidate in this election.
 * @param {Object} fixedFile - The fixed file for this election.
 * @return {Integer} Candidate's identifier.
 */
function getSqcandByNumber(number, fixedFile) {
  // NO AGUARDO DO TSE
  const coligacoes = fixedFile.carg.col;
  for (const col of coligacoes) {
    for (const par of col.par) {
      for (const cand of par.cand) {
        if (cand.n == number) {
          return cand.sqcand;
        }
      }
    }
  }
}

/**
 * Returns the city code.
 * @param {String} city - The name of the city.
 * @param {String} uf - The name of the state.
 * @return {Integer} The city's code.
 */
async function getCityCode(city, uf) {
  const codesDB = await fetch(
      'https://raw.githubusercontent.com/betafcc/Municipios-Brasileiros-TSE/master/municipios_brasileiros_tse.json');
  const codesDBJSON = await codesDB.json();
  const DBCity = codesDBJSON.filter(
      (elt) =>
        elt.nome_municipio == city.name.toUpperCase() &&
        elt.uf == uf.toUpperCase())[0];
  const cityCode = DBCity.codigo_tse;

  return cityCode;
}
/**
 * Returns the city's name.
 * @param {Integer} cityCode - The code of the city.
 * @return {String} The city's name.
 */
async function getCityByCode(cityCode) {
  const codesDB = await fetch(
      'https://raw.githubusercontent.com/betafcc/Municipios-Brasileiros-TSE/master/municipios_brasileiros_tse.json');
  const codesDBJSON = await codesDB.json();
  const DBCity = codesDBJSON.filter((elt) => elt.codigo_tse == cityCode)[0];
  const cityName = DBCity.nome_municipio;

  return cityName;
}

/**
 * Gets the code of a specified role.
 * @param {Integer} roleCode - The code of the role.
 * @return {String} The name of the role.
 */
function roleCodeToRoleString(roleCode) {
  switch (parseInt(roleCode)) {
    case 1:
      return 'presidente';
    case 3:
      return 'governador';
    case 5:
      return 'senador';
    case 11:
      return 'prefeito';
    case 6:
      return 'deputado-federal';
    case 7:
      return 'deputado-estadual';
    case 8:
      return 'deputado-distrital';
    case 13:
      return 'vereador';
  }
}

/**
 * Gets the name of a specified role code.
 * @param {String} roleString - The name of the role.
 * @return {Integer} The code of the role.
 */
function roleStringToRoleCode(roleString) {
  switch (String(roleString).toLowerCase()) {
    case 'presidente':
      return 1;
    case 'governador':
      return 3;
    case 'senador':
      return 5;
    case 'prefeito':
      return 11;
    case 'deputado-federal':
      return 6;
    case 'deputado-estadual':
      return 7;
    case 'deputado-distrital':
      return 8;
    case 'vereador':
      return 13;
  }
}
