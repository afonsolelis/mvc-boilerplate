const userFixtures = {
  validUsers: [
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'John Doe',
      email: 'john.doe@example.com'
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Jane Smith', 
      email: 'jane.smith@example.com'
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174002',
      name: 'Bob Wilson',
      email: 'bob.wilson@example.com'
    }
  ],

  validUUIDs: {
    valid: '123e4567-e89b-12d3-a456-426614174000',
    another: '123e4567-e89b-12d3-a456-426614174001',
    nonExistent: '999e4567-e89b-12d3-a456-426614174999'
  },

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