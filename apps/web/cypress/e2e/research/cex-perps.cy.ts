describe('CEX Perpetuals Research Dashboard', () => {
  beforeEach(() => {
    // Mock the API response for derivatives data
    cy.intercept('GET', '/api/v1/derivatives/cex-perps', {
      statusCode: 200,
      fixture: 'derivatives/cex-perps.json',
    }).as('getDerivatives');
    
    // Visit the CEX Perpetuals page
    cy.visit('/research/cex-perps');
  });
  
  it('should load the CEX Perpetuals dashboard', () => {
    // Wait for the API request to complete
    cy.wait('@getDerivatives');
    
    // Verify the page title is correct
    cy.get('h1').should('contain', 'CEX Perpetuals Research');
    
    // Verify the DerivativesPanel component is rendered
    cy.get('.card').should('exist');
    cy.get('.card-title').should('contain', 'CEX Perpetuals Market Overview');
    
    // Verify the stats cards are displayed
    cy.contains('Total Open Interest').should('exist');
    cy.contains('24h Volume').should('exist');
    cy.contains('Avg. Funding Rate').should('exist');
    
    // Verify the Open Interest bar chart is displayed
    cy.contains('Top Contracts by Open Interest').should('exist');
    
    // Verify the Funding Rate heatmap is displayed
    cy.contains('Funding Rates').should('exist');
  });
  
  it('should handle API errors gracefully', () => {
    // Mock a failed API response
    cy.intercept('GET', '/api/v1/derivatives/cex-perps', {
      statusCode: 500,
      body: { error: 'Internal Server Error' },
    }).as('getDerivativesError');
    
    // Reload the page
    cy.visit('/research/cex-perps');
    
    // Wait for the API request to complete
    cy.wait('@getDerivativesError');
    
    // Verify error message is displayed
    cy.contains('Error loading derivatives data').should('exist');
  });
});
