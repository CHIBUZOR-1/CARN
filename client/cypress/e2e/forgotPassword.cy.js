describe('Forgot Password Page', () => {
  beforeEach(() => {
    cy.visit('/forgot-password');
  });

  it('renders the forgot password form', () => {
    cy.contains(/forgot password/i).should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('button').contains(/submit/i).should('be.visible');
  });

  it('submits valid email and shows confirmation message', () => {
    const email = 'test@example.com';

    cy.intercept('POST', '**/api/user/forgot-password', {
      statusCode: 200,
      body: { ok: true },
    }).as('forgotPassword');

    cy.get('input[type="email"]').type(email);
    cy.get('button').contains(/submit/i).click();

    cy.wait('@forgotPassword');
    cy.contains(`If an account exists for ${email}`).should('be.visible');
  });

  it('shows error toast if API fails', () => {
    cy.intercept('POST', '**/api/user/forgot-password', {
      statusCode: 404,
      body: { msg: 'Email not found' },
    }).as('forgotPasswordFail');

    cy.get('input[type="email"]').type('fail@example.com');
    cy.get('button').contains(/submit/i).click();

    cy.wait('@forgotPasswordFail');
    cy.contains('Email not found').should('be.visible'); // make sure toast container renders in tests
  });
});
