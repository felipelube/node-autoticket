const { ServiceDesk } = require('./classes/ServiceDesk');
const { username, password } = require("./config/secrets");

/**
 * @todo mover para testes
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
