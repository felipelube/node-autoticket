module.exports = grammar => grammar.createSemantics()
  .addOperation('toSA', {
    Exp(e) {
      return e.toSA();
    },
    empresa(cabe, l1, resp, l2, cate, l3, resu, l4, desc) {
      return {
        requester: resp.toSA(),
        affectedUser: resp.toSA(),
        category: cate.toSA(),
        summary: resu.toSA(),
        description: desc.toSA(),
      }
    },
    cabecalho(textoFixo, espaco, numero, parem1, nome, parem2) { // eslint-disable-line no-unused-vars
      return {
        empresa: nome.toSA().join(""),
        numero: parseInt(numero.toSA().join(""), 10),
      }
    },
    responsavel(textoFixo, value) {
      return value.toSA().join("");
    },
    categoria(textoFixo, value) {
      return value.toSA().join("");
    },
    resumo(textoFixo, value) {
      return value.toSA().join("");
    },
    descricao(textoFixo, value) {
      return value.toSA().join("");
    },
    _terminal() {
      return this.primitiveValue;
    }
  });