import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Header from './Component/Header/Header';
import Footer from './Component/Footer/Footer';
import Feed from './Pages/Feed';
import CreatePost from './Pages/CreatePost';
import Profile from './Pages/Profile';
import Auth from './Pages/Auth';
import './App.css';

/* ─── Toast System ───────────────────────────────── */
const ToastContainer = ({ toasts }) => (
  <div className="toast-container" aria-live="polite">
    {toasts.map((t) => (
      <div key={t.id} className={`toast-item ${t.type} ${t.exiting ? 'toast-exit' : ''}`} role="alert">
        <span className="toast-icon">
          {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
        </span>
        {t.message}
      </div>
    ))}
  </div>
);

/* ─── Main App ───────────────────────────────────── */
const App = () => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState([]);

  const [savedPostIds, setSavedPostIds] = useState(() => {
    const saved = localStorage.getItem('savedPostIds');
    return saved ? JSON.parse(saved) : [];
  });

  /* toast helper */
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, exiting: false }]);
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 300);
    }, 2700);
  }, []);

  /* saved posts persistence */
  useEffect(() => {
    localStorage.setItem('savedPostIds', JSON.stringify(savedPostIds));
  }, [savedPostIds]);

  const toggleSavePost = useCallback((postId) => {
    setSavedPostIds((prev) => {
      const exists = prev.includes(postId);
      if (exists) {
        showToast('Post removed from saved', 'info');
        return prev.filter((id) => id !== postId);
      }
      showToast('Post saved!', 'success');
      return [...prev, postId];
    });
  }, [showToast]);

  /* fetch posts */
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/getPosts');
      setPosts(response.data.posts);
    } catch (err) {
      console.log('Error fetching posts:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchPosts();
  }, [user]);

  /* auth */
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    showToast('Logged out successfully', 'info');
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    showToast('Profile updated!', 'success');
  };

  /* posts CRUD */
  const addPost = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const updatePost = (updatedPost) => {
    setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
  };

  const deletePost = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    showToast('Post deleted', 'info');
  };

  /* ── Auth gate ──────────────────────────────────── */
  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <Header
          user={user}
          onLogout={handleLogout}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showToast={showToast}
        />
        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={
                <Feed
                  posts={posts}
                  loading={loading}
                  onUpdatePost={updatePost}
                  onDeletePost={deletePost}
                  searchQuery={searchQuery}
                  savedPostIds={savedPostIds}
                  onToggleSave={toggleSavePost}
                  showToast={showToast}
                  user={user}
                />
              }
            />
            <Route
              path="/create"
              element={
                <CreatePost
                  onPost={addPost}
                  fetchPosts={fetchPosts}
                  showToast={showToast}
                  user={user}
                />
              }
            />
            <Route
              path="/profile"
              element={
                <Profile
                  posts={posts}
                  user={user}
                  onUpdateUser={handleUpdateUser}
                  savedPostIds={savedPostIds}
                  onToggleSave={toggleSavePost}
                  showToast={showToast}
                  onUpdatePost={updatePost}
                />
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
      <ToastContainer toasts={toasts} />
    </BrowserRouter>
  );
};

export default App;