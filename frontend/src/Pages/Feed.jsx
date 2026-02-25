import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Feed.css';

const Feed = ({ posts }) => {
    const navigate = useNavigate();
    const [likedPosts, setLikedPosts] = useState({});
    const [savedPosts, setSavedPosts] = useState({});
    const [doubleTapId, setDoubleTapId] = useState(null);
    const [expandedDescs, setExpandedDescs] = useState({});

    const toggleLike = (postId) => {
        setLikedPosts((prev) => ({
            ...prev,
            [postId]: !prev[postId],
        }));
    };

    const toggleSave = (postId) => {
        setSavedPosts((prev) => ({
            ...prev,
            [postId]: !prev[postId],
        }));
    };

    const handleDoubleTap = (postId) => {
        if (!likedPosts[postId]) {
            setLikedPosts((prev) => ({ ...prev, [postId]: true }));
        }
        setDoubleTapId(postId);
        setTimeout(() => setDoubleTapId(null), 900);
    };

    const toggleDesc = (postId) => {
        setExpandedDescs((prev) => ({
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
            {/* Feed Top Bar */}
            <div className="feed-top-bar">
                <div className="feed-header-section">
                    <h2 className="feed-title">Your Feed</h2>
                    <p className="feed-subtitle">
                        {posts.length > 0
                            ? `${posts.length} post${posts.length > 1 ? 's' : ''} shared`
                            : 'No posts yet — be the first to share!'}
                    </p>
                </div>

            </div>

            {posts.length === 0 ? (
                <div className="empty-feed">
                    <div className="empty-glow" />
                    <div className="empty-glow glow-2" />
                    <div className="empty-illustration">
                        <div className="illust-circle">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                            </svg>
                        </div>
                    </div>
                    <h3>No Posts Yet</h3>
                    <p>Your feed is waiting for its first moment. Create a post and start sharing!</p>
                    <button className="empty-cta" onClick={() => navigate('/create')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Create Your First Post
                    </button>
                    <div className="empty-hints">
                        <div className="hint-item">
                            <div className="hint-icon-wrap">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                            </div>
                            <span>Upload photos</span>
                        </div>
                        <div className="hint-item">
                            <div className="hint-icon-wrap">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z" /></svg>
                            </div>
                            <span>Write captions</span>
                        </div>
                        <div className="hint-item">
                            <div className="hint-icon-wrap">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                            </div>
                            <span>Get likes</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="posts-container">
                    {posts.map((post, index) => (
                        <article
                            key={post.id}
                            className="post-card"
                            style={{ animationDelay: `${index * 0.08}s` }}
                        >
                            {/* Post Header */}
                            <div className="post-top">
                                <div className="post-author">
                                    <div className="avatar-ring">
                                        <div className="avatar-inner">
                                            {post.avatar}
                                        </div>
                                    </div>
                                    <div className="author-meta">
                                        <span className="author-name">{post.author}</span>
                                        <span className="post-time">{getTimeAgo(post.timestamp)}</span>
                                    </div>
                                </div>
                                <button className="post-menu-btn" title="More options">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#8888a8">
                                        <circle cx="5" cy="12" r="2" />
                                        <circle cx="12" cy="12" r="2" />
                                        <circle cx="19" cy="12" r="2" />
                                    </svg>
                                </button>
                            </div>

                            {/* Post Image */}
                            <div
                                className="post-image-wrapper"
                                onDoubleClick={() => handleDoubleTap(post.id)}
                            >
                                <img src={post.image} alt="Post" className="post-image" loading="lazy" />
                                <div className="image-overlay" />
                                {doubleTapId === post.id && (
                                    <div className="double-tap-heart">
                                        <svg width="80" height="80" viewBox="0 0 24 24" fill="#ef4444" stroke="none">
                                            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Post Actions */}
                            <div className="post-actions-bar">
                                <div className="actions-left">
                                    <button
                                        className={`act-btn like-btn ${likedPosts[post.id] ? 'liked' : ''}`}
                                        onClick={() => toggleLike(post.id)}
                                        title="Like"
                                    >
                                        {likedPosts[post.id] ? (
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="#ef4444" stroke="none">
                                                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                                            </svg>
                                        ) : (
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c0c0d0" strokeWidth="1.8">
                                                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                                            </svg>
                                        )}
                                    </button>
                                    <button className="act-btn" title="Comment">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c0c0d0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                                        </svg>
                                    </button>
                                    <button className="act-btn" title="Share">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c0c0d0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="22" y1="2" x2="11" y2="13" />
                                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                        </svg>
                                    </button>
                                </div>
                                <button
                                    className={`act-btn save-btn ${savedPosts[post.id] ? 'saved' : ''}`}
                                    onClick={() => toggleSave(post.id)}
                                    title="Save"
                                >
                                    {savedPosts[post.id] ? (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#e0e0f0" stroke="none">
                                            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                                        </svg>
                                    ) : (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c0c0d0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            {/* Like Count */}
                            <div className="likes-count">
                                <strong>{post.likes + (likedPosts[post.id] ? 1 : 0)}</strong> likes
                            </div>

                            {/* Post Description */}
                            <div className="post-caption">
                                <strong className="caption-author">{post.author}</strong>
                                <span className={`caption-text ${expandedDescs[post.id] ? 'expanded' : ''}`}>
                                    {post.description}
                                </span>
                                {post.description.length > 80 && !expandedDescs[post.id] && (
                                    <button
                                        className="more-btn"
                                        onClick={() => toggleDesc(post.id)}
                                    >
                                        ...more
                                    </button>
                                )}
                            </div>

                            {/* View Comments */}
                            {post.comments.length > 0 && (
                                <button className="view-comments-btn">
                                    View all {post.comments.length} comments
                                </button>
                            )}

                            {/* Post Date */}
                            <div className="post-date">
                                {new Date(post.timestamp).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                })} · {getTimeAgo(post.timestamp)}
                            </div>

                            {/* Divider glow */}
                            <div className="card-bottom-glow" />
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Feed;
