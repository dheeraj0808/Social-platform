import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Header from './Component/Header/Header';
import Footer from './Component/Footer/Footer';
import Feed from './Pages/Feed';
import CreatePost from './Pages/CreatePost';
import Profile from './Pages/Profile';
import Auth from './Pages/Auth';
import './App.css';

const App = () => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    try {
      const response = await axios.get("http://localhost:3000/getPosts");
      setPosts(response.data.posts);
    } catch (err) {
      console.log("Error fetching posts:", err.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const addPost = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const updatePost = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
    );
  };

  // Jab tak login nahi kiya, Auth page dikhao
  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  // Login ke baad normal app dikhao
  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Feed posts={posts} onUpdatePost={updatePost} />} />
            <Route path="/create" element={<CreatePost onPost={addPost} fetchPosts={fetchPosts} />} />
            <Route path="/profile" element={<Profile posts={posts} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;