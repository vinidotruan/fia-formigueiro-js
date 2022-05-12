Array.prototype.random = function () {
  const result = Math.random() * this.length;
  return this[Math.floor(result)];
};

const ambiente = [
  [[], [], [], [], []],
  [[], [], [], [], []],
  [[], [], [], [], []],
  [[], [], [], [], []],
  [[], [], [], [], []],
];

const formiga = { valor: "F", quantidade: 0, limite: 1 };
const comida = { valor: "C", quantidade: 0, limite: 7, min: 1 };
const ninho = { valor: "N", quantidade: 0, limite: 1 };
const predador = { valor: "P", quantidade: 0, limite: 0 };
const vazio = { valor: "V", quantidade: 0, limite: -1 };

const movimentos = ["começo"];
let comidasArmazenadas = 0;

let formigaCoordenadas;
let comidasCoordenadas = [];
let ninhoCoordenadas = {};
let unidadeFormiga = "F";

const gerarAmbiente = () => {
  ambiente.forEach((linha, indexLinha) => {
    linha.forEach((celula, indexCelula) => {
      celula = elementoAleatorio();
      ambiente[indexLinha][indexCelula] = celula?.valor;
    });
  });

  // mostrarAmbiente();
  return ambiente;
};

const elementoAleatorio = () => {
  const elementos = [comida, ninho, predador, formiga];
  const elementoAtual = elementos.random();

  if (elementoAtual.quantidade !== elementoAtual.limite) {
    elementoAtual.quantidade++;
    return elementoAtual;
  }

  return vazio;
};

function estaVazio(linha, coluna) {
  console.log("verificando se está vazio");
  return ambiente[linha][coluna].includes("V");
}

function temComida(linha, coluna) {
  console.log("verificando se tem comida");
  return ambiente[linha][coluna].includes("C");
}

function temNinho(linha, coluna) {
  return ambiente[linha][coluna].includes("N");
}

function temPredador(linha, coluna) {
  return ambiente[linha][coluna].includes("P");
}

const mostrarAmbiente = () => {
  console.table(ambiente);
};

gerarAmbiente();

const altura = ambiente.length - 1;

/**
 * Se eu estiver na primeira linha não existe linha acima.
 * @param {*} linha
 * @returns boolean
 */
function temLinhaAcima(linha) {
  return linha > 0;
}
/**
 * Se eu estiver na última linha não posso descer.
 * @param {*} linha
 * @returns
 */
function temLinhaAbaixo(linha) {
  return linha < altura;
}

function temColunaDireita(linha, coluna) {
  return !!ambiente[linha][coluna + 1];
}
function temColunaEsquerda(linha, coluna) {
  return !!ambiente[linha][coluna - 1];
}

function podeIrCima(linha, coluna) {
  return temLinhaAcima(linha) && !temPredador(linha - 1, coluna);
}

function podeIrBaixo(linha, coluna) {
  return temLinhaAbaixo(linha) && !temPredador(linha + 1, coluna);
}

function podeIrDireita(linha, coluna) {
  return temColunaDireita(linha, coluna) && !temPredador(linha, coluna + 1);
}

function podeIrEsquerda(linha, coluna) {
  return temColunaEsquerda(linha, coluna) && !temPredador(linha, coluna - 1);
}

function buscarNinho() {
  ambiente.map((linha, indexLinha) =>
    linha.map((coluna, indexColuna) => {
      if (coluna.includes("N")) {
        ninhoCoordenadas = { linha: indexLinha, coluna: indexColuna };
      }
    })
  );

  console.log({ ninhoCoordenadas });
  return ninhoCoordenadas;
}

function buscarComidas() {
  ambiente.map((linha, indexLinha) => {
    if (linha.findIndex((valor) => valor.includes("C")) > -1) {
      linha.map((coluna, indexColuna) => {
        coluna.includes("C")
          ? comidasCoordenadas.push({
              linha: indexLinha,
              coluna: indexColuna,
              pega: false,
            })
          : {};
      });
    }
  });

  console.log({ comidasCoordenadas });
  return comidasCoordenadas;
}

// verificar qual é o ponto de comida mais próximo
function buscarComidaMaisProxima() {
  console.log("Buscando nova rota de comida");

  const comidas = comidasCoordenadas.filter((comida) => !comida.pega);
  console.log("Quantidade de comidas a serem recolhidas: ", comidas.length);
  if (comidas.length > 0) {
    comidaMaisProxima = comidasCoordenadas
      .filter((comida) => !comida.pega)
      .reduce(function (anterior, corrente) {
        return Math.abs(corrente.linha - formigaCoordenadas.linha) +
          Math.abs(corrente.coluna - formigaCoordenadas.coluna) <=
          Math.abs(anterior.linha - formigaCoordenadas.linha) +
            Math.abs(anterior.coluna - formigaCoordenadas.coluna)
          ? corrente
          : anterior;
      });

    console.log("A comida mais próxima está em: ", comidaMaisProxima);
    return irParaComidaMaisProxima();
  } else {
    // alert("acabou as comidas");
    return false;
  }
}

function buscarFormiga() {
  ambiente.map((linha, indexLinha) => {
    linha.map((coluna, indexColuna) => {
      if (coluna === "F") {
        formigaCoordenadas = { linha: indexLinha, coluna: indexColuna };
        return coluna;
      }
    });
  });
  console.log({ formigaCoordenadas });
}

function atualizarCelulaAnterior(linhaAtual, colunaAtual) {
  ambiente[linhaAtual][colunaAtual] = temNinho(linhaAtual, colunaAtual)
    ? "N"
    : "V";
  console.log("atualizou celula anterior");
  return ambiente;
}

function atualizarColunaAtual(linha, coluna) {
  if (temComida(linha, coluna)) {
    console.log("preciso pegar essa comida antes de atualizar minha celula");
    pegarComida();
  }

  setTimeout(() => {
    console.log("atualizando celula atual");

    ambiente[linha][coluna] = estaVazio(linha, coluna)
      ? `${unidadeFormiga}`
      : `${ambiente[linha][coluna]}${unidadeFormiga}`;

    irParaComidaMaisProxima();
  }, 2000);
}

function pegarComida() {
  console.log("formiga pegou uma comida");

  comidasCoordenadas.map((comida) => {
    if (
      comida.linha === formigaCoordenadas.linha &&
      comida.coluna === formigaCoordenadas.coluna
    ) {
      comida.pega = true;
      comidasArmazenadas++;
      unidadeFormiga = `F${"C".repeat(comidasArmazenadas)}`;
      return comida;
    }
    return comida;
  });

  console.log({ comidasArmazenadas });
  buscarComidaMaisProxima();
  return ambiente;
}

function descer(linhaAtual, colunaAtual) {
  console.log("formiga está descendo");
  formigaCoordenadas.linha++;

  atualizarCelulaAnterior(linhaAtual, colunaAtual);
  atualizarColunaAtual(formigaCoordenadas.linha, colunaAtual);
  return ambiente;
}

function subir(linhaAtual, colunaAtual) {
  console.log("formiga está subindo");
  formigaCoordenadas.linha--;

  atualizarCelulaAnterior(linhaAtual, colunaAtual);
  atualizarColunaAtual(formigaCoordenadas.linha, colunaAtual);
  return ambiente;
}

function direita(linhaAtual, colunaAtual) {
  console.log("formiga está indo para direita");
  formigaCoordenadas.coluna++;

  atualizarCelulaAnterior(linhaAtual, colunaAtual);
  atualizarColunaAtual(linhaAtual, formigaCoordenadas.coluna);

  return ambiente;
}

function esquerda(linhaAtual, colunaAtual) {
  console.log("formiga está indo para esquerda");
  formigaCoordenadas.coluna--;

  atualizarCelulaAnterior(linhaAtual, colunaAtual);
  atualizarColunaAtual(linhaAtual, formigaCoordenadas.coluna);

  return ambiente;
}

function irParaComidaMaisProxima(
  linha = comidaMaisProxima.linha,
  coluna = comidaMaisProxima.coluna
) {
  const comidasRestantes = comidasCoordenadas.length;
  console.log({ comidasArmazenadas }, { comidasRestantes });
  console.log("indo para comida mais proxima: ", linha, coluna);
  console.log(
    "formiga está em: ",
    formigaCoordenadas.linha,
    formigaCoordenadas.coluna
  );
  console.log(
    "formiga está na comida mais próxima: ",
    linha === formigaCoordenadas.linha && coluna === formigaCoordenadas.coluna
  );

  while (
    linha !== formigaCoordenadas.linha ||
    coluna !== formigaCoordenadas.coluna
  ) {
    if (
      formigaCoordenadas.coluna > coluna &&
      podeIrEsquerda(formigaCoordenadas.linha, formigaCoordenadas.coluna)
    ) {
      movimentos.push("esquerda");
      return esquerda(formigaCoordenadas.linha, formigaCoordenadas.coluna);
    } else if (
      formigaCoordenadas.coluna < coluna &&
      podeIrDireita(formigaCoordenadas.linha, formigaCoordenadas.coluna)
    ) {
      movimentos.push("direita");
      return direita(formigaCoordenadas.linha, formigaCoordenadas.coluna);
    } else {
      if (
        formigaCoordenadas.linha < linha &&
        podeIrBaixo(formigaCoordenadas.linha, formigaCoordenadas.coluna)
      ) {
        movimentos.push("descer");
        return descer(formigaCoordenadas.linha, formigaCoordenadas.coluna);
      } else if (
        formigaCoordenadas.linha > linha &&
        podeIrCima(formigaCoordenadas.linha, formigaCoordenadas.coluna)
      ) {
        movimentos.push("subir");
        return subir(formigaCoordenadas.linha, formigaCoordenadas.coluna);
      } else {
        // Não consigo ir para o lugar que devo ir.
        console.log("não pode ir pra nenhum lugar");
      }
    }
  }
  console.table(ambiente);
  console.log({ movimentos });
}

const jogar = () => {
  buscarFormiga();
  buscarComidas();
  buscarNinho();
  buscarComidaMaisProxima();
};

jogar();
