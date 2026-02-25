import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = ({ posts, user }) => {
    const navigate = useNavigate();
    const displayName = user?.fullName || 'User';
    const handle = user?.username ? `@${user.username}` : user?.email || '';
    const avatarLetter = displayName.charAt(0).toUpperCase();
    const userPosts = posts;

    return (
        <div className="profile-page">
            {/* Profile Header Card */}
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
                    <p className="profile-bio">Developer · Creator · Building cool stuff 🚀</p>

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
                        <button className="edit-profile-btn">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z" />
                            </svg>
                            Edit Profile
                        </button>
                        <button className="share-profile-btn">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="18" cy="5" r="3" />
                                <circle cx="6" cy="12" r="3" />
                                <circle cx="18" cy="19" r="3" />
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Posts Grid */}
            <div className="profile-posts-section">
                <div className="section-header">
                    <h3>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7" />
                            <rect x="14" y="3" width="7" height="7" />
                            <rect x="14" y="14" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" />
                        </svg>
                        Posts
                    </h3>
                </div>

                {userPosts.length === 0 ? (
                    <div className="no-posts-profile">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4e4e66" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                        <p>No posts yet</p>
                        <button
                            className="create-first-btn"
                            onClick={() => navigate('/create')}
                        >
                            Share your first photo
                        </button>
                    </div>
                ) : (
                    <div className="posts-grid">
                        {userPosts.map((post) => (
                            <div key={post.id} className="grid-item" onClick={() => navigate('/')}>
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
        </div>
    );
};

export default Profile;
