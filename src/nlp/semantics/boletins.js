const { nlpSemanticsBoletinsFieldCategory } = require("../../config");

module.exports = grammar =>
  grammar.createSemantics().addOperation("toSA", {
    Exp(e) {
      return e.toSA();
    },
    empresa(cabecalho, l1, resumo, l2, responsavel, l3, desc) {
      return {
        requester: responsavel.toSA(),
        affectedUser: responsavel.toSA(),
        category: nlpSemanticsBoletinsFieldCategory,
        summary: resumo.toSA(),
        description: desc.toSA()
      };
    },
    /* eslint-disable no-unused-vars */
    cabecalho(
      fixedText1,
      space1,
      number,
      space2,
      parentesis1,
      name,
      parentesis2,
      ln,
      textoFixo2
    ) {
      /* eslint-enable */
      return {
        empresa: name.toSA().join(""),
        numero: parseInt(number.toSA().join(""), 10)
      };
    },
    responsavel(textoFixo, value) {
      return value.toSA().join("");
    },
    resumo(textoFixo, value) {
      return value.toSA().join("");
    },
    descricao(textoFixo, ln, value) {
      return value.toSA().join("");
    },
    _terminal() {
      return this.primitiveValue;
    }
  });
