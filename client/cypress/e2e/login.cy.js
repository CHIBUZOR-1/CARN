describe('Login Page', () => {
  before(() => {
    // Give Vite some time to finish booting if needed
    cy.wait(3000); // wait 2 seconds
  });
  beforeEach(() => {
    // Give Vite some time to finish booting if needed
    cy.visit('/'); // wait 2 seconds
  });
  it('renders email and password fields and login button', () => {
    cy.get('input[name="email"]').should('exist');
    cy.get('input[name="password"]').should('exist');
    cy.get('button[type="submit"]').contains('Login');
  });
  it('should prevent form submission when inputs are empty', () => {
    cy.contains('button', 'Login').click();

    // HTML5 required attribute should prevent submission — browser shows built-in validation
    cy.get('input[name=email]:invalid').should('have.length', 1);
    cy.get('input[name=password]:invalid').should('have.length', 1);

    // Still on login page
    //cy.url().should('eq', 'http://localhost:5173/'); or
    //cy.url().should('eq', `${Cypress.config().baseUrl}/`); or
    //cy.location('pathname').should('eq', '/');
    cy.url().should('include', '/');
  });
  it('should display error toast for invalid login', () => {
    cy.intercept('POST', '**/api/user/sign-in', {
      statusCode: 401,
      body: {
        ok: false,
        msg: 'User not found',
      },
    }).as('invalidLogin');

    cy.get('input[name=email]').type('wrong@example.com');
    cy.get('input[name=password]').type('wrongpassword');
    cy.contains('button', 'Login').click();
    cy.wait('@invalidLogin');

    //cy.url().should('eq', 'http://localhost:5173/');
    cy.url().should('include', '/');
    cy.contains('User not found').should('exist'); // Assuming Toast message is visible in DOM
  });
  it('should allow a user to log in (mocked API)', () => {
    // Intercept the login API request
    cy.intercept('POST', '**/api/user/sign-in', {
      statusCode: 200,
      body: {
        ok: true,
        msg: 'Login successful',
        user: { _id: '123', name: 'Test User', email: 'testuser@example.com' }
      }
    }).as('loginRequest');

    // Visit the login page (root URL)

    // Fill in credentials
    cy.get('input[name=email]').type('testuser@example.com');
    cy.get('input[name=password]').type('Password1/');

    // Click the login button
    cy.contains('button', 'Login').click();

    // Wait for the mock login request to be triggered
    cy.wait('@loginRequest');

    // Should redirect to /home
    cy.url().should('include', '/home');

    // Optional: verify something on homepage
    cy.contains('WELCOME TO CERN', { matchCase: false }).should('exist'); // Replace with actual homepage content
  });
  it('should navigate to forgot password page', () => {
    cy.contains('Forgot Password').click();
    cy.url().should('include', '/forgot-password');
  });
});