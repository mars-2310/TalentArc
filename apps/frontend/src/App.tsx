import "styles/globals.css";
import { Route, Routes, Navigate } from "react-router-dom";

import { Form } from "./components/Form";
import { Interview } from "./components/Interview";
import { Result } from "./components/Result";
import { Toaster } from "sonner";

export function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={<Form />} />
        <Route path="/interview/:interviewId" element={<Interview />} />
        <Route path="/result/:interviewId" element={<Result />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
