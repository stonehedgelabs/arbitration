import React from 'react';
import { Provider } from 'react-redux';
import { ChakraProvider } from '@chakra-ui/react';
import { store } from './src/store';
import Router from './src/router.tsx';
import { ThemeProvider, useTheme, getCurrentThemeSystem } from './src/contexts/ThemeContext';
import './src/styles/globals.css';

// Component that uses the theme context
const ThemedApp = () => {
  const { theme } = useTheme();

  const themeSystem = React.useMemo(
    () => getCurrentThemeSystem(theme),
    [theme]
  );

  return (
    <ChakraProvider value={themeSystem}>
      <Router />
    </ChakraProvider>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </Provider>
  );
}