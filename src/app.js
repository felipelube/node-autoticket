const { ServiceDesk } = require('./classes/ServiceDesk');
const { username, password } = require("./config");
const QuestionsController = require('./controllers/QuestionsController');

const program = require("commander");
const inquirer = require("inquirer");

/**
 * @todo more thread-safe use of the driver
 */
program
  .version('1.0.0')
  .option('-C, --csv', 'Open a CSV file for batch processing')
  .parse(process.argv);

const doCSVProcessing = async () => {
  throw new Error('Not implemented yet!');
};

(async (csv = false) => {
  let desk;
  try {
    if (csv) {
      const ticketsToOpen = await doCSVProcessing();
      await showTicketsSummary(ticketsToOpen);
      const results = await processTickets();
    } else {
      let canOpenTicket = true;
      const questionsController = new QuestionsController();
      while (canOpenTicket) {
        const ticketType = Object.values(await questionsController.askForTicketType())[0];
        const ticketData = await questionsController.askForTicketData(ticketType);
        canOpenTicket = await questionsController.askForAnotherTicket();
      }
    }
  }
  catch(e) {
    console.error(e);
  }
  finally {
    if (desk) {
      desk.destroy();
    }
  }
})();
