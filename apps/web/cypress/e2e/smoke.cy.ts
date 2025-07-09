describe('CanHav Smoke Test', () => {
  beforeEach(() => {
    // Visit the homepage before each test
    cy.visit('/');
  });

  it('should load the homepage', () => {
    // Check that the page has loaded
    cy.contains('CanHav').should('be.visible');
    cy.title().should('include', 'CanHav');
  });

  it('should navigate to the dashboard', () => {
    // Navigate to the dashboard page
    cy.contains('Dashboard').click();
    cy.url().should('include', '/dashboard');
    
    // Check that the dashboard components are visible
    cy.contains('Metrics Dashboard').should('be.visible');
    cy.get('[data-testid="metrics-container"]').should('exist');
  });

  it('should display market data', () => {
    // Navigate to the markets page
    cy.contains('Markets').click();
    cy.url().should('include', '/markets');
    
    // Check that market data is loaded
    cy.get('[data-testid="market-table"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="market-row"]').should('have.length.at.least', 1);
  });

  it('should handle watchlist functionality', () => {
    // Navigate to the watchlist page
    cy.contains('Watchlist').click();
    cy.url().should('include', '/watchlist');
    
    // Check that watchlist components are visible
    cy.contains('Your Watchlist').should('be.visible');
    cy.get('[data-testid="add-to-watchlist"]').should('exist');
    
    // Note: Full watchlist CRUD testing would require authentication
    // which is better handled in integration tests
  });

  it('should display portfolio components', () => {
    // Navigate to the portfolio page
    cy.contains('Portfolio').click();
    cy.url().should('include', '/portfolio');
    
    // Check that portfolio components are visible
    cy.contains('Portfolio Overview').should('be.visible');
    cy.get('[data-testid="portfolio-pie-chart"]').should('exist');
    cy.get('[data-testid="risk-gauge"]').should('exist');
  });
});
