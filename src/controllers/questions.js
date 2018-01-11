const fs = require("fs-extra");
const Form = require('../classes/Form');
const ticketTypeSchema = require('../schemas/questions/saType.json');
const inquirer = require("inquirer");

function QuestionsController() {
  /**
   * Read the schemas located in the schemas folder for tickets, store the schemas for caching.
   * Using sync functions because this is a constructor.
   */
  const readTicketSchemas = () => {
    try {
      const ticketSchemas = [];
      const questionsDir = './src/schemas/tickets';
      const fileList = fs.readdirSync(questionsDir);
      for (fileName of fileList) { /** Array.reduce */
        const schema = fs.readJSONSync(`${questionsDir}/${fileName}`);
        const ticketType = /.*\/(.*)\.json$/.exec(schema['$id'])[1];

        const schemaEntry = {
          name: schema.title,
          value: ticketType,
          schema,
        }
        ticketSchemas.push(schemaEntry);
      }
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
  getTicketType() {
    return inquirer.prompt({
      name: 'ticketTypeQuestion',
      type: 'list',
      choices: this.ticketSchemas,
      message: "Qual SA você quer abrir agora?",
    });
  },
  /**
   * Based on a ticket type, prompt the user the questions to get a ticket information.
   */
  async getTicketData(ticketType) {
    const ticketSchema = this.ticketSchemas.find(schema => schema.value === ticketType).schema;
    return inquirer.prompt(new Form(ticketSchema).toInquirerPrompt());
  }
};

module.exports = QuestionsController;