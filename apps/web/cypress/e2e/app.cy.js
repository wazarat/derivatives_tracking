// CanHav Frontend E2E Tests

describe('CanHav Platform E2E Tests', () => {
  beforeEach(() => {
    // Visit the homepage before each test
    cy.visit('/');
    
    // Wait for initial data loading
    cy.wait(1000);
  });

  it('should load the landing page correctly', () => {
    // Check that the main elements are present
    cy.get('h1').should('contain', 'CanHav');
    cy.get('nav').should('be.visible');
    cy.get('footer').should('be.visible');
    
    // Check for key landing page sections
    cy.contains('Cryptocurrency Research & Analytics').should('be.visible');
    cy.contains('Get Started').should('be.visible');
  });

  it('should navigate to dashboard page', () => {
    // Find and click the dashboard link
    cy.contains('Dashboard').click();
    
    // Check URL has changed to dashboard
    cy.url().should('include', '/dashboard');
    
    // Verify dashboard components are loaded
    cy.contains('Market Overview').should('be.visible');
    cy.get('[data-testid="market-stats"]').should('be.visible');
  });

  it('should display crypto assets list', () => {
    // Navigate to assets page
    cy.contains('Assets').click();
    cy.url().should('include', '/assets');
    
    // Check that the assets table is loaded
    cy.get('[data-testid="assets-table"]').should('be.visible');
    
    // Verify that at least a few major cryptocurrencies are listed
    cy.contains('Bitcoin').should('be.visible');
    cy.contains('Ethereum').should('be.visible');
    
    // Check that the table has multiple rows
    cy.get('[data-testid="assets-table"] tbody tr').should('have.length.at.least', 5);
  });

  it('should show detailed metrics for Bitcoin', () => {
    // Navigate to Bitcoin details page
    cy.contains('Assets').click();
    cy.contains('Bitcoin').click();
    
    // Check URL contains the BTC symbol
    cy.url().should('include', '/assets/BTC');
    
    // Verify key metrics are displayed
    cy.contains('Price').should('be.visible');
    cy.contains('Market Cap').should('be.visible');
    cy.contains('24h Volume').should('be.visible');
    
    // Check price chart is rendered
    cy.get('[data-testid="price-chart"]').should('be.visible');
  });

  it('should allow filtering assets by sector', () => {
    // Navigate to sectors page
    cy.contains('Sectors').click();
    cy.url().should('include', '/sectors');
    
    // Check that sectors are listed
    cy.get('[data-testid="sectors-list"]').should('be.visible');
    
    // Click on a specific sector
    cy.contains('Smart Contract Platforms').click();
    
    // Verify filtered results
    cy.url().should('include', '/sectors/');
    cy.contains('Ethereum').should('be.visible');
  });

  it('should show trending cryptocurrencies', () => {
    // Navigate to trending page
    cy.contains('Trending').click();
    cy.url().should('include', '/trending');
    
    // Check that trending assets are displayed
    cy.get('[data-testid="trending-list"]').should('be.visible');
    cy.get('[data-testid="trending-list"] li').should('have.length.at.least', 3);
  });

  it('should allow adding assets to watchlist', () => {
    // Navigate to assets page
    cy.contains('Assets').click();
    
    // Find and click the "Add to Watchlist" button for Bitcoin
    cy.contains('tr', 'Bitcoin')
      .find('[data-testid="add-to-watchlist"]')
      .click();
    
    // Navigate to watchlist page
    cy.contains('Watchlist').click();
    cy.url().should('include', '/watchlist');
    
    // Verify Bitcoin is in the watchlist
    cy.contains('Bitcoin').should('be.visible');
  });

  it('should display portfolio page', () => {
    // Navigate to portfolio page
    cy.contains('Portfolio').click();
    cy.url().should('include', '/portfolio');
    
    // Check that portfolio components are visible
    cy.contains('Portfolio Overview').should('be.visible');
    cy.get('[data-testid="portfolio-summary"]').should('be.visible');
    cy.get('[data-testid="portfolio-allocation"]').should('be.visible');
  });

  it('should open and interact with AI chatbot', () => {
    // Find and click the chatbot button
    cy.get('[data-testid="chatbot-trigger"]').click();
    
    // Check that chatbot dialog is open
    cy.get('[data-testid="chatbot-dialog"]').should('be.visible');
    
    // Type a message
    cy.get('[data-testid="chatbot-input"]')
      .type('What is Bitcoin?{enter}');
    
    // Wait for response
    cy.wait(2000);
    
    // Verify response received
    cy.get('[data-testid="chatbot-messages"]')
      .should('contain', 'Bitcoin');
  });

  it('should handle API errors gracefully', () => {
    // Intercept API calls and force an error
    cy.intercept('GET', '**/api/crypto/assets', {
      statusCode: 500,
      body: { error: 'Internal Server Error' }
    }).as('assetsError');
    
    // Navigate to assets page
    cy.contains('Assets').click();
    
    // Wait for the intercepted request
    cy.wait('@assetsError');
    
    // Check that error state is handled properly
    cy.contains('Error loading data').should('be.visible');
    cy.contains('Try again').should('be.visible');
  });

  it('should allow user to provide feedback', () => {
    // Navigate to feedback page
    cy.contains('Feedback').click();
    cy.url().should('include', '/feedback');
    
    // Fill out feedback form
    cy.get('[data-testid="feedback-title"]').type('Test Feedback');
    cy.get('[data-testid="feedback-description"]').type('This is a test feedback submission from Cypress.');
    cy.get('[data-testid="feedback-category"]').select('Feature Request');
    
    // Submit form
    cy.get('[data-testid="feedback-submit"]').click();
    
    // Verify success message
    cy.contains('Feedback submitted successfully').should('be.visible');
  });
});
