import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Feed.css';

const Feed = ({ posts }) => {
    const navigate = useNavigate();
    const [likedPosts, setLikedPosts] = useState({});

    const toggleLike = (postId) => {
        setLikedPosts((prev) => ({
            ...prev,
            [postId]: !prev[postId],
        }));
    };

    const getTimeAgo = (timestamp) => {
        const now = new Date();
        const postDate = new Date(timestamp);
        const diffMs = now - postDate;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHrs = Math.floor(diffMins / 60);
        if (diffHrs < 24) return `${diffHrs}h ago`;
        const diffDays = Math.floor(diffHrs / 24);
        return `${diffDays}d ago`;
    };

    return (
        <div className="feed-page">
            <div className="feed-header">
                <h2>📰 Your Feed</h2>
                <p className="feed-subtitle">
                    {posts.length > 0
                        ? `${posts.length} post${posts.length > 1 ? 's' : ''} shared`
                        : 'No posts yet — be the first to share!'}
                </p>
            </div>

            {posts.length === 0 ? (
                <div className="empty-feed">
                    <div className="empty-icon">🌌</div>
                    <h3>Nothing here yet</h3>
                    <p>Start by creating your first post!</p>
                    <button className="empty-cta" onClick={() => navigate('/create')}>
                        <span>➕</span> Create Post
                    </button>
                </div>
            ) : (
                <div className="posts-container">
                    {posts.map((post) => (
                        <article key={post.id} className="post-card">
                            {/* Post Header */}
                            <div className="post-header">
                                <div className="post-author">
                                    <span className="author-avatar">{post.avatar}</span>
                                    <div>
                                        <span className="author-name">{post.author}</span>
                                        <span className="post-time">{getTimeAgo(post.timestamp)}</span>
                                    </div>
                                </div>
                                <button className="post-menu">⋯</button>
                            </div>

                            {/* Post Image */}
                            <div className="post-image-wrapper">
                                <img src={post.image} alt="Post" className="post-image" />
                            </div>

                            {/* Post Actions */}
                            <div className="post-actions">
                                <button
                                    className={`action-btn like-btn ${likedPosts[post.id] ? 'liked' : ''}`}
                                    onClick={() => toggleLike(post.id)}
                                >
                                    <span>{likedPosts[post.id] ? '❤️' : '🤍'}</span>
                                    <span className="action-count">
                                        {post.likes + (likedPosts[post.id] ? 1 : 0)}
                                    </span>
                                </button>
                                <button className="action-btn">
                                    <span>💬</span>
                                    <span className="action-count">{post.comments.length}</span>
                                </button>
                                <button className="action-btn">
                                    <span>🔗</span>
                                    <span className="action-label">Share</span>
                                </button>
                            </div>

                            {/* Post Description */}
                            <div className="post-description">
                                <span className="desc-author">{post.author}</span>
                                {post.description}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Feed;
