// Wrapper for the MainPage component
import "./styles/connection_doc.scss";
import "./styles/globals.scss";
import "./styles/styles.css";
import MainPage from "./components/MainPage";
import { TooltipProvider } from "./context/TooltipContext";

function App() {
  return (
    <TooltipProvider>
      <main>
        <MainPage />
      </main>
    </TooltipProvider>
  );
}

export default App;
