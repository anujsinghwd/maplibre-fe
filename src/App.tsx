import React from 'react';
import Map from './Components/Map';
import ErrorBoundary from './ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Map />
    </ErrorBoundary>
  );
}

export default App;
