import "./App.css";
import { HashRouter, Routes, Route } from "react-router-dom";

import Tavern from "./components/Tavern";
import OrderUp from "./components/OrderUp";
import CaseFiles from "./components/CaseFiles";
import DragonDice from "./components/DragonDice";
import TavernYard from "./components/TavernYard";
import UnderConstruction from "./components/UnderConstruction";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Tavern />} />

        <Route
          path="/recipe-book"
          element={<UnderConstruction title="The Recipe Book" />}
        />

        <Route path="/order-up" element={<OrderUp />} />

        <Route path="/case-files" element={<CaseFiles />} />
        <Route path="/dragon-dice" element={<DragonDice />} />
        <Route path="/tavern-yard" element={<TavernYard />} />

      </Routes>
    </HashRouter>
  );
}

export default App;
