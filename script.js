Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)];
};

class Formiga {
  valor = "🐜";
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
  }

  pegarComida() {
    this.comidasCapturadas++;
    this.valor = `🐜${"🌿".repeat(this.comidasCapturadas)}`;
    return this.valor;
  }

  irAteNinho() {
    this.ambiente.ambiente.map((linha, indexLinha) => {
      if (indexLinha % 2 == 0) {
        for (let i = 0; i < linha.length; i++) {
          this.ambiente.ambiente[indexLinha][i] = this.ambiente.temComida(
            indexLinha,
            i
          )
            ? this.pegarComida()
            : this.valor;
          if (i != 0) {
            this.ambiente.ambiente[indexLinha][i - 1] = "V";
          }
          this.ambiente.mostrar();
        }
        this.ambiente.ambiente[indexLinha][4] = "V";
      } else {
        for (let i = 4; i >= 0; i--) {
          this.ambiente.ambiente[indexLinha][i] = this.ambiente.temComida(
            indexLinha,
            i
          )
            ? this.pegarComida()
            : this.valor;
          if (i != 4) {
            this.ambiente.ambiente[indexLinha][i + 1] = "V";
          }
          this.ambiente.mostrar();
        }
        this.ambiente.ambiente[indexLinha][0] = "V";
      }
    });
    this.chegouNoNinho = true;
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
    this.mostrar();
    this.comidas = this.mapearComidas();
    this.comidasRestantes = this.comidas.length;
  }
  gerar() {
    const ambiente = [
      ["🐜", "", "", "", ""],
      ["", "", "", "", ""],
      ["", "", "", "", ""],
      ["", "", "", "", ""],
      ["", "", "", "", "N"],
    ];

    let comida = { valor: "🌿", quantidade: 0, limite: 3, min: 1 };
    let ninho = { valor: "N", quantidade: 0, limite: 1 };
    let predador = { valor: "P", quantidade: 0, limite: 0 };
    let vazio = { valor: "V", quantidade: 0, limite: -1 };
    let elementos = [comida, predador];

    ambiente.forEach((linha, indexLinha) => {
      linha.forEach((celula, indexCelula) => {
        if (
          (indexLinha === 0 && indexCelula === 0) ||
          (indexLinha === 4 && indexCelula === 4)
        ) {
          return;
        }
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
    return this.ambiente[linha][coluna].includes("🌿");
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
        if (coluna === "🐜") {
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
      if (linha.findIndex((valor) => valor.includes("🌿")) > -1) {
        linha.map((coluna, indexColuna) => {
          coluna.includes("🌿")
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

formiga.irAteNinho();
