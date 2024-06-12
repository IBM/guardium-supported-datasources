// Wrapper for the MainPage component
import './styles/connection_doc.scss';
import MainPage from './MainPage';
import './styles/globals.scss';
import React from 'react';


class App extends React.Component {
   

  render() {

    return (
      <main>
        <MainPage/>
      </main>
    )
  };
}

export default App;
