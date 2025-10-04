# Theme System Guide

This app now supports both light and dark themes with automatic system theme detection.

## Features

- **System Theme Detection**: Automatically detects and follows the user's system theme preference
- **Manual Theme Control**: Users can override system settings with light, dark, or system modes
- **Smooth Transitions**: CSS transitions provide smooth theme switching
- **Persistent Preferences**: Theme choice is saved to localStorage
- **SSR Safe**: Works with server-side rendering

## Usage

### Using the Theme Context

```tsx
import { useTheme } from '../contexts/ThemeContext';

function MyComponent() {
  const { theme, themeMode, setThemeMode, toggleTheme } = useTheme();
  
  // theme: 'light' | 'dark' (actual theme being used)
  // themeMode: 'light' | 'dark' | 'system' (user preference)
  // setThemeMode: function to set specific mode
  // toggleTheme: function to cycle through modes
}
```

### Theme Toggle Components

#### Full Theme Toggle
```tsx
import { ThemeToggle } from './components/ThemeToggle';

<ThemeToggle showLabels={true} size="md" />
```

#### Simple Theme Toggle (for compact spaces)
```tsx
import { ThemeToggleSimple } from './components/ThemeToggle';

<ThemeToggleSimple size="sm" />
```

### Using Theme Colors in Components

The theme system provides consistent color tokens that work in both light and dark modes:

```tsx
<Box bg="primary.200" color="text.300">
  <Text>This text will adapt to the current theme</Text>
</Box>
```

### Available Color Tokens

#### Primary Colors (Backgrounds/Surfaces)
- `primary.25` - Lightest surface
- `primary.50` - Light surface  
- `primary.100` - Subtle surface
- `primary.200` - Default section background
- `primary.300` - Medium surface
- `primary.400` - Darker surface
- `primary.500` - Darkest surface

#### Accent Colors (Interactive Elements)
- `accent.50` - Very light accent
- `accent.100` - Primary action color
- `accent.200` - Hover state
- `accent.300` - Active state
- `accent.400` - Pressed/outline state

#### Text Colors
- `text.50` - Lightest text
- `text.100` - Secondary text
- `text.150` - Muted info
- `text.200` - Captions/timestamps
- `text.300` - Default body text
- `text.400` - High-contrast headings

#### Border Colors
- `border.50` - Lightest border
- `border.100` - Default UI borders
- `border.150` - Accent/selected outlines

#### Utility Colors
- `highlight.50`, `highlight.100`, `highlight.200` - Highlight colors
- `success.50`, `success.100` - Success states
- `danger.50`, `danger.100` - Error states
- `divider` - Divider lines

## Implementation Details

### Theme Detection
The system uses `window.matchMedia('(prefers-color-scheme: dark)')` to detect system theme preferences and automatically switches when the user changes their system settings.

### Transition Prevention
To prevent theme flash on initial load, the system adds a `no-transition` class that is removed after 100ms.

### Local Storage
User theme preferences are automatically saved to `localStorage` with the key `theme-mode`.

## Customization

### Adding New Color Tokens
Edit `theme.ts` to add new color tokens to both `lightColors` and `darkColors` objects.

### Modifying Transitions
Adjust the CSS variables in `globals.css`:
```css
:root {
  --theme-transition-duration: 0.3s;
  --theme-transition-timing: ease-in-out;
}
```

### Theme Toggle Styling
The theme toggle components use Chakra UI styling and can be customized by passing props or modifying the component styles.
