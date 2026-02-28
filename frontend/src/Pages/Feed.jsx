import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Feed.css';

/* ═══════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════ */
const MOCK_STORIES = [
    { id: 's1', name: 'alex_dev', avatar: 'A', gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)', ringGradient: 'conic-gradient(from 0deg, #f59e0b, #ef4444, #f59e0b)' },
    { id: 's2', name: 'sarah_w', avatar: 'S', gradient: 'linear-gradient(135deg, #ec4899, #8b5cf6)', ringGradient: 'conic-gradient(from 0deg, #ec4899, #8b5cf6, #ec4899)' },
    { id: 's3', name: 'mike_r', avatar: 'M', gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)', ringGradient: 'conic-gradient(from 0deg, #06b6d4, #3b82f6, #06b6d4)' },
    { id: 's4', name: 'emma_k', avatar: 'E', gradient: 'linear-gradient(135deg, #10b981, #059669)', ringGradient: 'conic-gradient(from 0deg, #10b981, #059669, #10b981)' },
    { id: 's5', name: 'james_p', avatar: 'J', gradient: 'linear-gradient(135deg, #f97316, #facc15)', ringGradient: 'conic-gradient(from 0deg, #f97316, #facc15, #f97316)' },
    { id: 's6', name: 'olivia', avatar: 'O', gradient: 'linear-gradient(135deg, #e879f9, #7c3aed)', ringGradient: 'conic-gradient(from 0deg, #e879f9, #7c3aed, #e879f9)' },
    { id: 's7', name: 'noah_t', avatar: 'N', gradient: 'linear-gradient(135deg, #14b8a6, #06b6d4)', ringGradient: 'conic-gradient(from 0deg, #14b8a6, #06b6d4, #14b8a6)' },
];

const SUGGESTED_USERS = [
    { id: 'u1', name: 'Sarah Wilson', username: 'sarah_w', avatar: 'S', bio: 'Photographer 📸', mutualCount: 3, gradient: 'linear-gradient(135deg, #ec4899, #8b5cf6)' },
    { id: 'u2', name: 'Alex Chen', username: 'alex_dev', avatar: 'A', bio: 'Full-stack dev 💻', mutualCount: 5, gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)' },
    { id: 'u3', name: 'Emma Kim', username: 'emma_k', avatar: 'E', bio: 'Designer ✨', mutualCount: 2, gradient: 'linear-gradient(135deg, #10b981, #059669)' },
    { id: 'u4', name: 'Noah Taylor', username: 'noah_t', avatar: 'N', bio: 'Traveler 🌍', mutualCount: 1, gradient: 'linear-gradient(135deg, #14b8a6, #06b6d4)' },
];

const TRENDING_TAGS = [
    { tag: '#photography', posts: '12.4k' },
    { tag: '#coding', posts: '8.7k' },
    { tag: '#travel', posts: '15.2k' },
    { tag: '#design', posts: '6.3k' },
    { tag: '#nature', posts: '9.1k' },
    { tag: '#art', posts: '7.8k' },
    { tag: '#fitness', posts: '11.5k' },
    { tag: '#food', posts: '13.9k' },
];

/* story images - gradient placeholders */
const STORY_IMAGES = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
];

/* STORY EXPIRY: 24 hours */
const STORY_EXPIRY_MS = 24 * 60 * 60 * 1000;

/* ═══════════════════════════════════════════════════
   STORY UPLOAD MODAL
   ═══════════════════════════════════════════════════ */
const StoryUploadModal = ({ onClose, onUpload, user }) => {
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [storyText, setStoryText] = useState('');
    const [textPosition, setTextPosition] = useState('center'); // top, center, bottom
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) return;
        if (file.size > 10 * 1024 * 1024) return; // 10MB max
        setImage(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    };

    const handleSubmit = async () => {
        if (!imagePreview) return;
        setUploading(true);
        // Simulate a small delay for UX
        await new Promise((r) => setTimeout(r, 600));
        const story = {
            id: `user-story-${Date.now()}`,
            image: imagePreview,
            text: storyText.trim() || '',
            textPosition,
            timestamp: new Date().toISOString(),
            userName: user?.fullName || user?.username || 'You',
            userAvatar: user?.avatar || 'U',
        };
        onUpload(story);
        setUploading(false);
        onClose();
    };

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    return (
        <div className="story-upload-overlay" onClick={onClose} role="dialog" aria-label="Upload story">
            <div className="story-upload-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="story-upload-header">
                    <h3>Create Story</h3>
                    <button className="story-close-btn" onClick={onClose} aria-label="Close">✕</button>
                </div>

                <div className="story-upload-body">
                    {/* Left: Upload / Preview */}
                    <div className="story-upload-preview-area">
                        {!imagePreview ? (
                            <div
                                className={`story-dropzone ${dragActive ? 'drag-active' : ''}`}
                                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                                onDragLeave={() => setDragActive(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={(e) => handleFileSelect(e.target.files[0])}
                                />
                                <div className="dropzone-icon">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                        <polyline points="21 15 16 10 5 21" />
                                    </svg>
                                </div>
                                <p className="dropzone-title">Upload a photo</p>
                                <p className="dropzone-sub">Drag & drop or click to browse</p>
                                <span className="dropzone-hint">Max 10MB · JPG, PNG, WebP</span>
                            </div>
                        ) : (
                            <div className="story-preview-container">
                                <img src={imagePreview} alt="Story preview" className="story-preview-img" />
                                {storyText && (
                                    <div className={`story-text-overlay story-text-${textPosition}`}>
                                        <span>{storyText}</span>
                                    </div>
                                )}
                                <button className="story-change-img-btn" onClick={() => { setImage(null); setImagePreview(null); }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <polyline points="1 4 1 10 7 10" />
                                        <path d="M3.51 15a9 9 0 105.64-11.36L1 10" />
                                    </svg>
                                    Change
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right: Controls */}
                    {imagePreview && (
                        <div className="story-upload-controls">
                            <div className="story-control-group">
                                <label className="story-control-label">Add Text (optional)</label>
                                <input
                                    type="text"
                                    className="story-text-input"
                                    placeholder="What's on your mind?"
                                    value={storyText}
                                    onChange={(e) => setStoryText(e.target.value)}
                                    maxLength={120}
                                />
                                <span className="story-char-count">{storyText.length}/120</span>
                            </div>

                            <div className="story-control-group">
                                <label className="story-control-label">Text Position</label>
                                <div className="story-position-btns">
                                    {['top', 'center', 'bottom'].map((pos) => (
                                        <button
                                            key={pos}
                                            className={`pos-btn ${textPosition === pos ? 'active' : ''}`}
                                            onClick={() => setTextPosition(pos)}
                                        >
                                            {pos.charAt(0).toUpperCase() + pos.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                className={`story-share-btn ${uploading ? 'uploading' : ''}`}
                                onClick={handleSubmit}
                                disabled={uploading}
                            >
                                {uploading ? (
                                    <><span className="story-spinner" /> Sharing...</>
                                ) : (
                                    <>Share Story</>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════
   STORY VIEWER MODAL
   ═══════════════════════════════════════════════════ */
const StoryViewer = ({ stories, startIndex, onClose }) => {
    const [current, setCurrent] = useState(startIndex);
    const [progress, setProgress] = useState(0);
    const timerRef = useRef(null);
    const DURATION = 5000;

    /* Like state — persisted in localStorage */
    const [storyLikes, setStoryLikes] = useState(() => {
        try {
            const saved = localStorage.getItem('storyLikes');
            return saved ? JSON.parse(saved) : {};
        } catch { return {}; }
    });
    const [showHeartAnim, setShowHeartAnim] = useState(false);

    useEffect(() => {
        localStorage.setItem('storyLikes', JSON.stringify(storyLikes));
    }, [storyLikes]);

    const story = stories[current];
    const storyKey = story.id || `story-${current}`;

    /* Generate consistent mock like counts per story */
    const baseLikes = useMemo(() => {
        const counts = {};
        stories.forEach((s, i) => {
            const key = s.id || `story-${i}`;
            // Use a simple hash to get a consistent number per story
            const hash = key.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
            counts[key] = 12 + (hash % 180);
        });
        return counts;
    }, [stories]);

    const isLiked = !!storyLikes[storyKey];
    const likeCount = (baseLikes[storyKey] || 0) + (isLiked ? 1 : 0);

    const toggleLike = () => {
        setStoryLikes((prev) => {
            const next = { ...prev };
            if (next[storyKey]) {
                delete next[storyKey];
            } else {
                next[storyKey] = true;
            }
            return next;
        });
    };

    const handleDoubleTap = () => {
        if (!isLiked) {
            setStoryLikes((prev) => ({ ...prev, [storyKey]: true }));
        }
        setShowHeartAnim(true);
        setTimeout(() => setShowHeartAnim(false), 900);
    };

    useEffect(() => {
        setProgress(0);
        const start = Date.now();
        const tick = () => {
            const elapsed = Date.now() - start;
            const pct = Math.min((elapsed / DURATION) * 100, 100);
            setProgress(pct);
            if (pct < 100) {
                timerRef.current = requestAnimationFrame(tick);
            } else {
                goNext();
            }
        };
        timerRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(timerRef.current);
    }, [current]);

    const goNext = () => {
        if (current < stories.length - 1) setCurrent((c) => c + 1);
        else onClose();
    };
    const goPrev = () => {
        if (current > 0) setCurrent((c) => c - 1);
    };

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') goNext();
            if (e.key === 'ArrowLeft') goPrev();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [current]);

    /* Determine if this is a user-uploaded story (has .image) or a mock story */
    const isUserStory = !!story.image;

    return (
        <div className="story-viewer-overlay" onClick={onClose} role="dialog" aria-label="Story viewer">
            <div className="story-viewer" onClick={(e) => e.stopPropagation()}>
                {/* progress bars */}
                <div className="story-progress-bar">
                    {stories.map((_, i) => (
                        <div key={i} className="story-progress-track">
                            <div
                                className="story-progress-fill"
                                style={{ width: i < current ? '100%' : i === current ? `${progress}%` : '0%' }}
                            />
                        </div>
                    ))}
                </div>

                {/* header */}
                <div className="story-viewer-header">
                    <div className="story-viewer-user">
                        <div className="story-user-avatar" style={{ background: story.gradient || 'var(--gradient-primary)' }}>
                            {story.avatar || story.userAvatar || 'U'}
                        </div>
                        <span>{story.name || story.userName || 'You'}</span>
                        {story.timestamp && (
                            <span className="story-time-ago">{getTimeAgo(story.timestamp)}</span>
                        )}
                    </div>
                    <button className="story-close-btn" onClick={onClose} aria-label="Close story">✕</button>
                </div>

                {/* content */}
                {isUserStory ? (
                    <div className="story-content story-content-image" onDoubleClick={handleDoubleTap}>
                        <img src={story.image} alt="Story" className="story-full-image" />
                        {story.text && (
                            <div className={`story-text-overlay story-text-${story.textPosition || 'center'}`}>
                                <span>{story.text}</span>
                            </div>
                        )}
                        {showHeartAnim && <span className="story-heart-burst">❤️</span>}
                    </div>
                ) : (
                    <div className="story-content" style={{ background: STORY_IMAGES[current % STORY_IMAGES.length] }} onDoubleClick={handleDoubleTap}>
                        <div className="story-placeholder-text">
                            <span>📸</span>
                            <p>{story.name}'s story</p>
                        </div>
                        {showHeartAnim && <span className="story-heart-burst">❤️</span>}
                    </div>
                )}

                {/* footer: like + views */}
                <div className="story-footer">
                    <button className={`story-like-btn ${isLiked ? 'liked' : ''}`} onClick={toggleLike} aria-label="Like story">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill={isLiked ? '#ef4444' : 'none'} stroke={isLiked ? '#ef4444' : '#fff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                        </svg>
                        <span className="story-like-count">{likeCount}</span>
                    </button>
                    <button className="story-action-btn" onClick={() => { navigator.clipboard.writeText(window.location.href).catch(() => { }); }} aria-label="Share story">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    </button>
                </div>

                {/* tap zones */}
                <button className="story-tap story-tap-left" onClick={goPrev} aria-label="Previous story" />
                <button className="story-tap story-tap-right" onClick={goNext} aria-label="Next story" />
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════
   SKELETON LOADER
   ═══════════════════════════════════════════════════ */
const SkeletonPost = () => (
    <div className="post-card skeleton-card" aria-hidden="true">
        <div className="post-top">
            <div className="skeleton-row">
                <div className="skeleton skeleton-avatar" />
                <div className="skeleton-col">
                    <div className="skeleton skeleton-line-sm" />
                    <div className="skeleton skeleton-line-xs" />
                </div>
            </div>
        </div>
        <div className="skeleton skeleton-image" />
        <div className="skeleton-actions">
            <div className="skeleton skeleton-line-sm" />
        </div>
        <div className="skeleton skeleton-line-md" />
        <div className="skeleton skeleton-line-lg" />
    </div>
);

/* ═══════════════════════════════════════════════════
   POST OPTIONS MENU
   ═══════════════════════════════════════════════════ */
const PostMenu = ({ postId, isOwner, onCopyLink, onDelete, showToast }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="post-menu-wrapper">
            <button className="post-menu-btn" onClick={() => setOpen(!open)} title="More options" aria-label="Post options">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#8888a8">
                    <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
                </svg>
            </button>
            {open && (
                <>
                    <div className="menu-overlay" onClick={() => setOpen(false)} />
                    <div className="post-options-dropdown">
                        <button onClick={() => { onCopyLink(postId); setOpen(false); }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>
                            Copy Link
                        </button>
                        <button onClick={() => { showToast('Post reported', 'info'); setOpen(false); }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg>
                            Report
                        </button>
                        {isOwner && (
                            <button className="delete-option" onClick={() => { onDelete(postId); setOpen(false); }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                                Delete
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════
   CAROUSEL
   ═══════════════════════════════════════════════════ */
const ImageCarousel = ({ images, postId, onDoubleTap, doubleTapId }) => {
    const [idx, setIdx] = useState(0);
    const imgs = Array.isArray(images) ? images : [images];

    return (
        <div className="carousel-wrapper" onDoubleClick={() => onDoubleTap(postId)}>
            <img src={imgs[idx]} alt="Post" className="post-image" loading="lazy" />
            <div className="image-overlay" />
            {doubleTapId === postId && (
                <div className="double-tap-heart">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="#ef4444" stroke="none">
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                    </svg>
                </div>
            )}
            {imgs.length > 1 && (
                <>
                    {idx > 0 && (
                        <button className="carousel-btn carousel-prev" onClick={(e) => { e.stopPropagation(); setIdx((i) => i - 1); }} aria-label="Previous image">‹</button>
                    )}
                    {idx < imgs.length - 1 && (
                        <button className="carousel-btn carousel-next" onClick={(e) => { e.stopPropagation(); setIdx((i) => i + 1); }} aria-label="Next image">›</button>
                    )}
                    <div className="carousel-dots">
                        {imgs.map((_, i) => (
                            <span key={i} className={`carousel-dot ${i === idx ? 'active' : ''}`} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════
   COMMENT with mentions + reactions
   ═══════════════════════════════════════════════════ */
const CommentItem = ({ comment }) => {
    const [liked, setLiked] = useState(false);

    const renderText = (text) => {
        const parts = text.split(/(@\w+)/g);
        return parts.map((part, i) =>
            part.startsWith('@') ? <span key={i} className="mention-highlight">{part}</span> : part
        );
    };

    return (
        <div className="comment-item">
            <div className="comment-avatar">{comment.author === 'You' ? '😊' : '👤'}</div>
            <div className="comment-body">
                <strong className="comment-author">{comment.author}</strong>
                <span className="comment-text">{renderText(comment.text)}</span>
                <div className="comment-meta">
                    <span className="comment-time">{getTimeAgo(comment.timestamp)}</span>
                    <button
                        className={`comment-react-btn ${liked ? 'liked' : ''}`}
                        onClick={() => setLiked(!liked)}
                        aria-label={liked ? 'Unlike comment' : 'Like comment'}
                    >
                        {liked ? '❤️' : '🤍'}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════ */
function getTimeAgo(timestamp) {
    const now = new Date();
    const d = new Date(timestamp);
    const diffMs = now - d;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

/* ═══════════════════════════════════════════════════
   MAIN FEED COMPONENT
   ═══════════════════════════════════════════════════ */
const Feed = ({ posts, loading, onUpdatePost, onDeletePost, searchQuery, savedPostIds, onToggleSave, showToast, user }) => {
    const navigate = useNavigate();
    const [likedPosts, setLikedPosts] = useState({});
    const [doubleTapId, setDoubleTapId] = useState(null);
    const [expandedDescs, setExpandedDescs] = useState({});
    const [openComments, setOpenComments] = useState({});
    const [commentInputs, setCommentInputs] = useState({});
    const commentInputRefs = useRef({});

    /* stories */
    const [storyViewerOpen, setStoryViewerOpen] = useState(false);
    const [storyStartIdx, setStoryStartIdx] = useState(0);
    const [storyUploadOpen, setStoryUploadOpen] = useState(false);
    const [userStories, setUserStories] = useState(() => {
        try {
            const saved = localStorage.getItem('userStories');
            if (!saved) return [];
            const stories = JSON.parse(saved);
            // Filter out expired stories (> 24h)
            return stories.filter((s) => (Date.now() - new Date(s.timestamp).getTime()) < STORY_EXPIRY_MS);
        } catch {
            return [];
        }
    });

    /* Persist user stories to localStorage */
    useEffect(() => {
        localStorage.setItem('userStories', JSON.stringify(userStories));
    }, [userStories]);

    /* Computed: all stories (user first, then mock) */
    const allStories = useMemo(() => [...userStories, ...MOCK_STORIES], [userStories]);

    const handleStoryUpload = (story) => {
        setUserStories((prev) => [story, ...prev]);
        showToast('Story shared! 🎉', 'success');
    };

    const handleDeleteUserStory = (storyId) => {
        setUserStories((prev) => prev.filter((s) => s.id !== storyId));
        showToast('Story deleted', 'info');
    };

    /* sidebar */
    const [followedUsers, setFollowedUsers] = useState(() => {
        const s = localStorage.getItem('followedUsers');
        return s ? JSON.parse(s) : [];
    });
    const [activeTag, setActiveTag] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    /* scroll to top */
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        localStorage.setItem('followedUsers', JSON.stringify(followedUsers));
    }, [followedUsers]);

    useEffect(() => {
        const onScroll = () => setShowScrollTop(window.scrollY > 500);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const toggleFollow = (userId) => {
        setFollowedUsers((prev) => {
            const exists = prev.includes(userId);
            if (exists) {
                showToast('Unfollowed', 'info');
                return prev.filter((id) => id !== userId);
            }
            showToast('Following!', 'success');
            return [...prev, userId];
        });
    };

    /* ── Post interactions ────────────────────────── */
    const toggleLike = (postId) => setLikedPosts((p) => ({ ...p, [postId]: !p[postId] }));

    const handleDoubleTap = (postId) => {
        if (!likedPosts[postId]) setLikedPosts((p) => ({ ...p, [postId]: true }));
        setDoubleTapId(postId);
        setTimeout(() => setDoubleTapId(null), 900);
    };

    const toggleDesc = (postId) => setExpandedDescs((p) => ({ ...p, [postId]: !p[postId] }));

    const toggleComments = (postId) => {
        setOpenComments((p) => ({ ...p, [postId]: !p[postId] }));
        setTimeout(() => {
            if (!openComments[postId] && commentInputRefs.current[postId]) {
                commentInputRefs.current[postId].focus();
            }
        }, 100);
    };

    const handleCommentInput = (postId, value) => setCommentInputs((p) => ({ ...p, [postId]: value }));

    const submitComment = (postId) => {
        const text = (commentInputs[postId] || '').trim();
        if (!text) return;
        const post = posts.find((p) => p.id === postId);
        if (!post) return;
        const newComment = { id: Date.now(), author: 'You', text, timestamp: new Date().toISOString() };
        onUpdatePost({ ...post, comments: [...(post.comments || []), newComment] });
        setCommentInputs((p) => ({ ...p, [postId]: '' }));
    };

    const handleCommentKeyDown = (e, postId) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment(postId); }
    };

    const handleCopyLink = (postId) => {
        const url = `${window.location.origin}/post/${postId}`;
        navigator.clipboard.writeText(url).catch(() => { });
        showToast('Link copied!', 'success');
    };

    /* ── Filtered posts ───────────────────────────── */
    const filteredPosts = useMemo(() => {
        let result = posts;
        const q = (searchQuery || '').toLowerCase().trim();
        if (q) {
            result = result.filter((p) => {
                const author = (p.author || '').toLowerCase();
                const username = (p.username || '').toLowerCase();
                const caption = (p.description || p.caption || '').toLowerCase();
                return author.includes(q) || username.includes(q) || caption.includes(q);
            });
        }
        if (activeTag) {
            const tag = activeTag.toLowerCase();
            result = result.filter((p) => {
                const caption = (p.description || p.caption || '').toLowerCase();
                return caption.includes(tag);
            });
        }
        return result;
    }, [posts, searchQuery, activeTag]);

    const openStory = (idx) => {
        setStoryStartIdx(idx);
        setStoryViewerOpen(true);
    };

    const handleYourStoryClick = () => {
        if (userStories.length > 0) {
            // View user's own stories
            openStory(0);
        } else {
            setStoryUploadOpen(true);
        }
    };

    /* ═══════════════════════════════════════════════ */
    return (
        <div className="feed-layout">
            {/* ── Main Feed Column ──────────────────────── */}
            <div className="feed-page">

                {/* ── Stories Row ─────────────────────────── */}
                <div className="stories-row" role="region" aria-label="Stories">
                    <div className="stories-scroll">
                        {/* Your story — tap to upload or view */}
                        <button className="story-tile your-story" onClick={handleYourStoryClick}>
                            <div className={`story-ring ${userStories.length > 0 ? '' : 'your-story-ring'}`}
                                style={userStories.length > 0 ? { background: 'conic-gradient(from 0deg, #8b5cf6, #ec4899, #8b5cf6)' } : {}}>
                                {userStories.length > 0 && userStories[0].image ? (
                                    <img src={userStories[0].image} alt="Your story" className="story-avatar-img" />
                                ) : (
                                    <div className="story-avatar-inner">{user?.avatar || 'U'}</div>
                                )}
                                {userStories.length === 0 && <div className="your-story-plus">+</div>}
                            </div>
                            <span className="story-name">{userStories.length > 0 ? 'Your Story' : 'Add Story'}</span>
                        </button>
                        {/* Add new story button (shown when user already has stories) */}
                        {userStories.length > 0 && (
                            <button className="story-tile add-story-tile" onClick={() => setStoryUploadOpen(true)}>
                                <div className="story-ring your-story-ring">
                                    <div className="story-avatar-inner story-add-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round">
                                            <line x1="12" y1="5" x2="12" y2="19" />
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                        </svg>
                                    </div>
                                </div>
                                <span className="story-name">New</span>
                            </button>
                        )}
                        {/* Other stories */}
                        {MOCK_STORIES.map((s, i) => (
                            <button key={s.id} className="story-tile" onClick={() => openStory(userStories.length + i)}>
                                <div className="story-ring" style={{ background: s.ringGradient || s.gradient }}>
                                    <div className="story-avatar-inner" style={{ background: s.gradient }}>
                                        <span className="story-avatar-letter">{s.avatar}</span>
                                    </div>
                                </div>
                                <span className="story-name">{s.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Search Results Count ────────────────── */}
                {searchQuery && (
                    <div className="search-results-bar">
                        <span>🔍 {filteredPosts.length} result{filteredPosts.length !== 1 ? 's' : ''} for "{searchQuery}"</span>
                        <button onClick={() => window.dispatchEvent(new CustomEvent('clearSearch'))} className="clear-search-btn">Clear</button>
                    </div>
                )}

                {activeTag && (
                    <div className="search-results-bar tag-filter-bar">
                        <span>🏷️ Filtering by {activeTag}</span>
                        <button onClick={() => setActiveTag(null)} className="clear-search-btn">Clear</button>
                    </div>
                )}

                {/* ── Feed Top Bar ────────────────────────── */}
                <div className="feed-top-bar">
                    <div className="feed-header-section">
                        <h2 className="feed-title">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#feedGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.4rem' }}>
                                <defs><linearGradient id="feedGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#c4b5fd" /><stop offset="100%" stopColor="#8b5cf6" /></linearGradient></defs>
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
                            </svg>
                            Your Feed
                        </h2>
                        <p className="feed-subtitle">
                            {filteredPosts.length > 0
                                ? `${filteredPosts.length} post${filteredPosts.length > 1 ? 's' : ''} shared`
                                : 'No posts yet — be the first to share!'}
                        </p>
                    </div>
                    {/* mobile sidebar toggle */}
                    <button className="sidebar-toggle mobile-only-flex" onClick={() => setSidebarOpen(true)} aria-label="Open suggested users">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>
                    </button>
                </div>

                {/* ── Loading Skeletons ───────────────────── */}
                {loading && posts.length === 0 && (
                    <div className="posts-container">
                        <SkeletonPost /><SkeletonPost /><SkeletonPost />
                    </div>
                )}

                {/* ── Empty / No Results ──────────────────── */}
                {!loading && filteredPosts.length === 0 && (
                    <div className="empty-feed">
                        <div className="empty-glow" /><div className="empty-glow glow-2" />
                        <div className="empty-illustration">
                            <div className="illust-circle">
                                {searchQuery || activeTag ? (
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                                ) : (
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                                )}
                            </div>
                        </div>
                        <h3>{searchQuery || activeTag ? 'No Results Found' : 'No Posts Yet'}</h3>
                        <p>{searchQuery || activeTag ? 'Try a different search or filter.' : 'Your feed is waiting for its first moment. Create a post and start sharing!'}</p>
                        {!searchQuery && !activeTag && (
                            <button className="empty-cta" onClick={() => navigate('/create')}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                Create Your First Post
                            </button>
                        )}
                    </div>
                )}

                {/* ── Posts ───────────────────────────────── */}
                {filteredPosts.length > 0 && (
                    <div className="posts-container">
                        {filteredPosts.map((post, index) => {
                            const postAuthor = post.author || 'User';
                            const postAvatar = post.avatar || postAuthor.charAt(0).toUpperCase();
                            const postDescription = post.description || post.caption || '';
                            const postTimestamp = post.timestamp || post.created_at;
                            const postLikes = post.likes || 0;
                            const postComments = post.comments || [];
                            const postImages = post.images || post.image;
                            const isSaved = savedPostIds.includes(post.id);
                            const isOwner = (post.author === user?.fullName) || (post.username === user?.username);

                            return (
                                <article key={post.id} className="post-card" style={{ animationDelay: `${index * 0.06}s` }}>
                                    {/* Post Header */}
                                    <div className="post-top">
                                        <div className="post-author">
                                            <div className="avatar-ring"><div className="avatar-inner">{postAvatar}</div></div>
                                            <div className="author-meta">
                                                <span className="author-name">{postAuthor}</span>
                                                <span className="post-time">{getTimeAgo(postTimestamp)}</span>
                                            </div>
                                        </div>
                                        <PostMenu postId={post.id} isOwner={isOwner} onCopyLink={handleCopyLink} onDelete={onDeletePost} showToast={showToast} />
                                    </div>

                                    {/* Post Image / Carousel */}
                                    <ImageCarousel images={postImages} postId={post.id} onDoubleTap={handleDoubleTap} doubleTapId={doubleTapId} />

                                    {/* Post Actions */}
                                    <div className="post-actions-bar">
                                        <div className="actions-left">
                                            <button className={`act-btn like-btn ${likedPosts[post.id] ? 'liked' : ''}`} onClick={() => toggleLike(post.id)} title="Like" aria-label={likedPosts[post.id] ? 'Unlike' : 'Like'}>
                                                {likedPosts[post.id] ? (
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#ef4444" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                                                ) : (
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c0c0d0" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                                                )}
                                            </button>
                                            <button className={`act-btn comment-btn ${openComments[post.id] ? 'active' : ''}`} onClick={() => toggleComments(post.id)} title="Comment" aria-label="Comment">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={openComments[post.id] ? '#a78bfa' : '#c0c0d0'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                                            </button>
                                            <button className="act-btn share-btn" onClick={() => handleCopyLink(post.id)} title="Share" aria-label="Share">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c0c0d0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                                            </button>
                                        </div>
                                        <button className={`act-btn save-btn ${isSaved ? 'saved' : ''}`} onClick={() => onToggleSave(post.id)} title="Save" aria-label={isSaved ? 'Unsave' : 'Save'}>
                                            {isSaved ? (
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="#c4b5fd" stroke="none"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>
                                            ) : (
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c0c0d0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>
                                            )}
                                        </button>
                                    </div>

                                    {/* Like Count */}
                                    <div className="likes-count">
                                        <strong>{postLikes + (likedPosts[post.id] ? 1 : 0)}</strong> likes
                                    </div>

                                    {/* Caption */}
                                    <div className="post-caption">
                                        <strong className="caption-author">{postAuthor}</strong>
                                        <span className={`caption-text ${expandedDescs[post.id] ? 'expanded' : ''}`}>{postDescription}</span>
                                        {postDescription.length > 80 && !expandedDescs[post.id] && (
                                            <button className="more-btn" onClick={() => toggleDesc(post.id)}>...more</button>
                                        )}
                                    </div>

                                    {/* View comments toggle */}
                                    {postComments.length > 0 && !openComments[post.id] && (
                                        <button className="view-comments-btn" onClick={() => toggleComments(post.id)}>
                                            View all {postComments.length} comment{postComments.length > 1 ? 's' : ''}
                                        </button>
                                    )}

                                    {/* Comments Section */}
                                    <div className={`comments-section ${openComments[post.id] ? 'open' : ''}`}>
                                        {openComments[post.id] && (
                                            <>
                                                {postComments.length > 0 ? (
                                                    <div className="comments-list">
                                                        {postComments.map((c) => <CommentItem key={c.id} comment={c} />)}
                                                    </div>
                                                ) : (
                                                    <div className="no-comments"><span>No comments yet. Be the first!</span></div>
                                                )}
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
                                                        aria-label="Add a comment"
                                                    />
                                                    <button
                                                        className={`comment-post-btn ${(commentInputs[post.id] || '').trim() ? 'active' : ''}`}
                                                        onClick={() => submitComment(post.id)}
                                                        disabled={!(commentInputs[post.id] || '').trim()}
                                                    >Post</button>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Post Date */}
                                    <div className="post-date">
                                        {new Date(postTimestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {getTimeAgo(postTimestamp)}
                                    </div>

                                    <div className="card-bottom-glow" />
                                </article>
                            );
                        })}
                    </div>
                )}

                {/* ── Scroll to Top ──────────────────────── */}
                {showScrollTop && (
                    <button className="scroll-top-btn" onClick={scrollToTop} aria-label="Scroll to top" title="Back to top">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15" /></svg>
                    </button>
                )}
            </div>

            {/* ── Suggested Users Sidebar (Desktop) ─────── */}
            <aside className="suggested-sidebar desktop-sidebar" role="complementary" aria-label="Suggested for you">
                {/* Current user mini card */}
                <div className="sidebar-user-card">
                    <div className="sidebar-user-avatar">{user?.avatar || 'U'}</div>
                    <div className="sidebar-user-info">
                        <strong>{user?.fullName || 'User'}</strong>
                        <span>@{user?.username || 'user'}</span>
                    </div>
                    <button className="sidebar-switch-btn" onClick={() => { }}>Switch</button>
                </div>

                {/* Quick stats */}
                <div className="sidebar-stats-row">
                    <div className="stat-item"><strong>{posts?.length || 0}</strong><span>Posts</span></div>
                    <div className="stat-item"><strong>128</strong><span>Followers</span></div>
                    <div className="stat-item"><strong>96</strong><span>Following</span></div>
                </div>

                <div className="sidebar-section">
                    <div className="sidebar-section-header">
                        <h4>Suggested for you</h4>
                        <button className="see-all-btn">See All</button>
                    </div>
                    <div className="suggested-list">
                        {SUGGESTED_USERS.map((u) => (
                            <div key={u.id} className="suggested-item">
                                <div className="suggested-avatar" style={{ background: u.gradient }}>{u.avatar}</div>
                                <div className="suggested-info">
                                    <strong>{u.name}</strong>
                                    <span>{u.mutualCount} mutual friends</span>
                                </div>
                                <button
                                    className={`follow-btn ${followedUsers.includes(u.id) ? 'following' : ''}`}
                                    onClick={() => toggleFollow(u.id)}
                                >
                                    {followedUsers.includes(u.id) ? 'Following' : 'Follow'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="sidebar-section">
                    <h4>Trending Tags</h4>
                    <div className="trending-tags">
                        {TRENDING_TAGS.map((t) => (
                            <button
                                key={t.tag}
                                className={`tag-chip ${activeTag === t.tag ? 'active' : ''}`}
                                onClick={() => setActiveTag(activeTag === t.tag ? null : t.tag)}
                            >
                                {t.tag}
                                <span className="tag-count">{t.posts}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="sidebar-footer">
                    <p>© 2026 Social Platform · <a href="#">About</a> · <a href="#">Privacy</a> · <a href="#">Terms</a></p>
                </div>
            </aside>

            {/* ── Mobile Bottom Sheet Sidebar ──────────── */}
            {sidebarOpen && (
                <div className="sidebar-sheet-overlay" onClick={() => setSidebarOpen(false)}>
                    <div className="sidebar-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Discover">
                        <div className="sheet-handle" />
                        <h3>Discover</h3>

                        <div className="sidebar-section">
                            <h4>Suggested for you</h4>
                            <div className="suggested-list">
                                {SUGGESTED_USERS.map((u) => (
                                    <div key={u.id} className="suggested-item">
                                        <div className="suggested-avatar" style={{ background: u.gradient }}>{u.avatar}</div>
                                        <div className="suggested-info">
                                            <strong>{u.name}</strong>
                                            <span>{u.mutualCount} mutual friends</span>
                                        </div>
                                        <button className={`follow-btn ${followedUsers.includes(u.id) ? 'following' : ''}`} onClick={() => toggleFollow(u.id)}>
                                            {followedUsers.includes(u.id) ? 'Following' : 'Follow'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="sidebar-section">
                            <h4>Trending Tags</h4>
                            <div className="trending-tags">
                                {TRENDING_TAGS.map((t) => (
                                    <button key={t.tag} className={`tag-chip ${activeTag === t.tag ? 'active' : ''}`} onClick={() => { setActiveTag(activeTag === t.tag ? null : t.tag); setSidebarOpen(false); }}>
                                        {t.tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Story Upload Modal ────────────────────── */}
            {storyUploadOpen && (
                <StoryUploadModal
                    onClose={() => setStoryUploadOpen(false)}
                    onUpload={handleStoryUpload}
                    user={user}
                />
            )}

            {/* ── Story Viewer Modal ────────────────────── */}
            {storyViewerOpen && (
                <StoryViewer stories={allStories} startIndex={storyStartIdx} onClose={() => setStoryViewerOpen(false)} />
            )}
        </div>
    );
};

export default Feed;
