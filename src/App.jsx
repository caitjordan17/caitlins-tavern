import "./App.css";
import { HashRouter, Routes, Route } from "react-router-dom";

import Tavern from "./components/Tavern";
import OrderUp from "./components/OrderUp";
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

        <Route
          path="/sf-food-finds"
          element={<UnderConstruction title="SF Food Finds" />}
        />

        <Route path="/order-up" element={<OrderUp />} />

        <Route
          path="/case-files"
          element={<UnderConstruction title="Case Files" />}
        />

        <Route
          path="/status-check"
          element={<UnderConstruction title="Status Check!" />}
        />
      </Routes>
    </HashRouter>
  );
}

export default App;
