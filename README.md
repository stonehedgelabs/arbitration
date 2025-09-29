# Sports Hub Mobile App

A comprehensive mobile-first sports application built with React, TypeScript, and Tailwind CSS v4. Features live scores, play-by-play coverage, video highlights, social content, and betting information across NFL, NBA, MLB, NHL, and MLS.

## ✨ Features

- **🏆 Multi-League Support**: NFL, NBA, MLB, NHL, MLS
- **📱 iOS-Native Design**: Splash screen, authentication, onboarding
- **⚡ Real-Time Updates**: Live scores and play-by-play coverage
- **🎥 Video Highlights**: Game recaps and player highlights
- **💬 Social Feed**: Team and network social media integration
- **🎲 Betting Section**: Live odds and betting lines
- **❤️ Favorites System**: Personalized content based on favorite teams
- **🌙 Dark Mode**: Full dark/light theme support
- **📴 PWA Ready**: Offline support and installable

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone or create project directory**
   ```bash
   mkdir sports-hub-app
   cd sports-hub-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Navigate to `http://localhost:3000`
   - Best viewed in mobile viewport (375px width)

## 📱 App Flow

1. **Splash Screen** → **Login Screen**
2. Choose sign-in method:
   - **Guest** → Continue without account
   - **Apple** → Mock Apple authentication
   - **Google** → Mock Google authentication
3. **Welcome Onboarding** (3 screens, first-time only)
4. **Team Selection** → Choose favorite teams
5. **Main App** → "For You" personalized feed

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **UI Framework**: Chakra UI v3 + Emotion
- **Icons**: Chakra Icons
- **Animations**: Motion (Framer Motion)
- **Charts**: Recharts
- **Build Tool**: Vite
- **Database Schema**: PostgreSQL (see `/database/schema.sql`)

## 📂 Project Structure

```
├── App.tsx                 # Main app component
├── components/            
│   ├── SplashScreen.tsx   # iOS-style splash screen
│   ├── LoginScreen.tsx    # Authentication options  
│   ├── WelcomeOnboarding.tsx # 3-screen onboarding
│   ├── SportsApp.tsx      # Main app container
│   └── ...                # Feature components
├── theme/
│   └── index.ts           # Chakra UI theme configuration
├── data/
│   └── mockData.ts        # Sample sports data
├── database/
│   └── schema.sql         # Complete database schema
└── manifest.json          # PWA configuration
```

## 🎨 Design System

- **Colors**: Chakra UI theme tokens with seamless dark mode
- **Typography**: Responsive font scales with theme-based sizing
- **Spacing**: Consistent spacing using Chakra spacing tokens
- **Components**: Built-in Chakra UI component library
- **Mobile-First**: iOS design patterns and interactions

## 📊 Data Models

The app includes a complete PostgreSQL schema with:
- **Users & Authentication**
- **Leagues & Teams** 
- **Games & Live Scores**
- **Play-by-Play Events**
- **Video Content**
- **Social Media Posts**
- **User Preferences & Favorites**
- **Betting Lines & Odds**

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Key Dependencies

- **React 18**: Core framework
- **TypeScript**: Type safety
- **Chakra UI v3**: Complete UI component library
- **Emotion**: CSS-in-JS styling engine
- **Motion**: Smooth animations
- **Chakra Icons**: Comprehensive icon library
- **Recharts**: Data visualization
- **Vite**: Fast build tool

## 📱 Mobile Features

- **iOS Safe Areas**: Proper iPhone notch handling
- **Touch Interactions**: Native-feeling button presses
- **Swipe Navigation**: Gesture-based interactions  
- **Haptic Feedback**: Visual feedback for interactions
- **PWA Support**: Installable as native app

## 🌟 Highlights

- **Complete Mobile App**: From splash to main app experience
- **Authentication Flow**: Guest, Apple, and Google sign-in
- **Onboarding**: Welcome flow + team selection
- **Real-Time Data**: Live games and play-by-play
- **Rich Content**: Videos, social posts, betting odds
- **Personalization**: Favorite teams and custom feeds
- **Production Ready**: Full TypeScript, error handling, responsive design

Built with modern web technologies for a native mobile app experience! 🚀