const ohm = require("ohm-js");
const fs = require("fs-extra");
const { resolve } = require("path");
const { __ } = require("./TranslationController");

const { nlpSemanticsDir, nlpGrammarsDir } = require("../config");

function GrammarFileParserController() {
  /**
   * Read the grammars located in the grammars NLP folder, store the grammars for caching.
   * Using sync functions because this is a constructor.
   */
  const readGrammars = () => {
    try {
      const fileList = fs.readdirSync(nlpGrammarsDir);
      return fileList.reduce((grammars, fileName) => {
        const grammarContents = fs.readFileSync(
          resolve(nlpGrammarsDir, fileName)
        );
        const grammarName = /^(.*)\.ohm$/.exec(fileName)[1];
        /* eslint-disable global-require */
        /* eslint-disable import/no-dynamic-require */
        const semanticsForGrammar = require(resolve(
          nlpSemanticsDir,
          grammarName
        ));
        /* eslint-enable import/no-dynamic-require */
        /* eslint-enable global-require */
        if (grammarContents && semanticsForGrammar) {
          const grammar = ohm.grammar(grammarContents);
          grammar.semantics = semanticsForGrammar(grammar);
          grammars.push(grammar);
        }
        return grammars;
      }, []);
    } catch (e) {
      throw new Error(__("Failed to read the grammars: %s", e));
    }
  };
  this.grammarsWithSemantics = readGrammars();
  if (!this.grammarsWithSemantics || !this.grammarsWithSemantics.length > 0) {
    throw new Error(__("No grammars were found"));
  }
  const grammarNames = this.grammarsWithSemantics.map(grammar => grammar.name);
  console.log(
    __(
      "Loaded %d grammars: %s",
      this.grammarsWithSemantics.length,
      grammarNames.join(", ")
    )
  );
}

GrammarFileParserController.prototype = {
  constructor: GrammarFileParserController,
  parse(fileName) {
    try {
      if (!fileName) {
        throw new Error(__("You must specify a file for processing"));
      }
      if (!fs.exists(fileName)) {
        throw new Error(__("The file specified was not found: %s", fileName));
      }
      const fileContents = fs.readFileSync(fileName);
      const matchedByGrammars = this.grammarsWithSemantics.reduce(
        (matched, grammar) => {
          const matchedByGrammar = grammar.match(fileContents);
          if (matchedByGrammar.succeeded()) {
            matched.push(grammar.semantics(matchedByGrammar).toSA());
          }
          return matched;
        },
        []
      );
      if (!matchedByGrammars.length) {
        throw new Error(
          __(
            "No grammar matched this input. Tried %d grammars.",
            this.grammarsWithSemantics.length
          )
        );
      } else if (matchedByGrammars.length > 1) {
        console.log(
          __(
            "WARNING: more than one grammar was successfully matched for this input. Using only the first"
          )
        );
      }
      return matchedByGrammars[0];
    } catch (e) {
      throw new Error(
        __(
          "Failed to parse the file using built-in NLP grammars: %s",
          e.message
        )
      );
    }
  }
};

module.exports = GrammarFileParserController;
