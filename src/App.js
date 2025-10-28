// Wrapper for the MainPage component
import MainPage from "./components/MainPage";
import { TooltipProvider } from "./context/TooltipContext";
import "./styles/connection_doc.scss";
import "./styles/globals.scss";

function App() {
  return (
    <TooltipProvider>
      <main>
        <MainPage />
        <Chatbot />
      </main>
    </TooltipProvider>
  );
}

export default App;
