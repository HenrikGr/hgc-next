
import UIModel from '../UIModel';

/**
 * The JSONSchema to be tested
 */
describe('UIModel', () => {
  const schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    definitions: {
      address: {
        type: 'object',
        properties: {
          city:   {type: 'string'},
          state:  {
            type: 'string',
            options: [
              {label: 'Alabama',  value: 'AL'},
              {label: 'Alaska',   value: 'AK'},
              {label: 'Arkansas', value: 'AR'}
            ]
          },
          street: {type: 'string'}
        },
        required: ['street', 'city', 'state']
      },
      personalData: {
        type: 'object',
        properties: {
          firstName: {$ref: '#/definitions/firstName'},
          lastName:  {$ref: '#/definitions/firstName'}
        },
        required: ['lastName']
      },
      firstName: {type: 'string', default: 'John'},
      lastName: {type: 'string'}
    },
    type: 'object',
    properties: {
      age: {type: 'integer', uniforms: {component: 'span'}, default: 24},
      billingAddress: {$ref: '#/definitions/address'},
      dateOfBirth: {
        type: 'string',
        format: 'date-time'
      },
      dateOfBirthTuple: {
        type: 'array',
        items: [{type: 'integer'}, {type: 'string'}, {type: 'integer'}]
      },
      email: {
        type: 'object',
        properties: {
          work:   {type: 'string'},
          other:  {type: 'string'}
        },
        required: ['work']
      },
      friends: {
        type: 'array',
        items: {
          $ref: '#/definitions/personalData'
        }
      },
      hasAJob: {type: 'boolean'},
      invalid: {type: 'null'},
      personalData: {$ref: '#/definitions/personalData'},
      salary: {
        type: 'number',
        options: {
          low: 6000,
          medium: 12000,
          height: 18000
        }
      },
      shippingAddress: {
        allOf: [
          {$ref: '#/definitions/address'},
          {
            properties: {
              type: {enum: ['residential', 'business']}
            },
            required: ['type']
          }
        ]
      }
    },
    required: ['dateOfBirth']
  };

  const options = {
    allErrors: true,
    useDefaults: true,
    removeAdditional: true
  };

  const bridge = new UIModel(schema, options);

  describe('#getError', () => {
    it('works without error object', () => {
      expect(bridge.getError('firstName')).not.toBeTruthy();
    });

    it('works with invalid error object', () => {
      expect(bridge.getError('firstName', {})).not.toBeTruthy();
      expect(bridge.getError('firstName', {invalid: true})).not.toBeTruthy();
    });

    it('works with correct error object', () => {
      expect(bridge.getError('firstName', {details: [{dataPath: '.firstName'}]}))
        .toEqual({dataPath: '.firstName'});
      expect(bridge.getError('lastName', {details: [{dataPath: '.field'}]})).not.toBeTruthy();
    });
  });

  describe('#getErrorMessage', () => {
    it('works without error object', () => {
      expect(bridge.getErrorMessage('phone')).not.toBeTruthy();
    });

    it('works with invalid error object', () => {
      expect(bridge.getErrorMessage('phone', {})).not.toBeTruthy();
      expect(bridge.getErrorMessage('phone', {invalid: true})).not.toBeTruthy();
    });

    it('works with correct error object', () => {
      expect(bridge.getErrorMessage('email', {
        details: [{
          dataPath: '.email',
          message: 'Zing!'
        }]
      })).toBe('Zing!');

      expect(bridge.getErrorMessage('firstName', {
        details: [{
          dataPath: '.field',
          message: 'Ignore!'
        }]})).not.toBeTruthy();
    });
  });

  describe('#getErrorMessages', () => {
    it('works without error object', () => {
      expect(bridge.getErrorMessages()).toEqual([]);
    });

    it('works with other errors', () => {
      expect(bridge.getErrorMessages('correct')).toEqual(['correct']);
      expect(bridge.getErrorMessages(999999999)).toEqual([999999999]);
    });

    it('works with Error', () => {
      expect(bridge.getErrorMessages(new Error('correct'))).toEqual(['correct']);
    });

    it('works with ValidationExceptionError', () => {
      expect(bridge.getErrorMessages({
        details: [{
          dataPath: '.age',
          message: 'Zing!'
        }]})).toEqual(['Zing!']);

      expect(bridge.getErrorMessages({
        details: [{
          dataPath: '.field',
          message: 'Ignore!'
        }]})).toEqual(['Ignore!']);
    });
  });

  describe('#getField', () => {
    it('returns correct definition (flat)', () => {
      expect(bridge.getField('age')).toEqual({type: 'integer', default: 24, uniforms: {component: 'span'}});
    });

    it('returns correct definition (flat with $ref)', () => {
      expect(bridge.getField('billingAddress')).toEqual({
        properties: expect.objectContaining({
          city: {type: 'string'},
          state: {
            type: 'string',
            options: [
              {label: 'Alabama', value: 'AL'},
              {label: 'Alaska', value: 'AK'},
              {label: 'Arkansas', value: 'AR'}
            ]
          },
          street: {type: 'string'}
        }),
        required: ['street', 'city', 'state'],
        type: 'object'
      });
    });

    it('returns correct definition (nested)', () => {
      expect(bridge.getField('email.work')).toEqual({type: 'string'});
    });

    it('returns correct definition (nested with $ref)', () => {
      expect(bridge.getField('personalData.firstName')).toEqual({default: 'John', type: 'string'});
    });

    it('returns correct definition (array tuple)', () => {
      expect(bridge.getField('dateOfBirthTuple.1')).toEqual({type: 'string'});
    });

    it('returns correct definition (array flat $ref)', () => {
      expect(bridge.getField('friends.$')).toEqual(expect.objectContaining({type: expect.any(String)}));
    });

    it('returns correct definition (array flat $ref, nested property)', () => {
      expect(bridge.getField('friends.$.firstName')).toEqual({default: 'John', type: 'string'});
    });
  });

  describe('#getInitialValue', () => {
    it('works with arrays', () => {
      expect(bridge.getInitialValue('friends')).toEqual([]);
      expect(bridge.getInitialValue('friends', {initialCount: 1})).toEqual([{}]);
      expect(bridge.getInitialValue('friends.0.firstName', {initialCount: 1})).toBe('John');
    });

    it('works with objects', () => {
      expect(bridge.getInitialValue('billingAddress')).toEqual({});
    });

    it('works with undefined primitives', () => {
      expect(bridge.getInitialValue('salary')).toBe(undefined);
    });

    it('works with defined primitives', () => {
      expect(bridge.getInitialValue('age')).toBe(24);
    });

    it('works with default values', () => {
      expect(bridge.getInitialValue('personalData.firstName')).toBe('John');
    });
  });

  describe('#getProps', () => {
    it('works with allowedValues', () => {
      expect(bridge.getProps('shippingAddress.type')).toEqual({
        allowedValues: ['residential', 'business'],
        label: 'Type',
        required: true
      });
    });

    it('works with allowedValues from props', () => {
      expect(bridge.getProps('shippingAddress.type', {allowedValues: [1]})).toEqual({
        allowedValues: [1],
        label: 'Type',
        required: true
      });
    });

    it('works with label (custom)', () => {
      expect(bridge.getProps('dateOfBirth', {label: 'Date of death'})).toEqual({
        label: 'Date of death',
        required: true
      });
    });

    it('works with label (true)', () => {
      expect(bridge.getProps('dateOfBirth', {label: true})).toEqual({
        label: 'Date of birth',
        required: true
      });
    });

    it('works with label (falsy)', () => {
      expect(bridge.getProps('dateOfBirth', {label: null})).toEqual({
        label: '',
        required: true
      });
    });

    it('works with placeholder (custom)', () => {
      expect(bridge.getProps('email.work', {placeholder: 'Work email'})).toEqual({
        allowedValues: undefined,
        label: 'Work',
        options: undefined,
        placeholder: 'Work email',
        required: true
      });
    });

    it('works with placeholder (true)', () => {
      expect(bridge.getProps('email.work', {placeholder: true})).toEqual({
        allowedValues: undefined,
        label: 'Work',
        options: undefined,
        placeholder: 'Work',
        required: true
      });
    });

    it('works with placeholder (falsy)', () => {
      expect(bridge.getProps('email.work', {placeholder: null})).toEqual({
        allowedValues: undefined,
        label: 'Work',
        options: undefined,
        placeholder: null,
        required: true
      });
    });

    it('works with placeholder (label falsy)', () => {
      expect(bridge.getProps('email.work', {label: null, placeholder: true})).toEqual({
        allowedValues: undefined,
        label: '',
        options: undefined,
        placeholder: 'Work',
        required: true
      });

      expect(bridge.getProps('email.work', {label: false, placeholder: true})).toEqual({
        allowedValues: undefined,
        label: '',
        options: undefined,
        placeholder: 'Work',
        required: true
      });
    });

    it('works with Number type', () => {
      expect(bridge.getProps('salary')).toEqual({
        allowedValues: ['low', 'medium', 'height'],
        decimal: true,
        label: 'Salary',
        options: expect.anything(),
        required: false,
        transform: expect.anything()
      });
    });

    it('works with options (array)', () => {
      expect(bridge.getProps('billingAddress.state').transform('AL')).toBe('Alabama');
      expect(bridge.getProps('billingAddress.state').transform('AK')).toBe('Alaska');
      expect(bridge.getProps('billingAddress.state').allowedValues[0]).toBe('AL');
      expect(bridge.getProps('billingAddress.state').allowedValues[1]).toBe('AK');
    });

    it('works with options (object)', () => {
      expect(bridge.getProps('salary').transform('low')).toBe(6000);
      expect(bridge.getProps('salary').transform('medium')).toBe(12000);
      expect(bridge.getProps('salary').allowedValues[0]).toBe('low');
      expect(bridge.getProps('salary').allowedValues[1]).toBe('medium');
    });

    it('works with options from props', () => {
      const props = {options: {minimal: 4000, avarage: 8000}};
      expect(bridge.getProps('salary', props).transform('minimal')).toBe(4000);
      expect(bridge.getProps('salary', props).transform('avarage')).toBe(8000);
      expect(bridge.getProps('salary', props).allowedValues[0]).toBe('minimal');
      expect(bridge.getProps('salary', props).allowedValues[1]).toBe('avarage');
    });

    it('works with other props', () => {
      expect(bridge.getProps('personalData.firstName', {x: 1, y: 1})).toEqual({
        label: 'First name',
        required: false,
        x: 1,
        y: 1
      });
    });
  });

  describe('#getSubFields', () => {
    it('works on top level', () => {
      expect(bridge.getSubFields()).toEqual([
        'age',
        'billingAddress',
        'dateOfBirth',
        'dateOfBirthTuple',
        'email',
        'friends',
        'hasAJob',
        'invalid',
        'personalData',
        'salary',
        'shippingAddress'
      ]);
    });

    it('works with nested types', () => {
      expect(bridge.getSubFields('shippingAddress')).toEqual(['city', 'state', 'street', 'type']);
    });

    it('works with primitives', () => {
      expect(bridge.getSubFields('personalData.firstName')).toEqual([]);
      expect(bridge.getSubFields('age')).toEqual([]);
    });
  });

  describe('#getType', () => {
    it('works with any type', () => {
      expect(bridge.getType('age')).toBe(Number);
      expect(bridge.getType('billingAddress')).toBe(Object);
      expect(bridge.getType('billingAddress.city')).toBe(String);
      expect(bridge.getType('billingAddress.state')).toBe(String);
      expect(bridge.getType('billingAddress.street')).toBe(String);
      expect(bridge.getType('dateOfBirth')).toBe(Date);
      expect(bridge.getType('dateOfBirthTuple')).toBe(Array);
      expect(bridge.getType('email')).toBe(Object);
      expect(bridge.getType('email.work')).toBe(String);
      expect(bridge.getType('email.other')).toBe(String);
      expect(bridge.getType('friends')).toBe(Array);
      expect(bridge.getType('friends.$')).toBe(Object);
      expect(bridge.getType('friends.$.firstName')).toBe(String);
      expect(bridge.getType('friends.$.lastName')).toBe(String);
      expect(bridge.getType('hasAJob')).toBe(Boolean);
      expect(() => bridge.getType('invalid')).toThrow(/can not be represented as a type null/);
      expect(bridge.getType('personalData')).toBe(Object);
      expect(bridge.getType('salary')).toBe(Number);
      expect(bridge.getType('shippingAddress')).toBe(Object);
    });
  });

});