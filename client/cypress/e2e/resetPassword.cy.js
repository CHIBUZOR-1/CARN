describe('Reset Password Page', () => {
  const token = 'mock-reset-token';

  beforeEach(() => {
    cy.visit(`/reset-password/${token}`);
  });

  it('renders form correctly', () => {
    cy.contains(/reset password/i).should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('input[name="confirmPassword"]').should('be.visible');
    cy.get('button').contains(/change/i).should('be.visible');
  });

  it('shows warning if passwords do not match', () => {
    cy.get('input[name="password"]').type('Valid@123');
    cy.get('input[name="confirmPassword"]').type('Mismatch@123');
    cy.get('button').click();

    cy.contains(/passwords do not match/i).should('be.visible');
  });

  it('shows warning if password format is invalid', () => {
    cy.get('input[name="password"]').type('invalid');
    cy.get('input[name="confirmPassword"]').type('invalid');
    cy.get('button').click();

    cy.contains(/correct password format/i).should('be.visible');
  });

  it('submits valid password and redirects', () => {
    cy.intercept('POST', `**/api/user/reset-password/${token}`, {
      statusCode: 200,
      body: { ok: true, msg: 'Password reset successful' },
    }).as('resetPassword');

    cy.get('input[name="password"]').type('Valid@123');
    cy.get('input[name="confirmPassword"]').type('Valid@123');
    cy.get('button').click();

    cy.wait('@resetPassword');
    cy.contains(/password reset successful/i).should('be.visible');
  });

  it('shows API error if reset fails', () => {
    cy.intercept('POST', `**/api/user/reset-password/${token}`, {
      statusCode: 400,
      body: { msg: 'Invalid or expired token' },
    }).as('resetFail');

    cy.get('input[name="password"]').type('Valid@123');
    cy.get('input[name="confirmPassword"]').type('Valid@123');
    cy.get('button').click();

    cy.wait('@resetFail');
    cy.contains('Invalid or expired token').should('be.visible');
  });
});
