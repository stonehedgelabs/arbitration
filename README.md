# Arbitration - Sports Data Platform

A modern, multi-language sports data platform featuring a React web app, Rust backend, and Python utilities. Focused on real-time sports data aggregation, live scores, and social media integration across major professional leagues.

## 🏗️ Architecture

This is a multi-service platform with three main components:

- **`arb-www/`** - React/TypeScript web application (frontend)
- **`arb-rs/`** - Rust backend API server with data processing
- **`arb-py/`** - Python utilities and data processing scripts
- **`arbitration/`** - Native iOS app (Swift)
- **`arb-dev-proxy/`** - Cloudfare worker proxy for development

## 🚀 Quick Start

### Prerequisites
- Node.js 24+
- Rust 1.90+
- Python 3.12+
- npm/yarn

### Backend Setup

1. **Navigate to Rust backend**
   ```bash
   cd arb-rs
   ```

2. **Install Rust dependencies**
   ```bash
   cargo build
   ```

3. **Run the server**
   ```bash
   cargo run
   ```

### Web Application Setup

1. **Navigate to web app directory**
   ```bash
   cd arb-www
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Start development server**
   ```bash
   yarn dev
   ```

4. **Open in browser**
   - Navigate to `http://localhost:5173`
   - Best viewed in mobile viewport (375px width)

### Python Utilities Setup

1. **Navigate to Python directory**
   ```bash
   cd arb-py
   ```

2. **Install dependencies**
   ```bash
   poetry install
   ```


## 🛠️ Tech Stack

### Frontend (`arb-www/`)
- **React 18** + **TypeScript** - Modern UI framework
- **Chakra UI v3** - Component library and design system
- **Redux Toolkit** - State management
- **React Router v7** - Client-side routing
- **Motion (Framer Motion)** - Smooth animations
- **Lucide React** - Icon library
- **Vite** - Fast build tool

### Backend (`arb-rs/`)
- **Rust** - High-performance systems programming
- **Tokio** - Async runtime
- **Serde** - Serialization/deserialization
- **Axum** - Web framework
- **SQLx** - Database toolkit


## 📂 Project Structure

```
arbitration/
├── arb-www/                    # React web application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── UnifiedGameFeed.tsx  # Real-time social feed
│   │   │   ├── cards/          # Game and score cards
│   │   │   ├── boxscore/       # Box score components
│   │   │   └── badge/          # Status and info badges
│   │   ├── views/              # Main application views
│   │   │   ├── Scores.tsx      # League scores and games
│   │   │   ├── BoxScore.tsx    # Detailed game view
│   │   │   └── Login.tsx       # Authentication
│   │   ├── services/           # API and data services
│   │   ├── store/              # Redux state management
│   │   └── schema/             # TypeScript type definitions
│   └── package.json
├── arb-rs/                     # Rust backend
│   ├── src/
│   │   ├── server.rs           # Main server implementation
│   │   ├── schema/             # Data models and schemas
│   │   └── services/           # Business logic
│   └── Cargo.toml
├── arb-py/                     # Python utilities
│   ├── main.py                 # Main Python entry point
│   └── pyproject.toml
└── arbitration/                # iOS native app
    ├── arbitrationApp.swift    # iOS app entry point
    └── ContentView.swift       # Main iOS view
```

## 🔧 Development

### Running Services with ngrok

To run all services with ngrok tunneling:

```bash
ngrok start --config ngrok.config.yaml --all
```

**Important Configuration Steps:**

1. **API ngrok URL**: Add the API ngrok URL to `arb-www/src/config.ts`
2. **Frontend ngrok URL**: Add the frontend ngrok URL to `arb-rs/config.toml`
3. **Update CORS settings**: Update the `cors_origins` and `client_url` properties in `arb-rs/config.toml` with the frontend ngrok URL

