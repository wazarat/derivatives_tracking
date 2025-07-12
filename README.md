# CanHav - Cryptocurrency Research & Analytics Platform

CanHav is a comprehensive cryptocurrency research and analytics platform designed for CEX Perpetual-Futures Traders (Coinbase Intl) and Perp DEX Power Users (dYdX v4, Hyperliquid). The platform provides real-time market data, portfolio tracking, risk analysis, and AI-powered insights.

## Features

- **Authentication**: Secure user authentication via Clerk
- **Sector Browser**: Explore cryptocurrencies by sector and category
- **Metrics Dashboard**: Real-time market metrics and analytics
- **Watchlist**: Track favorite cryptocurrencies
- **Portfolio & Risk Analysis**: Track portfolio performance and risk metrics
- **Rebalancing Tools**: Optimize portfolio allocation
- **AI Chatbot**: Get AI-powered insights and answers
- **Analytics**: Track user behavior with PostHog
- **Feedback System**: Collect user feedback with Canny
- **Email Notifications**: Stay updated with Sendgrid email alerts

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- SWR for data fetching
- Recharts for data visualization

### Backend
- FastAPI
- SQLAlchemy (async)
- Supabase PostgreSQL
- CoinMarketCap API integration
- dYdX and Hyperliquid API integrations
- OpenAI for chatbot functionality

### Infrastructure
- Docker & Docker Compose
- GitHub Actions for CI/CD
- Supabase for database and authentication

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Python 3.9+
- Docker and Docker Compose (for local development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/canhav.git
cd canhav
```

2. Install frontend dependencies:
```bash
cd apps/web
npm install
```

3. Install backend dependencies:
```bash
cd ../api
pip install -r requirements.txt
```

4. Set up environment variables:
   - Create a `.env.local` file in the `apps/web` directory
   - Create a `.env` file in the `apps/api` directory
   - See `.env.example` files for required variables

5. Start the development environment:
```bash
# Start backend services with Docker Compose
docker-compose up -d

# Start frontend development server
cd apps/web
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

### Production Deployment

We've provided a comprehensive set of tools to deploy CanHav to production:

1. Set up environment variables:
   - Copy `.env.example` to `.env` in the root directory
   - Fill in all required values (API keys, database credentials, etc.)

2. Build and deploy using Docker Compose:
```bash
# Make the deployment script executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

3. Verify deployment:
   - Check that all services are running: `docker-compose -f docker-compose.prod.yml ps`
   - Access the application at your configured domain
   - Run through the items in `LAUNCH_CHECKLIST.md`

### SSL Configuration

The production setup includes Nginx for SSL termination:

1. Obtain SSL certificates (e.g., using Let's Encrypt)
2. Place certificates in `nginx/ssl/`:
   - `fullchain.pem`: Full certificate chain
   - `privkey.pem`: Private key

### Monitoring & Maintenance

- View logs: `docker-compose -f docker-compose.prod.yml logs -f [service]`
- Restart services: `docker-compose -f docker-compose.prod.yml restart [service]`
- Update application: Pull latest changes and run `./deploy.sh`

## Project Structure

```
canhav/
├── apps/
│   ├── web/                 # Next.js frontend
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   ├── lib/             # Utility functions
│   │   └── public/          # Static assets
│   └── api/                 # FastAPI backend
│       ├── app/             # FastAPI application
│       │   ├── adapters/    # API adapters
│       │   ├── models/      # Database models
│       │   ├── routers/     # API routes
│       │   ├── services/    # Business logic
│       │   └── workers/     # Background workers
│       └── tests/           # Backend tests
├── nginx/                   # Nginx configuration
├── docker-compose.yml       # Development Docker Compose
├── docker-compose.prod.yml  # Production Docker Compose
├── deploy.sh                # Deployment script
├── LAUNCH_CHECKLIST.md      # Launch preparation checklist
└── README.md                # This file
```

## API Documentation

When running locally, API documentation is available at:
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [CoinMarketCap](https://coinmarketcap.com/) for market data
- [dYdX](https://dydx.exchange/) for DEX integration
- [Hyperliquid](https://hyperliquid.xyz/) for DEX integration
- [OpenAI](https://openai.com/) for AI capabilities
- [Clerk](https://clerk.dev/) for authentication
- [Supabase](https://supabase.io/) for database and infrastructure
- [PostHog](https://posthog.com/) for analytics
- [Canny](https://canny.io/) for feedback collection
- [Sendgrid](https://sendgrid.com/) for email notifications
