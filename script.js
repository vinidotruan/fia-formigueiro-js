Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)];
};

class Formiga {
  valor = "F";
  coluna;
  linha;
  ambiente;
  movimentos = ["nascer"];
  coordenadas;
  comidasCapturadas = 0;
  cont = 0;
  chegouNoNinho = false;
  constructor(linha, coluna, ambiente = new Ambiente()) {
    this.linha = linha;
    this.coluna = coluna;
    this.ambiente = ambiente;
    this.coordenadas = { linha: this.linha, coluna: this.coluna };
  }

  modificarAmbienteAnterior() {
    this.ambiente.ambiente[this.linha][this.coluna] = this.ambiente.temNinho(
      this.linha,
      this.coluna
    )
      ? `N`
      : "V";
  }

  modificarAmbientePosterior() {
    if (this.ambiente.temComida(this.linha, this.coluna)) {
      this.ambiente.ambiente[this.linha][this.coluna] = this.pegarComida();
    } else if (this.ambiente.temNinho(this.linha, this.coluna)) {
      this.ambiente.ambiente[this.linha][this.coluna] = `N${this.valor}`;
    } else {
      this.ambiente.ambiente[this.linha][this.coluna] = this.valor;
    }
    this.ambiente.mostrar();
    const novaLinhaAlvo = this.ambiente.comidaMaisProximaLocalizacao(
      this.linha,
      this.coluna
    )?.linha;
    const novaColunaAlvo = this.ambiente.comidaMaisProximaLocalizacao(
      this.linha,
      this.coluna
    )?.coluna;
    if (this.ambiente.comidasRestantes == 0 && !this.chegouNoNinho) {
      return this.irAteNinho(
        this.ambiente.ninhoLocalizacao().linha,
        this.ambiente.ninhoLocalizacao().coluna
      );
    } else if (this.ambiente.comidasRestantes > 0) {
      return this.irAte(novaLinhaAlvo, novaColunaAlvo);
    } else {
      return false;
    }
  }

  pegarComida() {
    this.comidasCapturadas++;
    this.ambiente.comidasRestantes--;
    const comida = this.ambiente.comidas.find(
      (comida) => comida.coluna === this.coluna && comida.linha === this.linha
    );
    comida.pega = true;
    this.valor = `F${"C".repeat(this.comidasCapturadas)}`;
    return this.valor;
  }

  irDireita() {
    this.modificarAmbienteAnterior();
    this.coluna++;
    return this.modificarAmbientePosterior();
  }

  irEsquerda() {
    this.modificarAmbienteAnterior();
    this.coluna--;
    return this.modificarAmbientePosterior();
  }

  irCima() {
    this.modificarAmbienteAnterior();
    this.linha--;
    return this.modificarAmbientePosterior();
  }

  irBaixo() {
    this.modificarAmbienteAnterior();
    this.linha++;
    return this.modificarAmbientePosterior();
  }

  irAte(linhaAlvo, colunaAlvo) {
    while (this.ambiente.comidasRestantes !== 0) {
      this.cont++;

      if (this.coluna > colunaAlvo) {
        this.movimentos.push("esquerda");
        return this.irEsquerda(this.linha, this.coluna);
      } else if (this.coluna < colunaAlvo) {
        this.movimentos.push("direita");
        return this.irDireita();
      } else {
        console.log("coluna igual");
        if (this.linha > linhaAlvo) {
          this.movimentos.push("cima");
          return this.irCima();
        } else {
          this.movimentos.push("baixo");
          return this.irBaixo();
        }
      }
    }
    return;
  }

  irAteNinho(linhaAlvo, colunaAlvo) {
    while (this.linha !== linhaAlvo || this.coluna !== colunaAlvo) {
      if (this.coluna > colunaAlvo) {
        this.movimentos.push("esquerda");
        return this.irEsquerda(this.linha, this.coluna);
      } else if (this.coluna < colunaAlvo) {
        this.movimentos.push("direita");
        return this.irDireita();
      } else {
        console.log("coluna igual");
        if (this.linha > linhaAlvo) {
          this.movimentos.push("cima");
          return this.irCima();
        } else {
          this.movimentos.push("baixo");
          return this.irBaixo();
        }
      }
    }
    this.chegouNoNinho = true;
    console.log("chegou aq");
    this.ambiente.mostrar();
    return;
  }
}

class Ambiente {
  ambiente;
  comidas;
  comidasRestantes = 0;

  constructor() {
    this.gerar();
    this.comidas = this.mapearComidas();
    this.comidasRestantes = this.comidas.length;
  }
  gerar() {
    const ambiente = [
      [[], [], [], [], []],
      [[], [], [], [], []],
      [[], [], [], [], []],
      [[], [], [], [], []],
      [[], [], [], [], []],
    ];

    let formiga = { valor: "F", quantidade: 0, limite: 1 };
    let comida = { valor: "C", quantidade: 0, limite: 3, min: 1 };
    let ninho = { valor: "N", quantidade: 0, limite: 1 };
    let predador = { valor: "P", quantidade: 0, limite: 0 };
    let vazio = { valor: "V", quantidade: 0, limite: -1 };
    let elementos = [comida, ninho, predador, formiga];

    ambiente.forEach((linha, indexLinha) => {
      linha.forEach((celula, indexCelula) => {
        let elementoAux = elementos.random();
        let celulaValor =
          elementoAux.quantidade !== elementoAux.limite ? elementoAux : vazio;

        elementos.map((elemento) => {
          if (elemento.valor === celulaValor.valor) {
            elemento.quantidade++;
            return elemento;
          }
        });
        celula = celulaValor;
        ambiente[indexLinha][indexCelula] = celula?.valor;
      });
    });
    return (this.ambiente = ambiente);
  }

  estaVazio(linha, coluna) {
    return this.ambiente[linha][coluna].includes("V");
  }

  temComida(linha, coluna) {
    return this.ambiente[linha][coluna].includes("C");
  }

  temNinho(linha, coluna) {
    return this.ambiente[linha][coluna].includes("N");
  }

  temPredador(linha, coluna) {
    return this.ambiente[linha][coluna].includes("P");
  }

  formigaLocalizacao() {
    let formigaCoordenadas;
    this.ambiente.map((linha, indexLinha) => {
      linha.map((coluna, indexColuna) => {
        if (coluna === "F") {
          formigaCoordenadas = { linha: indexLinha, coluna: indexColuna };
          return coluna;
        }
      });
    });

    return formigaCoordenadas;
  }

  ninhoLocalizacao() {
    let ninhoCoordenadas;
    this.ambiente.map((linha, indexLinha) => {
      linha.map((coluna, indexColuna) => {
        if (coluna.includes("N")) {
          ninhoCoordenadas = { linha: indexLinha, coluna: indexColuna };
          return coluna;
        }
      });
    });

    return ninhoCoordenadas;
  }

  mapearComidas() {
    let comidasCoordenadas = [];
    this.ambiente.map((linha, indexLinha) => {
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

    return comidasCoordenadas;
  }

  comidaMaisProximaLocalizacao(linha, coluna) {
    this.comidas = this.comidas.filter((comida) => !comida.pega);
    if (this.comidas.length >= 1) {
      let comidaMaisProxima = this.comidas
        .filter((comida) => !comida.pega)
        .reduce(function (anterior, corrente) {
          return Math.abs(corrente.linha - linha) +
            Math.abs(corrente.coluna - coluna) <=
            Math.abs(anterior.linha - linha) +
              Math.abs(anterior.coluna - coluna)
            ? corrente
            : anterior;
        });
      return comidaMaisProxima;
    }
  }

  mostrar() {
    console.table(this.ambiente);
  }
}

ambiente = new Ambiente();

formiga = new Formiga(
  ambiente.formigaLocalizacao().linha,
  ambiente.formigaLocalizacao().coluna,
  ambiente
);

formiga.irAte();
