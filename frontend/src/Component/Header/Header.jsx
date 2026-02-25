import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Header.css';

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="header">
            <NavLink to="/" className="header-logo">
                <span className="logo-icon">📸</span>
                <h1>Social Platform</h1>
            </NavLink>
            <nav className="header-nav">
                <NavLink
                    to="/"
                    className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
                >
                    <span className="btn-icon">🏠</span>
                    Feed
                </NavLink>
                <NavLink
                    to="/create"
                    className={({ isActive }) => `nav-btn create-btn ${isActive ? 'active' : ''}`}
                >
                    <span className="btn-icon">➕</span>
                    Create Post
                </NavLink>

                {/* Profile Section */}
                <div className="profile-wrapper">
                    <button
                        className="profile-btn"
                        onClick={() => setMenuOpen(!menuOpen)}
                        title="Profile"
                    >
                        <div className="profile-avatar-ring">
                            <div className="profile-avatar">D</div>
                        </div>
                    </button>

                    {/* Dropdown Menu */}
                    {menuOpen && (
                        <>
                            <div className="menu-overlay" onClick={() => setMenuOpen(false)} />
                            <div className="profile-dropdown">
                                <div className="dropdown-header">
                                    <div className="dropdown-avatar-ring">
                                        <div className="dropdown-avatar">D</div>
                                    </div>
                                    <div className="dropdown-info">
                                        <span className="dropdown-name">Dheeraj Singh</span>
                                        <span className="dropdown-handle">@dheeraj0808</span>
                                    </div>
                                </div>
                                <div className="dropdown-divider" />
                                <NavLink
                                    to="/profile"
                                    className="dropdown-item"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    My Profile
                                </NavLink>
                                <NavLink
                                    to="/profile"
                                    className="dropdown-item"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                                    </svg>
                                    Saved Posts
                                </NavLink>
                                <NavLink
                                    to="/profile"
                                    className="dropdown-item"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="3" />
                                        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                                    </svg>
                                    Settings
                                </NavLink>
                                <div className="dropdown-divider" />
                                <button className="dropdown-item logout-item">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                                        <polyline points="16 17 21 12 16 7" />
                                        <line x1="21" y1="12" x2="9" y2="12" />
                                    </svg>
                                    Log Out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;
