require("dotenv").config(); // load the env vars from .envfile

const program = require("commander");
const QuestionsController = require('./controllers/QuestionsController');


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

const showTicketsSummary = async () => {
  throw new Error('Not implemented yet!');
};

const showProcessingSummary = async () => {
  throw new Error('Not implemented yet!');
}

const processTickets = async () => {
  throw new Error('Not implemented yet!');
}

(async (csv = false) => {
  let desk;
  try {
    const tickets = [];
    if (csv) {
      const ticketsToOpen = await doCSVProcessing();
      await showTicketsSummary(ticketsToOpen);
      const results = await processTickets(ticketsToOpen);
      await showProcessingSummary(results);
    } else {
      let canOpenTicket = true;
      const questionsController = new QuestionsController();
      /* eslint-disable no-await-in-loop */
      while (canOpenTicket) {
        const ticketType = Object.values(await questionsController.askForTicketType())[0];
        const ticketData = await questionsController.askForTicketData(ticketType);
        tickets.push({
          type: ticketType,
          data: ticketData,
        });
        canOpenTicket = await questionsController.askForAnotherTicket();
      }
      /* eslint-enable no-await-in-loop */
    }
  } catch (e) {
    console.error(e); // eslint-disable-line no-console
  } finally {
    if (desk) {
      desk.destroy();
    }
  }
})();