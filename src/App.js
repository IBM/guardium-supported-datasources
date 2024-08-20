// Wrapper for the MainPage component
import "./styles/connection_doc.scss";
import "./styles/globals.scss";

import React from "react";

import { MainPage } from "./components/MainPage";

class App extends React.Component {
  render() {
    return (
      <main>
        <MainPage />
      </main>
    );
  }
}

export { App };
