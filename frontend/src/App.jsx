import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Upload from "./pages/Upload";
import ManualInput from "./pages/ManualInput";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/upload"
          element={<Upload />}
        />

        <Route
          path="/manual"
          element={<ManualInput />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;