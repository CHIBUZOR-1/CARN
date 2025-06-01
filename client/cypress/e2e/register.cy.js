describe('Register Page', () => {
   before(() => {
    // Give Vite some time to finish booting if needed
    cy.wait(4000); // wait 2 seconds
  });
  beforeEach(() => {
    cy.visit('/register');
  });

  it('should show warning for empty fields', () => {
    cy.contains('button', 'Register').click();
    cy.contains('All fields Required').should('exist');
  });

  it('should show warning for password mismatch', () => {
    cy.get('input[name=name]').type('Cyndy');
    cy.get('input[name=email]').type('cyndy@example.com');
    cy.get('input[name=password]').type('Password1/');
    cy.get('input[name=confirm]').type('Different1/');
    cy.contains('button', 'Register').click();
    cy.contains('Password mismatch').should('exist');
  });

  it('should show warning for invalid password format', () => {
    cy.get('input[name=name]').type('Cyndy');
    cy.get('input[name=email]').type('cyndy@example.com');
    cy.get('input[name=password]').type('password1'); // no uppercase or special
    cy.get('input[name=confirm]').type('password1');
    cy.contains('button', 'Register').click();
    cy.contains('Use correct password format').should('exist');
  });

  it('should register successfully with valid input', () => {
    cy.intercept('POST', '**/api/user/sign-up', {
      statusCode: 200,
      body: {
        ok: true,
        msg: 'Registered sucessfully',
      },
    }).as('registerRequest');

    cy.get('input[name=name]').type('Cyndy');
    cy.get('input[name=email]').type('cyndy@example.com');
    cy.get('input[name=password]').type('Password1!');
    cy.get('input[name=confirm]').type('Password1!');
    cy.contains('button', 'Register').click();
    cy.wait('@registerRequest');

    cy.url().should('include', '/verify-email');
    cy.contains('Registered sucessfully').should('exist');
  });

  it('should show error if email already exists', () => {
    cy.intercept('POST', '**/api/user/sign-up', {
      statusCode: 400,
      body: {
        ok: false,
        msg: 'Email already in use',
      },
    }).as('registerFail');

    cy.get('input[name=name]').type('Cyndy');
    cy.get('input[name=email]').type('cyndy@example.com');
    cy.get('input[name=password]').type('Password1!');
    cy.get('input[name=confirm]').type('Password1!');
    cy.contains('button', 'Register').click();
    cy.wait('@registerFail');

    cy.contains('Email already in use').should('exist');
  });
});
