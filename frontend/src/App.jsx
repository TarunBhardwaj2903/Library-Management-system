import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './auth/ProtectedRoute.jsx';

import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';

import MaintenanceHome from './pages/maintenance/MaintenanceHome.jsx';
import UserManagement from './pages/maintenance/UserManagement.jsx';
import AddMembership from './pages/maintenance/AddMembership.jsx';
import UpdateMembership from './pages/maintenance/UpdateMembership.jsx';
import AddBook from './pages/maintenance/AddBook.jsx';
import UpdateBook from './pages/maintenance/UpdateBook.jsx';

import BookAvailability from './pages/reports/BookAvailability.jsx';

import TransactionsHome from './pages/transactions/TransactionsHome.jsx';
import IssueBook from './pages/transactions/IssueBook.jsx';
import ReturnBook from './pages/transactions/ReturnBook.jsx';
import FinePayment from './pages/transactions/FinePayment.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />

        <Route
          path="/maintenance"
          element={<ProtectedRoute roles={['admin']}><MaintenanceHome /></ProtectedRoute>}
        >
          <Route index element={<Navigate to="users" replace />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="memberships/add" element={<AddMembership />} />
          <Route path="memberships/update" element={<UpdateMembership />} />
          <Route path="books/add" element={<AddBook />} />
          <Route path="books/update" element={<UpdateBook />} />
        </Route>

        <Route path="/reports" element={<BookAvailability />} />

        <Route path="/transactions" element={<TransactionsHome />}>
          <Route index element={<Navigate to="issue" replace />} />
          <Route path="issue" element={<IssueBook />} />
          <Route path="return" element={<ReturnBook />} />
        </Route>
        <Route path="/transactions/fine/:id" element={<FinePayment />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
