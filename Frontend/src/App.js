import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { GlobalStyle } from './styles/GlobalStyle';
import Header from './components/Header';
import Home from './pages/Home';
import TrickDetails from './pages/TrickDetails';
import Login from './components/Login';
import Register from './components/Register';
import CreateTrick from './components/CreateTrick';
import EmailVerification from './pages/EmailVerification';
import UserProfile from './pages/UserProfile';
import Forum from './pages/Forum';
import ForumTopic from './pages/ForumTopic';
import CreateForumTopic from './components/CreateForumTopic';
import SkatePark from './pages/SkatePark';
import CreateSkatepark from './components/CreateSkatepark';
import TricksPage from './pages/TricksPage';
import Leaderboards from './pages/Leaderboards';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import AdminDashboard from './components/AdminDashboard';

const AppContent = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <>
      <GlobalStyle isDarkMode={isDarkMode} />
      <Router>
        <div className="App">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tricks" element={<TricksPage />} />
              <Route path="/trick/:id" element={<TrickDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/create-trick" element={<CreateTrick />} />
              <Route path="/verify-email/:token" element={<EmailVerification />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/forum" element={<Forum />} />
              <Route path="/forum/topic/:id" element={<ForumTopic />} />
              <Route path="/forum/create-topic" element={<CreateForumTopic />} />
              <Route path="/skateparks" element={<SkatePark />} />
              <Route path="/create-skatepark" element={<CreateSkatepark />} />
              <Route path="/leaderboards" element={<Leaderboards />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>
        </div>
      </Router>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <GlobalStyle />
          <div className="App">
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tricks" element={<TricksPage />} />
              <Route path="/trick/:id" element={<TrickDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/create-trick" element={<CreateTrick />} />
              <Route path="/verify-email/:token" element={<EmailVerification />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/forum" element={<Forum />} />
              <Route path="/forum/topic/:id" element={<ForumTopic />} />
              <Route path="/forum/create-topic" element={<CreateForumTopic />} />
              <Route path="/skateparks" element={<SkatePark />} />
              <Route path="/create-skatepark" element={<CreateSkatepark />} />
              <Route path="/leaderboards" element={<Leaderboards />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
