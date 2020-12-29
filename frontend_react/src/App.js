import React from 'react';
import { Auth } from './Components/Auth';
import './App.css';

function App() {
  return (
      <div>
          <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"
                integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm"
                crossOrigin="anonymous" />
          <Auth />
      </div>
  );
}

export default App;
