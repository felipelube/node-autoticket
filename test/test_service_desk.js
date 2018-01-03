const assert = require("assert");
const { ServiceDesk } = require("../src/classes/ServiceDesk");
const { username, password } = require("../src/config");



describe('Funcionalidades de ServiceDesk (browser visível)', () => {
  let desk;
  before(() => {
    desk = new ServiceDesk();
  });

  after(() => {
    desk.destroy();
  });

  it('deve criar um sessão de ServiceDesk com browser visível', (done) => {
    assert(desk instanceof ServiceDesk, 'Não é uma instância válida');
    done();
  });

  it('deve logar corretamente usando um usuário e senhas corretos', async function() {
    await desk.logIn(username, password);
    assert(desk.userName === username, 'Login gravado na sessão não bate com o fornecido');
  });
});