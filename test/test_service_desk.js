require("dotenv").config();
const assert = require("assert");
const { describe, it, before, after } = require("mocha");
const { By } = require("selenium-webdriver");
const { ServiceDesk } = require("../src/classes/ServiceDesk");
const { fieldMappings } = require("../src/classes/Ticket");
const { username, password } = require("../src/config");

const testDataForTicket = {
  requester: "John Doe",
  affectedUser: "Jane Doe",
  category: "IT.Recovery.Reset PC",
  assignee: "Paul Doe",
  summary: "This is a test",
  description: `Only tests 
  smells like this.`
};

describe("Basic features with visible browser", () => {
  let desk;
  let ticket;
  before(() => {
    desk = new ServiceDesk();
  });

  after(() => {
    desk.destroy();
  });

  it("should create a instance of ServiceDesk", done => {
    assert(desk instanceof ServiceDesk, "Not a valid ServiceDesk instance");
    done();
  });

  it("should log in with valid user info", async () => {
    await desk.logIn(username, password);
    assert(
      desk.userName === username,
      "ServiceDesk: got user login that does not match with the used to log in"
    );
  });

  it("should create a new ticket order", async () => {
    if (!desk.loggedIn) {
      await desk.logIn(username, password);
    }
    ticket = await desk.createTicketWindow();
    const ticketNumber = await ticket.getNumber();
    assert(
      desk.tickets.length > 0,
      "ServiceDesk: ticket list remains the same"
    );
    assert(
      ticketNumber != null,
      "Ticket: could not determinate the ticket number"
    );
  });

  it("should populate SA fields according to data object", async () => {
    if (!desk.loggedIn) {
      await desk.logIn(username, password);
    }
    if (!ticket) {
      ticket = await desk.createTicketWindow(); /** @var Ticket */
    }
    await ticket.setAll(testDataForTicket);
    /* eslint-disable no-restricted-syntax  */
    /* eslint-disable no-await-in-loop */
    for (const [key, opts] of Object.entries(fieldMappings)) {
      const value = testDataForTicket[key];
      if (value && opts.type === "simple") {
        const verifiedValue = await desk.getElementValue(By.id(opts.id));
        assert(
          value === verifiedValue,
          `Value of HTML field for ${key} does not match expected value '${value}'`
        );
      }
    }
    /* eslint-enable no-await-in-loop no-restricted-syntax */
    /* eslint-enable no-restricted-syntax  */
  });
});
