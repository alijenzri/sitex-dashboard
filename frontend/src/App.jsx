import './App.css'
import NavBar from './components/NavBar'
import Main from './components/Main'
import ReportsCenter from './components/ReportsCenter'
import Production from './components/Production'
import Articles from './components/Articles'
import Login from './components/Login'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import React from 'react'

function RequireAuth({ children }) {
  const loggedIn = sessionStorage.getItem('sitexadmin_logged_in') === 'true';
  const location = useLocation();
  if (!loggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function DashboardLayout() {
  const [currentSection, setCurrentSection] = React.useState('dashboard');
  const renderSection = () => {
    switch(currentSection) {
      case 'reports-center':
        return <ReportsCenter />
      case 'production':
        return <Production />
      case 'articles':
        return <Articles />
      default:
        return <Main />
    }
  }
  return (
    <>
      <NavBar onNavigate={setCurrentSection} currentSection={currentSection} />
      {renderSection()}
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLogin={() => window.location.replace('/')} />} />
        <Route path="/*" element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        } />
      </Routes>
    </Router>
  )
}

export default App
