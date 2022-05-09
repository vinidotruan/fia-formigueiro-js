Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)];
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
const predador = { valor: "P", quantidade: 0, limite: 6 };
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

  mostrarAmbiente();
  return ambiente;
};

const elementoAleatorio = () => {
  const elementos = [comida, ninho, formiga, predador];
  const elementoAtual = elementos.random();

  if (elementoAtual.quantidade != elementoAtual.limite) {
    elementoAtual.quantidade++;
    return elementoAtual;
  }

  return vazio;
};

function estaVazio(linha, coluna) {
  return ambiente[linha][coluna].includes("V") ;
}

function temComida(linha, coluna) {
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
  console.log({ comidas });
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

    console.log({ comidaMaisProxima });
    return irParaComidaMaisProxima();
  } else {
    alert("ACABOU AS COMIDAS");
    return false;
  }
}

function buscarFormiga() {
  ambiente.map((linha, indexLinha) => {
    linha.map((coluna, indexColuna) => {
      if (coluna.includes("F")) {
        formigaCoordenadas = { linha: indexLinha, coluna: indexColuna };
      }
    });
  });
}

function atualizarCelulaAnterior(linhaAtual, colunaAtual) {
  if(ambiente[linhaAtual][colunaAtual]) {
    ambiente[linhaAtual][colunaAtual] = temNinho(linhaAtual, colunaAtual)
      ? "N"
      : "V";
  }
  return ambiente;
}

function atualizarColunaAtual(linha, coluna) {
  if(ambiente[linha][coluna]) {

    ambiente[linha][coluna] = estaVazio(linha, coluna)
    ? `${unidadeFormiga}`
    : `${ambiente[linha][coluna]}${unidadeFormiga}`;
    
    setTimeout(() => {
      temComida(linha, coluna) ? pegarComida() : {};
    }, 2000);
  }

  return ambiente;
}

function pegarComida() {
  console.log("Formiga pegou uma comida");
  
  comidasCoordenadas.map((comida) => {
    if(comida.linha === formigaCoordenadas.linha &&
      comida.coluna === formigaCoordenadas.coluna) {
        comida.pega = true;
        comidasArmazenadas++;
        unidadeFormiga = `F${"C".repeat(comidasArmazenadas)}`;
        return comida;
    }
    return comida;
  });
  console.log({ comidasArmazenadas });
  setTimeout(() => {

    buscarComidaMaisProxima();
  }, 2000);
  return ambiente;
}

function descer(linhaAtual, colunaAtual) {
  console.log("formiga está descendo");
  formigaCoordenadas.linha++;

  atualizarCelulaAnterior(linhaAtual, colunaAtual);
  atualizarColunaAtual(formigaCoordenadas.linha, colunaAtual);
  // console.table(ambiente);
  return ambiente;
}

function subir(linhaAtual, colunaAtual) {
  console.log("formiga está subindo");
  formigaCoordenadas.linha--;

  atualizarCelulaAnterior(linhaAtual, colunaAtual);
  atualizarColunaAtual(formigaCoordenadas.linha, colunaAtual);

  // console.table(ambiente);
  return ambiente;
}

function direita(linhaAtual, colunaAtual) {
  console.log("formiga está indo para direita");
  formigaCoordenadas.coluna++;
  atualizarCelulaAnterior(linhaAtual, colunaAtual);
  atualizarColunaAtual(linhaAtual, formigaCoordenadas.coluna);

  // console.table(ambiente);
  return ambiente;
}

function esquerda(linhaAtual, colunaAtual) {
  console.log("formiga está indo para esquerda");
  formigaCoordenadas.coluna--;
  atualizarCelulaAnterior(linhaAtual, colunaAtual);
  atualizarColunaAtual(linhaAtual, formigaCoordenadas.coluna);
  // console.table(ambiente);
  return ambiente;
}

function irParaComidaMaisProxima() {
  cont = 0;
  while (comidasArmazenadas !== comidasCoordenadas.length) {
    cont++;
    console.table(ambiente);

    if(cont> 199) { console.log("fourcou o vreak");break }
    if (
      formigaCoordenadas.coluna > comidaMaisProxima.coluna &&
      podeIrEsquerda(formigaCoordenadas.linha, formigaCoordenadas.coluna)
    ) {
      movimentos.push("esquerda");
      return esquerda(formigaCoordenadas.linha, formigaCoordenadas.coluna);
    } else if (
      formigaCoordenadas.coluna < comidaMaisProxima.coluna &&
      podeIrDireita(formigaCoordenadas.linha, formigaCoordenadas.coluna)
    ) {
      movimentos.push("direita");
      return direita(formigaCoordenadas.linha, formigaCoordenadas.coluna);
    } else {
      if (
        formigaCoordenadas.linha < comidaMaisProxima.linha &&
        podeIrBaixo(formigaCoordenadas.linha, formigaCoordenadas.coluna)
      ) {
        movimentos.push("descer");
        return descer(formigaCoordenadas.linha, formigaCoordenadas.coluna);
      } else if (
        formigaCoordenadas.linha > comidaMaisProxima.linha &&
        podeIrCima(formigaCoordenadas.linha, formigaCoordenadas.coluna)
      ) {
        movimentos.push("subir");
        return subir(formigaCoordenadas.linha, formigaCoordenadas.coluna);
      } else {
        if(!podeIrEsquerda(formigaCoordenadas.linha, formigaCoordenadas.coluna)) {
          direita(formigaCoordenadas.linha, formigaCoordenadas.coluna);
        } else if(!podeIrDireita(formigaCoordenadas.linha, formigaCoordenadas.coluna)) {
          esquerda(formigaCoordenadas.linha, formigaCoordenadas.coluna);
        } else if (!podeIrCima(formigaCoordenadas.linha, formigaCoordenadas.coluna)) {
          descer(formigaCoordenadas.linha, formigaCoordenadas.coluna)
        } else {
          console.log("else 2")
          subir(formigaCoordenadas.linha, formigaCoordenadas.coluna)
        }
        console.log("não pode ir pra nenhum lugar")
        // irParaComidaMaisProxima();
      }
      break;
    }
  }
  console.log({ movimentos });
  console.table(ambiente)
}

// function moverVertical(linha, coluna) {
//   if (podeIrBaixo(linha, coluna)) {
//     return descer(linha, coluna);
//   }
//   if (podeIrCima(linha, coluna)) {
//     return subir(linha, coluna);
//   }
//   return false;
// }

const jogar = () => {
  buscarFormiga();
  console.log({ formigaCoordenadas });
  buscarComidas();
  buscarNinho();
  buscarComidaMaisProxima();
};

jogar();
