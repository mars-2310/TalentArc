import "styles/globals.css";
import { Route, Routes, Navigate } from "react-router-dom";

import { Form } from "./components/Form";
import { Interview } from "./components/Interview";
import { Result } from "./components/Result";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Form />} />
      <Route path="/interview" element={<Interview />} />
      <Route path="/result" element={<Result />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
