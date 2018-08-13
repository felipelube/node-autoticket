require("dotenv").config(); // load the env vars from .envfile

const program = require("commander");
const QuestionsController = require("./controllers/QuestionsController");
const GrammarFileParserController = require("./controllers/GrammarFileParserController");

/**
 * Parse a CSV file to extract the tickets to open.
 */
const doCSVProcessing = async () => {
  throw new Error("Not implemented yet!");
};

/**
 * Show info about the opened tickets or the tickets to open.
 * @param {*} data
 * @param {*} doneProcessing
 */
const showTicketsSummary = async (data, doneProcessing = false) => {
  if (!doneProcessing) {
    const questionsController = new QuestionsController();
    const canOpenTicket = await questionsController.askYesNoQuestion(
      `You are about to open ${data.length} tickets, do you wish to continue?`
    );
    return canOpenTicket;
  }
  throw new Error("Not implemented yet!");
};

/**
 * Create a new instance of the Service Desk and open the tickets.
 */
const openTickets = async () => {
  throw new Error("Not implemented yet!");
};

/**
 * Play the main workflow of the app after getting the tickets to open:
 * 1) show info about the tickets
 * 2) ask for confirmation
 * 3) process the tickets
 * 4) show the results.
 * @param {array} ticketsToOpen
 */
const mainWorkflow = async ticketsToOpen => {
  await showTicketsSummary(ticketsToOpen);
  const results = await openTickets(ticketsToOpen);
  await showTicketsSummary(results, true);
  throw new Error("Not implemented yet!");
};

/**
 * Create new tickets based on a questions and answers interface via the console.
 */
const getTicketsFromInteractiveConsole = async () => {
  let canOpenTicket = true;
  const questionsController = new QuestionsController();
  const ticketsToOpen = [];
  /* eslint-disable no-await-in-loop */
  while (canOpenTicket) {
    const ticketType = Object.values(
      await questionsController.askForTicketType()
    )[0];
    const ticketData = await questionsController.askForTicketData(ticketType);
    ticketsToOpen.push({
      type: ticketType,
      data: ticketData
    });
    canOpenTicket = await questionsController.askForAnotherTicket();
  }
  /* eslint-enable */
  return ticketsToOpen;
};

/**
 * Use the built-in grammars to try to parse the specified file name and extract new tickets to open
 * @param {string} fileName
 */
const getTicketsFromFileUsingNLPProcessing = async fileName => {
  const grammarProcessingController = new GrammarFileParserController();
  const ticketsToOpen = grammarProcessingController.parse(fileName);
  return ticketsToOpen;
};

/**
 * @todo more thread-safe use of the driver
 */
program
  .version("1.0.0")
  .option("-C, --csv", "Open a CSV file for batch processing")
  .option(
    "-G, --grammar-processing [file]",
    "Parse the specified file using the built-in grammars"
  )
  .parse(process.argv);

(async ({ csv, grammarProcessing }) => {
  try {
    if (csv) {
      const ticketsToOpen = await doCSVProcessing();
      await mainWorkflow(ticketsToOpen);
    } else if (grammarProcessing) {
      const ticketsToOpen = await getTicketsFromFileUsingNLPProcessing(
        grammarProcessing
      );
      await mainWorkflow(ticketsToOpen);
    } else {
      const ticketsToOpen = await getTicketsFromInteractiveConsole();
      await mainWorkflow(ticketsToOpen);
    }
  } catch (e) {
    console.error(e.message);
  }
})(program);
