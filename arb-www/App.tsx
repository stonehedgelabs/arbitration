import { Provider } from 'react-redux';
import { ChakraProvider } from '@chakra-ui/react';
import { store } from './src/store';
import Router from './src/router.tsx';
import system from './theme.ts';
import './src/styles/globals.css';

export default function App() {
  return (
    <Provider store={store}>
      <ChakraProvider value={system}>
        <Router />
      </ChakraProvider>
    </Provider>
  );
}