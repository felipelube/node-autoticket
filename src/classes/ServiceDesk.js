const webdriver = require("selenium-webdriver");

const { By, until } = webdriver;
const { Ticket } = require("./Ticket");
const { SERVICE_DESK_URL } = require("../config");

const TIMEOUT = 10 * 1000;

/**
 * Construtor para a 'classe' ServiceDesk
 * @param {Boolean} visible se a sessão deve ser criada num navegador visível
 */
function ServiceDesk(visible = true) {
  this.visible = visible; // sessão num navegador vísivel para o usuário
  this.loggedIn = false; // usuário está logado?

  this.realUserName = ""; // nome completo do usuário
  this.userName = ""; // login do usuário

  this.windowHandles = []; // janelas criadas nesta sessão
  this.tickets = []; // tickets criados nesta sessão

  if (this.visible) {
    // se for visível, use o Internet Explorer
    this.driver = new webdriver.Builder()
      .withCapabilities({
        setEnableNativeEvents: false
      })
      .forBrowser("ie")
      .build();
  } else {
    // invisível, PhantomJS
    this.driver = new webdriver.Builder().forBrowser("phantomjs").build();
  }
}

/**
 * Protótipo para a classe ServiceDesk, definida na forma antiga.
 */
ServiceDesk.prototype = {
  constructor: ServiceDesk, // construtor acima

  /**
   * Termina a sessão com o navegador e destrói o driver.
   */
  async destroy() {
    await this.driver.quit();
    this.driver = null;
  },
  /**
   * Função de conveniência para localizar e clicar num elemento de acordo com o localizador passado
   * @param {any} locator o localizador do elemento
   */
  async elementClick(locator) {
    try {
      const el = await this.driver.findElement(locator);
      await el.click();
    } catch (e) {
      throw new Error(`Falha ao tentar clicar em elemento: ${e.message}`);
    }
  },
  /**
   * Espera um elemento ser defindo e renderizado na página para retorná-lo.
   * @param {any} locator o localizador do elemento
   */
  async getElementVisible(locator) {
    try {
      await this.driver.wait(until.elementLocated(locator), TIMEOUT);
      const whatElement = await this.driver.wait(
        this.driver.findElement(locator)
      );
      await this.driver.wait(until.elementIsVisible(whatElement), TIMEOUT);
      return whatElement;
    } catch (e) {
      throw new Error(`Falha ao tentar pegar o elemento: ${e.message}`);
    }
  },

  /**
   * Função de conveniência para navegar para um frame pelo atributo nome
   * @param {any} locator o localizador do elemento
   */
  async navigateToFrame(frameName, awaitVisible = true) {
    try {
      if (awaitVisible) {
        await this.getElementVisible(By.name(frameName));
      }
      await this.driver.wait(
        until.ableToSwitchToFrame(By.name(frameName)),
        TIMEOUT
      );
    } catch (e) {
      throw new Error(`Falha ao tentar navegar para o frame: ${frameName}`);
    }
  },
  /**
   * Atualiza a lista interna de handles de janela criadas nesta seção
   */
  async updateWindowHandles() {
    this.windowHandles = await this.driver.getAllWindowHandles();
  },
  /**
   * Loga o usuário no CA Service Desk
   * @todo validar dados de entrada, detectar condições de erro e usar melhor lógica que timeout
   * para saber se a página carregou.
   * @param {String} username nome de usuário
   * @param {String} password senha
   */
  async logIn(username, password) {
    try {
      await this.driver.get(SERVICE_DESK_URL); // navegue até a URL do sistema
      await this.driver.findElement(By.id("USERNAME")).sendKeys(username); // envie o nome de usuário
      await this.driver.findElement(By.id("PIN")).sendKeys(password); // envie a senha
      await this.elementClick(By.id("imgBtn0")); // clique no botão para entrar

      await this.navigateToFrame("welcome_banner");
      const welcomeBannerLink = await this.getElementVisible(
        By.css("td.welcome_banner_login_info > span.welcomebannerlink")
      );
      const userFullName = await welcomeBannerLink.getAttribute("title"); // extraia o nome completo do usuário
      // atualize a lista de janelas com esta principal
      await this.updateWindowHandles();
      // atualize os atributos
      this.realUserName = userFullName;
      this.userName = username;
      this.loggedIn = true;
    } catch (e) {
      throw new Error(`Falha ao tentar logar no sistema: ${e.message}`);
    }
  },
  /**
   * Cria uma janela de Solicitação de Atendimento
   */
  async createTicketWindow() {
    try {
      await this.driver.switchTo().window(this.windowHandles[0]); // vá para a janela principal
      await this.driver.switchTo().defaultContent(); // vá para o topo dos frames

      await this.navigateToFrame("toolbar"); // vá para o frame toolbar

      await this.elementClick(By.id("tabhref0")); // vá para a aba Service Desk

      await this.driver.switchTo().defaultContent(); // volte ao topo dos frames

      // navegue até o frame da barra de menus
      await this.navigateToFrame("product");
      await this.navigateToFrame("tab_2000");
      await this.navigateToFrame("menubar");

      // pegue a quantidade de janelas antes de criar uma nova, para comparação
      const handlesCount = this.windowHandles.length;

      // clique no link de atalho para 'nova solicitação'
      await this.elementClick(By.id("toolbar_1"));

      // aguarde a nova janela ser criada... @todo colocar timeout máximo
      /* eslint-disable no-await-in-loop */
      while (handlesCount === this.windowHandles.length) {
        await this.driver.sleep(100);
        await this.updateWindowHandles(); // atualize a lista de janelas
      }
      /* eslint-enable no-await-in-loop */

      // pegue o handle da janela de nova solicitação
      const newTicketWindowHandle = this.windowHandles[
        this.windowHandles.length - 1
      ];
      const newTicket = new Ticket(this, newTicketWindowHandle);
      // insira o novo ticket na lista de tickets
      this.tickets.push(newTicket);
      return newTicket;
    } catch (e) {
      throw new Error(
        `Falha ao tentar criar uma Janela de Solicitação: ${e.message}`
      );
    }
  },
  /**
   * Dado o índice do ticket no vetor de tickets, navega para a janela associada a ele.
   * @param {Number} ticketIndex o índice do ticket no vetor de tickets
   */
  async navigateToTicket(ticketIndex = 0) {
    try {
      await this.driver.switchTo().window(this.tickets[ticketIndex].window);
      return this.tickets[ticketIndex];
    } catch (e) {
      throw new Error(
        `Falha ao navegar para ticket com índice ${ticketIndex}: ${e.message}`
      );
    }
  },

  async setElementValue(id, value) {
    try {
      const script = `document.getElementById('${id}').setAttribute('value', '${value}');`;
      await this.driver.wait(this.driver.executeScript(script), TIMEOUT);
    } catch (e) {
      throw new Error(
        `Falha ao tentar definir o valor do elemento ${id}: ${e.message}`
      );
    }
  },
  async getElementValue(locator) {
    try {
      const el = await this.getElementVisible(locator);
      return await el.getAttribute("value");
    } catch (e) {
      throw new Error(
        `Falha ao tentar obter o valor do elemento: ${e.message}`
      );
    }
  }
};

module.exports = {
  ServiceDesk
};
