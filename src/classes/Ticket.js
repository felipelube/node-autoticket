const By = require('selenium-webdriver').By;

const fieldMappings = {
  requester: {
    id: 'df_0_1',
    name: null,
    title: null,
    type: 'simple',
  },
  affectedUser: {
    id: 'df_0_2',
    name: null,
    title: null,
    type: 'simple',
  },
  category: {
    id: 'df_0_3',
    name: null,
    title: null,
    type: 'simple',
  },
  status: {
    id: 'df_0_4',
    name: null,
    title: null,
    type: 'simple',
  },
  assignee: {
    id: 'df_1_1',
    name: null,
    title: null,
    type: 'simple',
  },
  group: {
    id: 'df_1_2',
    name: null,
    title: null,
    type: 'simple',
  },
  summary: {
    id: 'df_5_0',
    name: null,
    title: null,
    type: 'simple',
  },
  description: {
    id: 'df_6_0',
    name: null,
    title: null,
    type: 'simple',
  },
}

function Ticket(desk, window) {
  this.desk = desk; // ponteiro para a sessão que criou este ticket
  this.window = window; // janela associada a este ticket
  this.driver = this.desk.driver; // atalho para conveniência
  this.number = null;
}

Ticket.prototype = {
  constructor: Ticket,

  async switchToSelfWindow() {
    try {
      await this.driver.switchTo().window(this.window);
      await this.desk.navigateToFrame('cai_main');
    } catch (e) {
      throw new Error(`Falha ao tentar ir para a janela da SA: ${e.message}`)
    }
  },

  /**
   * Vai para a janela que está associada a este ticket e pega o número dele
   */
  async getNumber() {
    if (this.number) {
      return this.number; // cache
    }
    try {
      await this.switchToSelfWindow();
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
  },
  async setAll(data) {
    try {
      await this.switchToSelfWindow();
      for(let [key, opts] of Object.entries(fieldMappings)) {
        const value = data[key];
        if (value && opts.type === 'simple') {
          await this.desk.setElementValue( opts.id , value);
        }
      }
    } catch (e) {
      throw new Error(`Falha ao tentar definir os campos da SA: ${e.message}`)
    }
  }
}

module.exports = {
  Ticket,
  fieldMappings,
};
