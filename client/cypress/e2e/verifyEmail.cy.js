describe('template spec', () => {
  before(() => {
    // Give Vite some time to finish booting if needed
    cy.wait(4000); // wait 2 seconds
  });
  beforeEach(() => {
    cy.visit('/verify-email');
  });
  it('accepts only digits in input', () => {
    cy.get('input').first().type('a').should('have.value', '');
    cy.get('input').first().type('5').should('have.value', '5');
  });

  it('autofocus moves forward as user types digits', () => {
    cy.get('input').eq(0).type('1');

    // Check current input value
    cy.get('input').eq(0).should('have.value', '1');

    // Wait and assert focus moved to second input
    cy.get('input').eq(1).should('be.focused');
  });
  it('pastes 6-digit code correctly', () => {
    cy.get('input').first().trigger('paste', {
      clipboardData: {
        getData: () => '123456'
      }
    });

    cy.get('input').each(($el, i) => {
      cy.wrap($el).should('have.value', `${i + 1}`);
    });
  });
  it('submits when all digits entered', () => {
    cy.intercept('POST', '**/api/user/verify-email', {
      statusCode: 200,
      body: { ok: true, msg: 'Email verified successfully' }
    }).as('verify');

    cy.visit('/verify-email');

    const digits = '123456'.split('');
    digits.forEach((d, i) => {
      cy.get('input').eq(i).type(d);
    });

    cy.wait('@verify');
    cy.contains('Email verified successfully');
  });
  it('shows error toast on invalid code', () => {
    cy.intercept('POST', '**/api/user/verify-email', {
      statusCode: 400,
      body: { msg: 'Invalid code' }
    }).as('verifyFail');

    cy.visit('/verify-email');

    '654321'.split('').forEach((d, i) => {
      cy.get('input').eq(i).type(d);
    });

    cy.wait('@verifyFail');
    cy.contains('Invalid code');
  });
})