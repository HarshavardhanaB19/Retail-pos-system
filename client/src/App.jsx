import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SelfOrder from './pages/SelfOrder';
import Queue from './pages/Queue';
import Reports from './pages/Reports';
import Ingredients from './pages/Ingredients';
import Users from './pages/Users';
import BranchSettings from './pages/BranchSettings';
import Categories from './pages/Categories';
import POS from './pages/POS';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter basename="/Retail-pos-system">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/queue" element={<ProtectedRoute><Queue /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/ingredients" element={<ProtectedRoute><Ingredients /></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
        <Route path="/pos" element={<ProtectedRoute><POS /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
        <Route path="/branch-settings" element={<ProtectedRoute><BranchSettings /></ProtectedRoute>} />
        <Route path="/order/:branchId/:tableId" element={<SelfOrder />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;