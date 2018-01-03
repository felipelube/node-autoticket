const By = require('selenium-webdriver').By;

function Ticket(desk, window) {
  this.desk = desk; // ponteiro para a sessão que criou este ticket
  this.window = window; // janela associada a este ticket
  this.driver = this.desk.driver; // atalho para conveniência
  this.number = null;
}

Ticket.prototype = {
  constructor: Ticket,

  /**
   * Vai para a janela que está associada a este ticket e pega o número dele
   */
  async getNumber() {
    if (this.number) {
      return this.number; // cache
    }
    try {
      await this.driver.switchTo().window(this.window);
      await this.desk.navigateToFrame('cai_main');
      const element = await this.desk.getElementVisible(
        By.css('center > div > table > tbody > tr > td > h2')
      );
      const elementText = await element.getText();
      const ticketNumber = /.* ([0-9]+)$/.exec(elementText)[1];
      this.number = ticketNumber;
      return this.number;
    } catch (e) {
      throw new Error(`Falha ao tentar pegar o número do Ticket: ${e.message}`)
    }
  }
}

module.exports = {
  Ticket,
};
