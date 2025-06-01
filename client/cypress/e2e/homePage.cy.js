describe('Home Page', () => {
  beforeEach(() => {
    // Preset a logged-in user in Redux (adjust key as per your persist setup)
    const user = {
      _id: '123',
      name: 'Test User',
      email: 'test@example.com'
    };

    // Setup for redux-persist (if you're using redux-persist)
    window.localStorage.setItem(
      'persist:root',
      JSON.stringify({
        user: JSON.stringify(user),
        _persist: JSON.stringify({ version: -1, rehydrated: true }),
      })
    );

    cy.visit('/home'); // or adjust route as needed
  });

  it('renders welcome message and date', () => {
    cy.contains(/welcome to cern/i).should('be.visible');
    cy.contains(/\d{1,2}(st|nd|rd|th)/i).should('be.visible'); // e.g., 25th
  });

  it('logs out successfully and redirects', () => {
    cy.intercept('GET', '**/api/user/logout', {
      statusCode: 200,
      body: { ok: true, msg: 'Logged out successfully' }
    }).as('logout');

    cy.contains('Logout').click();

    cy.wait('@logout');
    cy.contains(/logged out successfully/i).should('be.visible');

    cy.url().should('include', '/'); // redirected to login
  });
});
