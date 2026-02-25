import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Header from './Component/Header/Header';
import Footer from './Component/Footer/Footer';
import Feed from './Pages/Feed';
import CreatePost from './Pages/CreatePost';
import Profile from './Pages/Profile';
import './App.css';

const App = () => {
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
    fetchPosts();
  }, []);

  const addPost = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const updatePost = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
    );
  };

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