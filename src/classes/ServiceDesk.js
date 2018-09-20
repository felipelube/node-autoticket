const webdriver = require("selenium-webdriver");
const { __ } = require("../controllers/TranslationController");

const { By, Key, until } = webdriver;
const { Ticket } = require("./Ticket");
const { SERVICE_DESK_URL } = require("../config");

const TIMEOUT = 10 * 1000;

/**
 * ServiceDesk class constructor
 * @param {Boolean} the browser to use, IE for visible sessions, phantomJS otherwise
 */
function ServiceDesk(visible = true) {
  this.visible = visible;
  this.loggedIn = false;

  this.realUserName = ""; // the complete name of the user
  this.userName = "";

  this.windowHandles = []; // windows created in this instance (session)
  this.tickets = [];

  if (this.visible) {
    this.driver = new webdriver.Builder()
      .withCapabilities({
        unexpectedAlertBehaviour: "accept",
        enablePersistentHover: true,
        ignoreZoomSetting: true,
        acceptSslCerts: true,
        ignoreProtectedModeSettings: true,
        ensureCleanSession: true
      })
      .forBrowser("ie")
      .build();
  } else {
    this.driver = new webdriver.Builder().forBrowser("phantomjs").build();
  }
}

ServiceDesk.prototype = {
  constructor: ServiceDesk,

  /**
   * Finishes the session and destroys the driver object
   */
  async destroy() {
    await this.driver.quit();
    this.driver = null;
  },
  /**
   * Convenient function to locate and click on a element based on the locator param
   * @param {By|Function} locator
   */
  async elementClick(locator) {
    try {
      const el = await this.driver.findElement(locator);
      await el.click();
    } catch (e) {
      throw new Error(
        __("Failed to locate and click on a element: %s", e.message)
      );
    }
  },
  /**
   * Awaits an element to be defined an rendered in the page to return it.
   * @param {By|Function} locator
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
      throw new Error(__("Failed to get an element: %s", e.message));
    }
  },

  /**
   * Finds and navigates to a specified frame by its name
   * @param {By|Function} locator
   * @param {Boolean} awaitVisible awaits the frame become visible (render) to perform the navigation
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
      throw new Error(__("Failed to navigate to a frame: %s", frameName));
    }
  },
  /**
   * Updates the internal list of window handles by getting this info from the underlying driver
   */
  async updateWindowHandles() {
    this.windowHandles = await this.driver.getAllWindowHandles();
  },
  /**
   * Log in a user into CA Service Desk
   * @todo validate the input data
   * @todo detect error conditions
   * @todo use better logic than a simple timeout to determine if the main page was loaded
   * @param {String} username
   * @param {String} password
   */
  async logIn(username, password) {
    try {
      await this.driver.get(SERVICE_DESK_URL); // go to the main URL
      await this.driver.findElement(By.id("USERNAME")).sendKeys(username); // send username
      await this.driver.findElement(By.id("PIN")).sendKeys(password, Key.ENTER); // send password and ENTER

      await this.driver.wait(until.titleContains("Anúncios"));

      await this.navigateToFrame("welcome_banner");
      const welcomeBannerLink = await this.getElementVisible(
        By.css("td.welcome_banner_login_info > span.welcomebannerlink")
      ); // await the banner with user info become visible
      const userFullName = await welcomeBannerLink.getAttribute("title"); // extract user info
      await this.updateWindowHandles(); // update the internal windows list with this new window
      /** update the internal user info */
      this.realUserName = userFullName;
      this.userName = username;
      this.loggedIn = true;
    } catch (e) {
      throw new Error(__("Failed to log in: %s", e.message));
    }
  },
  /**
   * Creates a ticket window
   */
  async createTicketWindow() {
    try {
      await this.driver.switchTo().window(this.windowHandles[0]); // go to the main window
      await this.driver.switchTo().defaultContent(); // go to the upper frame

      await this.navigateToFrame("toolbar"); // go to the toolbar frame

      await this.elementClick(By.id("tabhref0")); // go to the 'Service Desk' tab

      await this.driver.switchTo().defaultContent(); // go to the upper frame

      // go to the menu frame
      await this.navigateToFrame("product");
      await this.navigateToFrame("tab_2000");
      await this.navigateToFrame("menubar");

      // get the actual number of windows for comparison later
      const handlesCount = this.windowHandles.length;

      // click at the 'new ticket' shortcut
      await this.elementClick(By.id("toolbar_1"));

      /** await the new window be visible @todo use a maximum timeout */
      /* eslint-disable no-await-in-loop */
      while (handlesCount === this.windowHandles.length) {
        await this.driver.sleep(100);
        await this.updateWindowHandles(); // update the internal windows list
      }
      /* eslint-enable no-await-in-loop */

      // get the handle of the last window that we just created
      const newTicketWindowHandle = this.windowHandles[
        this.windowHandles.length - 1
      ];
      // create a new Ticket object
      const newTicket = new Ticket(this, newTicketWindowHandle);
      // push it to the internal ticket list
      this.tickets.push(newTicket);
      return newTicket;
    } catch (e) {
      throw new Error(
        __("Failed to create a new ticket window: %s", e.message)
      );
    }
  },
  /**
   * According to a ticket index, navigates to its window.
   * @param {Number} ticketIndex
   */
  async navigateToTicket(ticketIndex = 0) {
    try {
      await this.driver.switchTo().window(this.tickets[ticketIndex].window);
      return this.tickets[ticketIndex];
    } catch (e) {
      throw new Error(
        __("Failed to navigate to ticket %d: %s", ticketIndex, e.message)
      );
    }
  },
  /**
   * Sets the value of a input element
   * @param {String} id
   * @param {String} value
   */
  async setElementValue(id, value) {
    try {
      const fieldValue = value.split("\n").join(" "); // replace line breaks with spaces
      const script = `document.getElementById('${id}').setAttribute('value', '${fieldValue}');`;
      await this.driver.wait(this.driver.executeScript(script), TIMEOUT);
    } catch (e) {
      throw new Error(
        __("Failed to set the value of the element %s: %s", id, e.message)
      );
    }
  },

  async setElementInnerHTMLValue(id, value) {
    try {
      const script = `document.getElementById('${id}').innerHTML = '${JSON.stringify(
        value
      )}';`;
      await this.driver.wait(this.driver.executeScript(script), TIMEOUT);
    } catch (e) {
      throw new Error(
        __("Failed to set the value of the element %s: %s", id, e.message)
      );
    }
  },
  /**
   * Gets the value of a input element
   * @param {By|Function} locator
   */
  async getElementValue(locator) {
    try {
      const el = await this.getElementVisible(locator);
      return await el.getAttribute("value");
    } catch (e) {
      throw new Error(
        __("Failed to set the value of a element: %s", e.message)
      );
    }
  }
};

module.exports = {
  ServiceDesk
};