const fs = require("fs-extra");
const inquirer = require("inquirer");
const { resolve } = require("path");
const { __ } = require("./TranslationController");
const Form = require("../classes/Form");
const { ticketSchemasDir } = require("../config");

function QuestionsController() {
  /**
   * Read the schemas located in the schemas folder for tickets, store the schemas for caching.
   * Using sync functions because this is a constructor.
   */
  const readTicketSchemas = () => {
    try {
      const fileList = fs.readdirSync(ticketSchemasDir);
      const ticketSchemas = fileList.map(fileName => {
        const schema = fs.readJSONSync(resolve(ticketSchemasDir, fileName));
        const ticketType = /.*\/(.*)\.json$/.exec(schema.$id)[1];

        const schemaEntry = {
          name: schema.title,
          value: ticketType,
          schema
        };
        return schemaEntry;
      });
      return ticketSchemas;
    } catch (e) {
      throw new Error(__("Failed to read the schemas: %s", e));
    }
  };
  this.ticketSchemas = readTicketSchemas();
}

QuestionsController.prototype = {
  constructor: QuestionsController,
  /**
   * Prompt the user which ticket type to open.
   */
  askForTicketType() {
    return inquirer.prompt({
      name: "ticketTypeQuestion",
      type: "list",
      choices: this.ticketSchemas,
      message: __("Which ticket type do you want to open now?")
    });
  },
  /**
   * Convenient function for yes or no questions.
   */
  askYesNoQuestion(question, questionName = "yesNoQuestion") {
    return inquirer
      .prompt({
        name: questionName,
        type: "list",
        choices: [
          {
            name: __("Yes"),
            value: true
          },
          {
            name: __("No"),
            value: false
          }
        ],
        message: question
      })
      .then(answer => answer[questionName]);
  },
  /**
   * Prompt the user which ticket type to open.
   */
  askForAnotherTicket() {
    return this.askYesNoQuestion(
      __("Do you want to add another ticket?"),
      "anotherTicketQuestion"
    );
  },
  /**
   * Based on a ticket type, prompt the user the questions for ticket information.
   */
  async askForTicketData(ticketType) {
    const ticketSchema = this.ticketSchemas.find(
      schema => schema.value === ticketType
    ).schema;
    return inquirer.prompt(new Form(ticketSchema).toInquirerPrompt());
  },
  /**
   *
   */
  async askForUserCredentials() {
    const { username } = await inquirer.prompt({
      name: "username",
      type: "input",
      message: __("username:")
    });
    const { password } = await inquirer.prompt({
      name: "password",
      type: "password",
      message: __("Password:")
    });

    return {
      username,
      password
    };
  }
};

module.exports = QuestionsController;
