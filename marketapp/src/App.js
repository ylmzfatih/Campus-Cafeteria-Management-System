// src/App.js
import React from 'react';
import Market from './Market';
import { SepetProvider } from './SepetContext';

const App = () => {
  return (
    <SepetProvider>
      <Market />
    </SepetProvider>
  );
};

export default App;
