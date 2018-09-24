require("dotenv").config(); // load the env vars from .envfile

const program = require("commander");
const promise = require("selenium-webdriver/lib/promise");
const QuestionsController = require("./controllers/QuestionsController");
const GrammarFileParserController = require("./controllers/GrammarFileParserController");
const { ServiceDesk } = require("./classes/ServiceDesk");
const { __ } = require("./controllers/TranslationController");

promise.USE_PROMISE_MANAGER = false; // Disable the WebDriverJS' promise manager

/**
 * Parse a CSV file to extract the tickets to open.
 */
const doCSVProcessing = async () => {
  throw new Error(__("Not implemented yet!"));
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
      __(
        "You are about to open %d tickets, do you wish to continue?",
        data.length
      )
    );
    return canOpenTicket;
  }
  throw new Error(__("Not implemented yet!"));
};

/**
 * Create a new instance of the Service Desk and open the tickets.
 */
const openTickets = async tickets => {
  try {
    const questionsController = new QuestionsController();
    console.log(__("Please provide your CA Service Desk Manager credentials"));
    const {username, password} = await questionsController.askForUserCredentials()

    const desk = new ServiceDesk();
    await desk.logIn(username, password);
    /* eslint-disable no-restricted-syntax */
    /* eslint-disable no-await-in-loop */
    for (const ticketData of tickets) {
      const ticket = await desk.createTicketWindow();
      const ticketNumber = await ticket.getNumber();
      console.log(`Trying to open the ticket ${ticketNumber}`);
      await ticket.setAll(ticketData);
      const nextTicket = await questionsController.askForNextTicket();
      if (!nextTicket) {
        throw new Error("Canceled by user");
      }
      /** @todo: destroy ticket window after save to economize resources */
    }
    /* eslint-enable no-await-in-loop no-restricted-syntax */
    /* eslint-enable no-restricted-syntax  */
    /** @todo logout */
  } catch (e) {
    throw new Error(__("Failed to open tickets! %s", e.message));
  }
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
  const canOpenTicket = await showTicketsSummary(ticketsToOpen);
  if (canOpenTicket) {
    const results = await openTickets(ticketsToOpen);
    await showTicketsSummary(results, true);
  }
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

const defineProgramAndParseArgs = () => {
  program
    .version("1.0.0")
    .option("-C, --csv", __("Open a CSV file for batch processing"))
    .option(
      "-G, --grammar-processing [file]",
      __("Parse the specified file using the built-in grammars")
    )
    .parse(process.argv);
};

(async () => {
  try {
    defineProgramAndParseArgs();
    const { csv, grammarProcessing } = program;
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
})();
