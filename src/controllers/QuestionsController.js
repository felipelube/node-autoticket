const fs = require("fs-extra");
const inquirer = require("inquirer");
const {
  resolve
} = require("path");
const Form = require('../classes/Form');
const {
  ticketSchemasDir
} = require("../config");

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
          schema,
        }
        return schemaEntry;
      });
      return ticketSchemas;
    } catch (e) {
      throw new Error(`Failed to read the schemas: ${e}`);
    }
  }
  this.ticketSchemas = readTicketSchemas();
}

QuestionsController.prototype = {
  constructor: QuestionsController,
  /**
   * Prompt the user wich ticket type to open.
   */
  askForTicketType() {
    return inquirer.prompt({
      name: 'ticketTypeQuestion',
      type: 'list',
      choices: this.ticketSchemas,
      message: "Qual SA você quer abrir agora?",
    });
  },
  askForAnotherTicket() {
    return inquirer.prompt({
      name: 'anotherTicketQuestion',
      type: 'list',
      choices: [{
          name: 'Yes',
          value: true,
        },
        {
          name: 'No',
          value: false,
        }
      ],
      message: 'Deseja adicionar mais uma SA?'
    })
  },
  /**
   * Based on a ticket type, prompt the user the questions for ticket information.
   */
  async askForTicketData(ticketType) {
    const ticketSchema = this.ticketSchemas.find(schema => schema.value === ticketType).schema;
    return inquirer.prompt(new Form(ticketSchema).toInquirerPrompt());
  }
};

module.exports = QuestionsController;