const { resolve } = require("path");
const locale = require("os-locale").sync();
const i18n = require("i18n");

function TranslationController() {
  i18n.configure({
    directory: resolve(__dirname, "../", "locales"),
    defaultLocale: locale
  });
  this.__ = i18n.__; // eslint-disable-line no-underscore-dangle
}

TranslationController.prototype = {
  constructor: TranslationController
};

module.exports = new TranslationController();
