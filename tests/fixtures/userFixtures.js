const userFixtures = {
  validUsers: [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com'
    },
    {
      id: 2,
      name: 'Jane Smith', 
      email: 'jane.smith@example.com'
    },
    {
      id: 3,
      name: 'Bob Wilson',
      email: 'bob.wilson@example.com'
    }
  ],

  newUser: {
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com'
  },

  updatedUser: {
    name: 'John Doe Updated',
    email: 'john.doe.updated@example.com'
  },

  invalidUsers: {
    missingName: {
      email: 'test@example.com'
    },
    missingEmail: {
      name: 'Test User'
    },
    invalidEmail: {
      name: 'Test User',
      email: 'invalid-email'
    },
    shortName: {
      name: 'J',
      email: 'j@example.com'
    },
    longName: {
      name: 'A'.repeat(101),
      email: 'long@example.com'
    }
  },

  duplicateEmail: {
    name: 'Duplicate User',
    email: 'john.doe@example.com'
  }
};

module.exports = userFixtures;