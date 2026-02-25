import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Feed.css';

const Feed = ({ posts, onUpdatePost }) => {
    const navigate = useNavigate();
    const [likedPosts, setLikedPosts] = useState({});
    const [savedPosts, setSavedPosts] = useState({});
    const [doubleTapId, setDoubleTapId] = useState(null);
    const [expandedDescs, setExpandedDescs] = useState({});
    const [openComments, setOpenComments] = useState({});
    const [commentInputs, setCommentInputs] = useState({});
    const [shareToast, setShareToast] = useState(null);
    const commentInputRefs = useRef({});

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

    // Comment functions
    const toggleComments = (postId) => {
        setOpenComments((prev) => ({
            ...prev,
            [postId]: !prev[postId],
        }));
        // Focus the input when opening
        setTimeout(() => {
            if (!openComments[postId] && commentInputRefs.current[postId]) {
                commentInputRefs.current[postId].focus();
            }
        }, 100);
    };

    const handleCommentInput = (postId, value) => {
        setCommentInputs((prev) => ({
            ...prev,
            [postId]: value,
        }));
    };

    const submitComment = (postId) => {
        const text = (commentInputs[postId] || '').trim();
        if (!text) return;

        const post = posts.find((p) => p.id === postId);
        if (!post) return;

        const newComment = {
            id: Date.now(),
            author: 'You',
            text: text,
            timestamp: new Date().toISOString(),
        };

        const updatedPost = {
            ...post,
            comments: [...(post.comments || []), newComment],
        };

        onUpdatePost(updatedPost);
        setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    };

    const handleCommentKeyDown = (e, postId) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitComment(postId);
        }
    };

    // Share function
    const handleShare = (postId) => {
        const shareUrl = `${window.location.origin}/post/${postId}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            setShareToast(postId);
            setTimeout(() => setShareToast(null), 2000);
        }).catch(() => {
            // Fallback for clipboard failures
            setShareToast(postId);
            setTimeout(() => setShareToast(null), 2000);
        });
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
            {/* Share Toast Notification */}
            {shareToast && (
                <div className="share-toast">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Link copied to clipboard!
                </div>
            )}

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
                    {posts.map((post, index) => {
                        const postAuthor = post.author || 'User';
                        const postAvatar = post.avatar || postAuthor.charAt(0).toUpperCase();
                        const postDescription = post.description || post.caption || '';
                        const postTimestamp = post.timestamp || post.created_at;
                        const postLikes = post.likes || 0;
                        const postComments = post.comments || [];

                        return (
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
                                                {postAvatar}
                                            </div>
                                        </div>
                                        <div className="author-meta">
                                            <span className="author-name">{postAuthor}</span>
                                            <span className="post-time">{getTimeAgo(postTimestamp)}</span>
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
                                        <button
                                            className={`act-btn comment-btn ${openComments[post.id] ? 'active' : ''}`}
                                            onClick={() => toggleComments(post.id)}
                                            title="Comment"
                                        >
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={openComments[post.id] ? '#a78bfa' : '#c0c0d0'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                                            </svg>
                                        </button>
                                        <button
                                            className="act-btn share-btn"
                                            onClick={() => handleShare(post.id)}
                                            title="Share"
                                        >
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c0c0d0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="22" y1="2" x2="11" y2="13" />
                                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                            </svg>
                                            {shareToast === post.id && (
                                                <span className="share-copied-badge">Copied!</span>
                                            )}
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
                                    <strong>{postLikes + (likedPosts[post.id] ? 1 : 0)}</strong> likes
                                </div>

                                {/* Post Description */}
                                <div className="post-caption">
                                    <strong className="caption-author">{postAuthor}</strong>
                                    <span className={`caption-text ${expandedDescs[post.id] ? 'expanded' : ''}`}>
                                        {postDescription}
                                    </span>
                                    {postDescription.length > 80 && !expandedDescs[post.id] && (
                                        <button
                                            className="more-btn"
                                            onClick={() => toggleDesc(post.id)}
                                        >
                                            ...more
                                        </button>
                                    )}
                                </div>

                                {/* View All Comments Toggle */}
                                {postComments.length > 0 && !openComments[post.id] && (
                                    <button
                                        className="view-comments-btn"
                                        onClick={() => toggleComments(post.id)}
                                    >
                                        View all {postComments.length} comment{postComments.length > 1 ? 's' : ''}
                                    </button>
                                )}

                                {/* Comments Section */}
                                <div className={`comments-section ${openComments[post.id] ? 'open' : ''}`}>
                                    {openComments[post.id] && (
                                        <>
                                            {/* Comments List */}
                                            {postComments.length > 0 ? (
                                                <div className="comments-list">
                                                    {postComments.map((comment) => (
                                                        <div key={comment.id} className="comment-item">
                                                            <div className="comment-avatar">
                                                                {comment.author === 'You' ? '😊' : '👤'}
                                                            </div>
                                                            <div className="comment-body">
                                                                <strong className="comment-author">{comment.author}</strong>
                                                                <span className="comment-text">{comment.text}</span>
                                                                <span className="comment-time">{getTimeAgo(comment.timestamp)}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="no-comments">
                                                    <span>No comments yet. Be the first!</span>
                                                </div>
                                            )}

                                            {/* Comment Input */}
                                            <div className="comment-input-wrapper">
                                                <span className="comment-input-avatar">😊</span>
                                                <input
                                                    ref={(el) => (commentInputRefs.current[post.id] = el)}
                                                    type="text"
                                                    className="comment-input"
                                                    placeholder="Add a comment..."
                                                    value={commentInputs[post.id] || ''}
                                                    onChange={(e) => handleCommentInput(post.id, e.target.value)}
                                                    onKeyDown={(e) => handleCommentKeyDown(e, post.id)}
                                                />
                                                <button
                                                    className={`comment-post-btn ${(commentInputs[post.id] || '').trim() ? 'active' : ''}`}
                                                    onClick={() => submitComment(post.id)}
                                                    disabled={!(commentInputs[post.id] || '').trim()}
                                                >
                                                    Post
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Post Date */}
                                <div className="post-date">
                                    {new Date(postTimestamp).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                    })} · {getTimeAgo(postTimestamp)}
                                </div>

                                {/* Divider glow */}
                                <div className="card-bottom-glow" />
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Feed;
