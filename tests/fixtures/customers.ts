export const newCustomerModel = () => ({
  type: 'object',
  required: [ 'email', 'full_name' ],
  properties: {
    email: {
      type: 'string',
      nullable: false,
    },
    full_name: {
      type: 'string',
      nullable: false,
    },
  },
});

export const newCustomer = () => ({
  email: 'customer@example.com',
  full_name: 'John Smith',
});
