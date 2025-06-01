describe('Not Found Page', () => {
  it('displays 404 and redirects guest users back to login', () => {
    cy.visit('/some-invalid-route', { failOnStatusCode: false });

    cy.contains('404').should('be.visible');
    cy.contains(/page not found/i).should('be.visible');
    cy.contains(/go back/i)
      .should('have.attr', 'href', '/')
      .click();

    cy.url().should('eq', `${Cypress.config().baseUrl}/`);
  });

  it('redirects logged-in users back to /home', () => {
    const user = {
      _id: '123',
      name: 'Jane Doe',
      email: 'jane@example.com',
    };

    window.localStorage.setItem(
      'persist:root',
      JSON.stringify({
        user: JSON.stringify(user),
        _persist: JSON.stringify({ version: -1, rehydrated: true }),
      })
    );

    cy.visit('/non-existent-path', { failOnStatusCode: false });

    cy.contains('404').should('be.visible');
    cy.contains(/go back/i)
      .should('have.attr', 'href', '/home')
      .click();

    cy.url().should('eq', `${Cypress.config().baseUrl}/home`);
  });
});
