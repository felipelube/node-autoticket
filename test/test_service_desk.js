const assert = require("assert");
const { ServiceDesk } = require("../src/classes/ServiceDesk");
const { username, password } = require("../src/config");



describe('Basic features with visible browser', () => {
  let desk;
  before(() => {
    desk = new ServiceDesk();
  });

  after(() => {
    desk.destroy();
  });

  it('should create a instance of ServiceDesk', (done) => {
    assert(desk instanceof ServiceDesk, 'Not a valid ServiceDesk instance');
    done();
  });

  it('should log in with valid user info', async function() {
    await desk.logIn(username, password);
    assert(desk.userName === username, 'ServiceDesk: got user login that does not match with the used to log in');
  });

  it('should create a new ticket order', async function() {
    if (!desk.loggedIn) {
      await desk.logIn(username, password);
    }
    const ticket = await desk.createTicketWindow();
    const ticketNumber = await ticket.getNumber();
    assert(desk.tickets.length > 0, 'ServiceDesk: ticket list remains the same');
    assert(ticketNumber != null, 'Ticket: could not determinate the ticket number');
  });
});