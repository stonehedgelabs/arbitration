# Arbitration - Sports Data Platform

A modern, multi-language sports data platform featuring a React web app, Rust backend, and Python utilities. Focused on real-time sports data aggregation, live scores, and social media integration across major professional leagues.

## 🏗️ Architecture

This is a multi-service platform with three main components:

- **`arb-www/`** - React/TypeScript web application (frontend)
- **`arb-rs/`** - Rust backend API server with data processing
- **`arb-py/`** - Python utilities and data processing scripts
- **`arbitration/`** - Native iOS app (Swift)

## ✨ Features

### Web Application (`arb-www/`)
- **📱 Mobile-First Design**: Optimized for mobile devices with responsive layout
- **🏆 Multi-League Support**: NFL, NBA, MLB, NHL with real-time data
- **⚡ Live Scores & Play-by-Play**: Real-time game updates and detailed play tracking
- **💬 Unified Social Feed**: Integrated Reddit and Twitter content for games
- **📊 Advanced Box Scores**: Detailed game statistics and team information
- **🌙 Dark/Light Theme**: Seamless theme switching with system preference detection
- **🔍 Smart Search**: Team and game search functionality
- **📅 Date Navigation**: Easy date selection for historical games

### Backend Services (`arb-rs/`)
- **🚀 High-Performance API**: Rust-based server for optimal performance
- **📡 Real-Time Data**: Live sports data aggregation and processing
- **🗄️ Data Management**: Structured data storage and retrieval
- **🔧 Multi-League Support**: Comprehensive coverage of major sports leagues

### Python Utilities (`arb-py/`)
- **🛠️ Data Processing**: Scripts for data transformation and analysis
- **📊 Analytics**: Sports data analysis and reporting tools
- **🔄 Automation**: Automated data collection and processing workflows

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Rust 1.70+
- Python 3.12+
- npm/yarn

### Web Application Setup

1. **Navigate to web app directory**
   ```bash
   cd arb-www
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open in browser**
   - Navigate to `http://localhost:5173`
   - Best viewed in mobile viewport (375px width)

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

### Python Utilities Setup

1. **Navigate to Python directory**
   ```bash
   cd arb-py
   ```

2. **Install dependencies**
   ```bash
   poetry install
   ```

3. **Activate virtual environment**
   ```bash
   poetry shell
   ```

## 📱 App Flow

1. **Splash Screen** → **Login Screen**
2. Choose authentication method:
   - **Guest** → Continue without account
   - **Apple** → Apple Sign-In integration
   - **Google** → Google Sign-In integration
3. **Main App** → League selection and scores
4. **Game Details** → Box scores and social feed
5. **Unified Feed** → Real-time play-by-play with social content

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

### Python (`arb-py/`)
- **Python 3.12** - Data processing and utilities
- **Poetry** - Dependency management
- **Pandas** - Data manipulation
- **Requests** - HTTP client

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

## 🎨 Design System

- **Mobile-First**: Optimized for mobile devices with responsive design
- **Theme System**: Comprehensive dark/light mode support
- **Component Library**: Reusable Chakra UI components
- **Typography**: Consistent font scales and spacing
- **Color Palette**: Sports-themed color scheme with accessibility focus

## 📊 Data Models

The platform handles comprehensive sports data including:

- **Games & Live Scores**: Real-time game data and scoring
- **Play-by-Play Events**: Detailed game action tracking
- **Team Information**: Rosters, stats, and team data
- **Social Media**: Reddit and Twitter integration
- **User Preferences**: Favorite teams and customization

## 🔧 Development

### Available Scripts (Web App)

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run pretty` - Format code with Prettier

### Key Dependencies

**Frontend:**
- React 18 + TypeScript
- Chakra UI v3 + Emotion
- Redux Toolkit + React Redux
- React Router v7
- Motion (Framer Motion)
- Lucide React icons

**Backend:**
- Rust with Tokio async runtime
- Axum web framework
- Serde for serialization
- SQLx for database operations

## 🌟 Key Features

### Unified Game Feed
- **Real-Time Updates**: Live play-by-play with social media integration
- **Sticky PBP Display**: Prominent latest play information
- **Error Detection**: Automatic error badge display for plays
- **Social Integration**: Reddit and Twitter content alongside game data

### Advanced Box Scores
- **Multi-League Support**: Comprehensive coverage across sports
- **Detailed Statistics**: In-depth game and player statistics
- **Interactive Elements**: Expandable sections and data visualization

### Mobile Optimization
- **Touch Interactions**: Native-feeling mobile interactions
- **Responsive Design**: Seamless experience across device sizes
- **Performance**: Optimized for mobile performance and battery life

## 🚀 Production Ready

- **TypeScript**: Full type safety across the application
- **Error Handling**: Comprehensive error states and user feedback
- **Performance**: Optimized bundle sizes and loading times
- **Accessibility**: WCAG compliant components and interactions
- **Testing**: Comprehensive test coverage for critical functionality

Built with modern web technologies for a premium sports data experience! 🏆
