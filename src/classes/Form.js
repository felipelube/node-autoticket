const formats = require("ajv/lib/compile/formats")();
const { __ } = require("../controllers/TranslationController");

function Form(schema, intro = "") {
  this.schema = schema;
  this.intro = intro;
}

/**
 * Based on a JSON Schema property, determine the type of the inquirer prompt.
 */
const determineType = property => {
  if (typeof property.type !== "string") {
    throw new Error(__("Compound types not supported yet."));
  } else {
    if (property.enum || property.type === "boolean") {
      return "list";
    }
    return "input";
  }
};

/**
 * Get the Ticket's internal type and human name for display in a choice, setting its name and value
 * properties
 */
const getTicketTypes = enumArray => enumArray; /** @todo implement */

const propertyToQuestion = (propertyName, property, index, schema) => {
  try {
    const question = {};
    question.name = propertyName;
    question.default = property.default;
    question.type = determineType(property);
    question.message = property.title;

    if (property.type === "boolean") {
      question.choices = [
        {
          name: __("Yes"),
          value: true
        },
        {
          name: __("No"),
          value: false
        }
      ];
    } else {
      question.choices = getTicketTypes(property.enum);
    }

    question.validate = input => {
      // verify if the property value is required
      if (schema.required.includes(propertyName) && !input.length > 0) {
        return false;
      }
      // if this property has a 'format' defined, use Ajv's formats to validate the input
      if (Object.prototype.hasOwnProperty.call(formats, property.format)) {
        return formats[property.format].test(input);
      }
      return true; // return true for all other cases
    };
    return question;
  } catch (e) {
    throw new Error(
      __("Cannot create a inquirer prompt object for question: %s", e)
    );
  }
};

Form.prototype = {
  constructor: Form,
  /**
   * Transform a JSON Schema for a ticket type into a Inquirer.js prompt object.
   */
  toInquirerPrompt() {
    return Object.entries(this.schema.properties).map(
      ([propertyName, property], index) =>
        propertyToQuestion(propertyName, property, index, this.schema)
    );
  }
};

module.exports = Form;
