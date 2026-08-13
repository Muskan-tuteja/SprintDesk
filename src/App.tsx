import { Routes, Route, Navigate } from "react-router-dom";

function Login() {
  return <div className="p-6">Login Page</div>;
}

function Dashboard() {
  return <div className="p-6">Dashboard</div>;
}

function Board() {
  return <div className="p-6">Board</div>;
}

function Analytics() {
  return <div className="p-6">Analytics</div>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/board" element={<Board />} />
      <Route path="/analytics" element={<Analytics />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;