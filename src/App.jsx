import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Tavern from "./components/Tavern";
import UnderConstruction from "./components/UnderConstruction";

function App() {
  return (
    <BrowserRouter>
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

        <Route
          path="/order-up"
          element={<UnderConstruction title="Order Up!" />}
        />

        <Route
          path="/case-files"
          element={<UnderConstruction title="Case Files" />}
        />

        <Route
          path="/status-check"
          element={<UnderConstruction title="Status Check!" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
