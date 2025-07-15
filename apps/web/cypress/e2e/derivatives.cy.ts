describe('Derivatives Dashboard', () => {
  beforeEach(() => {
    // Mock the user authentication
    cy.intercept('GET', '/api/auth/session', { fixture: 'auth/authenticated-session.json' }).as('getSession');
    cy.intercept('GET', '/api/auth/providers', { fixture: 'auth/providers.json' }).as('getProviders');
  });

  it('should load the CEX Perpetuals dashboard without errors', () => {
    // Mock the derivatives API response
    cy.intercept('GET', '/api/v1/derivatives/cex-perps', {
      fixture: 'derivatives/cex-perps.json'
    }).as('getDerivatives');

    // Visit the CEX Perpetuals page
    cy.visit('/research/cex-perps');
    
    // Wait for the API call to complete
    cy.wait('@getDerivatives');
    
    // Verify the page loaded correctly
    cy.contains('h1', 'CEX Perpetuals').should('be.visible');
    
    // Verify that key components are visible
    cy.contains('Open Interest').should('be.visible');
    cy.contains('24h Volume').should('be.visible');
    cy.contains('Avg. Funding Rate').should('be.visible');
    
    // Verify that charts are rendered
    cy.get('[data-testid="oi-chart"]').should('exist');
    cy.get('[data-testid="funding-heatmap"]').should('exist');
    
    // Verify no error messages are displayed
    cy.contains('Error loading derivatives data').should('not.exist');
    cy.contains('500').should('not.exist');
    cy.contains('Internal Server Error').should('not.exist');
  });

  it('should load the CEX Futures dashboard without errors', () => {
    // Mock the derivatives API response
    cy.intercept('GET', '/api/v1/derivatives/cex-futures', {
      fixture: 'derivatives/cex-futures.json'
    }).as('getDerivatives');

    // Visit the CEX Futures page
    cy.visit('/research/cex-futures');
    
    // Wait for the API call to complete
    cy.wait('@getDerivatives');
    
    // Verify the page loaded correctly
    cy.contains('h1', 'CEX Futures').should('be.visible');
    
    // Verify that key components are visible
    cy.contains('Open Interest').should('be.visible');
    cy.contains('24h Volume').should('be.visible');
    
    // Verify that charts are rendered
    cy.get('[data-testid="oi-chart"]').should('exist');
    
    // Verify no error messages are displayed
    cy.contains('Error loading derivatives data').should('not.exist');
    cy.contains('500').should('not.exist');
    cy.contains('Internal Server Error').should('not.exist');
  });
});
