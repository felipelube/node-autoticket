const { ServiceDesk } = require('./classes/ServiceDesk');
const { username, password } = require("./config");

/**
 * @todo move to tests
 * @todo more thread-safe use of the driver
 */
(async () => {
  let desk;
  try {
    desk = new ServiceDesk(); // crie uma nova sessão
    await desk.logIn(username, password); // faça log in
    await desk.createTicketWindow(); // crie uma nova janela de Ticket
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
