# CanHav - Crypto Investment Platform

A Yahoo-Finance-style dashboard for analyzing and building portfolios of stable crypto assets.

## Features

- 📊 Real-time metrics for 9+ crypto asset classes
- 🎯 Risk-based portfolio construction
- 📱 Responsive PWA interface
- 🤖 AI-powered portfolio suggestions
- 🔍 Detailed asset analysis and comparisons

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI, Python 3.11
- **Database**: Supabase (PostgreSQL)
- **Caching**: Upstash Redis
- **AI**: OpenAI GPT-4o
- **Infra**: Docker, GitHub Actions, Railway

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- Supabase account
- OpenAI API key

### Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install root dependencies
   npm install
   
   # Install web app dependencies
   cd apps/web
   npm install
   
   # Install API dependencies
   cd ../../apps/api
   pip install -r requirements.txt
   ```

3. Set up environment variables (see `.env.example`)

4. Start the development environment:
   ```bash
   # From project root
   docker-compose up -d
   ```

5. Access the app at http://localhost:3000

## Project Structure

```
canhav/
├── apps/
│   ├── web/           # Next.js frontend
│   └── api/           # FastAPI backend
├── packages/
│   ├── db/           # Database schemas and types
│   ├── shared/        # Shared utilities and types
│   └── etl/           # Data ingestion scripts
└── docker-compose.yml  # Local development
```

## License

MIT
