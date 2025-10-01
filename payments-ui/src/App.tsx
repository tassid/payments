import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import AccountConsole from "./pages/AccountConsole";

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ maxWidth: 900, margin: "24px auto", padding: "0 16px" }}>
        <h1>Account Management UI</h1>
        <nav style={{ marginBottom: 16 }}><Link to="/">Console</Link></nav>
        <Routes>
          <Route path="/" element={<AccountConsole />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
