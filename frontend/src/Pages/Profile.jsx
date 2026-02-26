import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

/* ═══════════════════════════════════════════════════
   EDIT PROFILE MODAL
   ═══════════════════════════════════════════════════ */
const EditProfileModal = ({ user, onSave, onClose }) => {
    const [form, setForm] = useState({
        fullName: user?.fullName || '',
        bio: user?.bio || '',
        website: user?.website || '',
    });

    const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        const updated = {
            ...user,
            fullName: form.fullName.trim() || user.fullName,
            bio: form.bio.trim(),
            website: form.website.trim(),
            avatar: (form.fullName.trim() || user.fullName).charAt(0).toUpperCase(),
        };
        onSave(updated);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose} role="dialog" aria-label="Edit profile">
            <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Edit Profile</h3>
                    <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="edit-form">
                    <div className="edit-field">
                        <label>Full Name</label>
                        <input type="text" name="fullName" value={form.fullName} onChange={handleChange} placeholder="Your name" />
                    </div>
                    <div className="edit-field">
                        <label>Bio</label>
                        <textarea name="bio" value={form.bio} onChange={handleChange} placeholder="Tell us about yourself..." rows={3} maxLength={150} />
                        <span className="field-counter">{form.bio.length}/150</span>
                    </div>
                    <div className="edit-field">
                        <label>Website</label>
                        <input type="text" name="website" value={form.website} onChange={handleChange} placeholder="https://yoursite.com" />
                    </div>
                    <button type="submit" className="edit-save-btn">Save Changes</button>
                </form>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════
   POST VIEWER MODAL
   ═══════════════════════════════════════════════════ */
const PostViewer = ({ post, onClose, onUpdatePost }) => {
    const [commentText, setCommentText] = useState('');
    const postComments = post.comments || [];

    const submitComment = () => {
        const text = commentText.trim();
        if (!text) return;
        const newComment = { id: Date.now(), author: 'You', text, timestamp: new Date().toISOString() };
        onUpdatePost({ ...post, comments: [...postComments, newComment] });
        setCommentText('');
    };

    return (
        <div className="modal-overlay" onClick={onClose} role="dialog" aria-label="Post viewer">
            <div className="modal-content post-viewer-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
                <div className="viewer-layout">
                    <div className="viewer-image">
                        <img src={post.image} alt="Post" />
                    </div>
                    <div className="viewer-details">
                        <div className="viewer-author">
                            <div className="viewer-avatar">{(post.author || 'U').charAt(0).toUpperCase()}</div>
                            <strong>{post.author || 'User'}</strong>
                        </div>
                        <p className="viewer-caption">{post.description || post.caption || ''}</p>
                        <div className="viewer-comments">
                            {postComments.length === 0 ? (
                                <p className="viewer-no-comments">No comments yet</p>
                            ) : (
                                postComments.map((c) => (
                                    <div key={c.id} className="viewer-comment">
                                        <strong>{c.author}</strong>
                                        <span>{c.text}</span>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="viewer-comment-input">
                            <input
                                type="text"
                                placeholder="Add a comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') submitComment(); }}
                            />
                            <button onClick={submitComment} disabled={!commentText.trim()} className={commentText.trim() ? 'active' : ''}>Post</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════
   MOCK HIGHLIGHTS
   ═══════════════════════════════════════════════════ */
const HIGHLIGHTS = [
    { id: 'h1', title: 'Travel', emoji: '✈️' },
    { id: 'h2', title: 'Food', emoji: '🍕' },
    { id: 'h3', title: 'Code', emoji: '💻' },
    { id: 'h4', title: 'Music', emoji: '🎵' },
    { id: 'h5', title: 'Pets', emoji: '🐶' },
];

/* ═══════════════════════════════════════════════════
   MAIN PROFILE COMPONENT
   ═══════════════════════════════════════════════════ */
const Profile = ({ posts, user, onUpdateUser, savedPostIds, onToggleSave, showToast, onUpdatePost }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('posts');
    const [editOpen, setEditOpen] = useState(false);
    const [viewerPost, setViewerPost] = useState(null);

    const displayName = user?.fullName || 'User';
    const handle = user?.username ? `@${user.username}` : user?.email || '';
    const avatarLetter = displayName.charAt(0).toUpperCase();
    const bio = user?.bio || 'Developer · Creator · Building cool stuff 🚀';
    const website = user?.website || '';

    const userPosts = posts;
    const savedPosts = useMemo(() => {
        return posts.filter((p) => savedPostIds.includes(p.id));
    }, [posts, savedPostIds]);

    const displayPosts = activeTab === 'posts' ? userPosts : savedPosts;

    return (
        <div className="profile-page">
            {/* ── Profile Header Card ──────────────────── */}
            <div className="profile-card">
                <div className="profile-cover">
                    <div className="cover-glow" />
                    <div className="cover-glow glow-right" />
                </div>
                <div className="profile-main">
                    <div className="profile-pic-ring">
                        <div className="profile-pic">{avatarLetter}</div>
                    </div>
                    <h2 className="profile-name">{displayName}</h2>
                    <p className="profile-handle">{handle}</p>
                    <p className="profile-bio">{bio}</p>
                    {website && (
                        <a href={website} target="_blank" rel="noopener noreferrer" className="profile-website">
                            🔗 {website.replace(/^https?:\/\//, '')}
                        </a>
                    )}

                    <div className="profile-stats">
                        <div className="stat-item">
                            <strong>{userPosts.length}</strong>
                            <span>Posts</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-item">
                            <strong>128</strong>
                            <span>Followers</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-item">
                            <strong>96</strong>
                            <span>Following</span>
                        </div>
                    </div>

                    <div className="profile-actions">
                        <button className="edit-profile-btn" onClick={() => setEditOpen(true)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z" />
                            </svg>
                            Edit Profile
                        </button>
                        <button className="share-profile-btn" onClick={() => { navigator.clipboard.writeText(window.location.href); showToast('Profile link copied!', 'success'); }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Highlights ───────────────────────────── */}
            <div className="highlights-row">
                {HIGHLIGHTS.map((h) => (
                    <div key={h.id} className="highlight-item" onClick={() => showToast(`${h.title} highlights coming soon!`, 'info')}>
                        <div className="highlight-circle">{h.emoji}</div>
                        <span>{h.title}</span>
                    </div>
                ))}
            </div>

            {/* ── Tabs ─────────────────────────────────── */}
            <div className="profile-tabs">
                <button className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                    </svg>
                    Posts
                </button>
                <button className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => setActiveTab('saved')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                    </svg>
                    Saved
                </button>
            </div>

            {/* ── Posts Grid ────────────────────────────── */}
            <div className="profile-posts-section">
                {displayPosts.length === 0 ? (
                    <div className="no-posts-profile">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4e4e66" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                            {activeTab === 'saved' ? (
                                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                            ) : (
                                <><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></>
                            )}
                        </svg>
                        <p>{activeTab === 'saved' ? 'No saved posts yet' : 'No posts yet'}</p>
                        <button className="create-first-btn" onClick={() => navigate(activeTab === 'saved' ? '/' : '/create')}>
                            {activeTab === 'saved' ? 'Browse feed to save posts' : 'Share your first photo'}
                        </button>
                    </div>
                ) : (
                    <div className="posts-grid">
                        {displayPosts.map((post) => (
                            <div key={post.id} className="grid-item" onClick={() => setViewerPost(post)}>
                                <img src={post.image} alt="Post" loading="lazy" />
                                <div className="grid-overlay">
                                    <div className="grid-stat">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" stroke="none">
                                            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                                        </svg>
                                        <span>{post.likes || 0}</span>
                                    </div>
                                    <div className="grid-stat">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" stroke="none">
                                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                                        </svg>
                                        <span>{(post.comments || []).length}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Modals ────────────────────────────────── */}
            {editOpen && (
                <EditProfileModal user={user} onSave={onUpdateUser} onClose={() => setEditOpen(false)} />
            )}
            {viewerPost && (
                <PostViewer post={viewerPost} onClose={() => setViewerPost(null)} onUpdatePost={onUpdatePost} />
            )}
        </div>
    );
};

export default Profile;
