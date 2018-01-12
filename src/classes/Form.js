const Ajv = require('ajv');
const formats = require('ajv/lib/compile/formats')();

function Form(schema, intro = '') {
  this.schema = schema;
  this.intro = intro;
}

/**
 * Based on a JSON Schema property, determine the type of the inquirer prompt.
 */
const _determineType = (property) => {
  if ((typeof(property.type) !== 'string')){
    throw new Error('Compound types not supported yet.')
  } else {
    if (property.enum || property.type === 'boolean') {
      return 'list';
    } else {
      return 'input';
    }
  }
}

/**
 * Get the Ticket's internal type and human name for display in a choice, setting its name and value
 * properties
 */
const _getTicketTypes = (enumArray) => {
  return enumArray; /** @todo implement */
}

const _propertyToQuestion = ( propertyName, property, index, schema ) => {
  try {
    let question = {};
    question.name = propertyName;
    question.default = property.default;
    question.type = _determineType(property);
    question.message = property.title;

    if (property.type === 'boolean') {
      question.choices = [
        {
          name: 'Yes',
          value: true,
        },
        {
          name: 'No',
          value: false,
        }
      ];
    } else {
      question.choices = _getTicketTypes(property.enum);
    }

    question.validate = (input) => {
      // verify if the property value is required
      if (schema.required.includes(propertyName) && !input.length > 0) {
        return false;
      }
      // if this property has a 'format' defined, use Ajv's formats to validate the input
      if (formats.hasOwnProperty(property.format)) {
        return formats[property.format].test(input);
      }
      return true; //retorn true for all other cases
    }
    return question;
  }
  catch (e) {
    throw new Error(`Cannot create a inquirer prompt object for question: ${e}`)
  }
};

Form.prototype = {
  constructor: Form,
  /**
   * Transform a JSON Schema for a ticket type into a Inquirer.js prompt session.
   */
  toInquirerPrompt() {
    return Object.entries(this.schema.properties).map( ( [ propertyName, property ], index ) => {
      return _propertyToQuestion(propertyName, property, index, this.schema);
    });
  },
}

module.exports = Form;