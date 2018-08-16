const { By } = require("selenium-webdriver");

const { __ } = require("../controllers/TranslationController");

const fieldMappings = {
  requester: {
    id: "df_0_1",
    name: null,
    title: null,
    type: "simple"
  },
  affectedUser: {
    id: "df_0_2",
    name: null,
    title: null,
    type: "simple"
  },
  category: {
    id: "df_0_3",
    name: null,
    title: null,
    type: "simple"
  },
  status: {
    id: "df_0_4",
    name: null,
    title: null,
    type: "simple"
  },
  assignee: {
    id: "df_1_1",
    name: null,
    title: null,
    type: "simple"
  },
  group: {
    id: "df_1_2",
    name: null,
    title: null,
    type: "simple"
  },
  summary: {
    id: "df_5_0",
    name: null,
    title: null,
    type: "simple"
  },
  description: {
    id: "df_6_0",
    name: null,
    title: null,
    type: "simple"
  },
  tenant: {
    id: "df_0_0",
    name: null,
    title: null,
    type: "select"
  }
};

function Ticket(desk, window) {
  this.desk = desk; // pointer for the ServiceDesk instance that created this ticket
  this.window = window; // window associated to this ticket
  this.driver = this.desk.driver;
  this.number = null;
}

Ticket.prototype = {
  constructor: Ticket,

  async switchToSelfWindow() {
    try {
      await this.driver.switchTo().window(this.window);
      await this.desk.navigateToFrame("cai_main");
    } catch (e) {
      throw new Error(__("Failed to go to ticket window: %s"), e.message);
    }
  },

  /**
   * Gets the ticket number
   */
  async getNumber() {
    if (this.number) {
      return this.number; // cache
    }
    try {
      await this.switchToSelfWindow();
      const element = await this.desk.getElementVisible(
        By.css("center > div > table > tbody > tr > td > h2")
      );
      const elementText = await element.getText();
      const ticketNumber = /.* ([0-9]+)$/.exec(elementText)[1];
      this.number = ticketNumber;
      return this.number;
    } catch (e) {
      throw new Error(__("Failed to get the ticket number: %s", e.message));
    }
  },
  /**
   * Sets the values in all fields currently supported using the fieldMappings dictionary
   * @param {*} data the values of the fields
   */
  async setAll(data) {
    try {
      await this.switchToSelfWindow();
      /* eslint-disable no-restricted-syntax  */
      /* eslint-disable no-await-in-loop */
      for (const [key, opts] of Object.entries(fieldMappings)) {
        const value = data[key];
        if (value && opts.type === "simple") {
          // currently, only simple values are supported
          await this.desk.setElementValue(opts.id, value);
        }
      }
      /* eslint-enable no-await-in-loop no-restricted-syntax */
      /* eslint-enable no-restricted-syntax  */
    } catch (e) {
      throw new Error(
        __("Failed to set the ticket fields data: %s"),
        e.message
      );
    }
  }
};

module.exports = {
  Ticket,
  fieldMappings
};
