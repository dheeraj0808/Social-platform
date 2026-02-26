import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import './Header.css';

/* ── Mock Notifications ──────────────────────────── */
const INITIAL_NOTIFICATIONS = [
    { id: 1, type: 'like', user: 'Alex', message: 'liked your post', time: '2m ago', avatar: 'A' },
    { id: 2, type: 'follow', user: 'Sarah', message: 'started following you', time: '15m ago', avatar: 'S' },
    { id: 3, type: 'comment', user: 'Mike', message: 'commented: "Amazing shot! 🔥"', time: '1h ago', avatar: 'M' },
    { id: 4, type: 'like', user: 'Emma', message: 'liked your post', time: '3h ago', avatar: 'E' },
    { id: 5, type: 'follow', user: 'James', message: 'started following you', time: '5h ago', avatar: 'J' },
    { id: 6, type: 'comment', user: 'Olivia', message: 'commented: "Love this! ❤️"', time: '1d ago', avatar: 'O' },
];

const Header = ({ user, onLogout, searchQuery, onSearchChange, showToast }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const searchInputRef = useRef(null);
    const searchDebounceRef = useRef(null);

    /* notifications state from localStorage */
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('notifications');
        return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    });

    const [readIds, setReadIds] = useState(() => {
        const saved = localStorage.getItem('notifReadIds');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('notifications', JSON.stringify(notifications));
    }, [notifications]);

    useEffect(() => {
        localStorage.setItem('notifReadIds', JSON.stringify(readIds));
    }, [readIds]);

    const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;

    const markAllRead = () => {
        setReadIds(notifications.map((n) => n.id));
        showToast('All notifications marked as read', 'info');
    };

    /* search debounce */
    const handleSearchInput = useCallback((val) => {
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = setTimeout(() => {
            onSearchChange(val);
        }, 300);
    }, [onSearchChange]);

    /* mobile search toggle */
    const toggleSearch = () => {
        setSearchOpen((p) => !p);
        if (!searchOpen) {
            setTimeout(() => searchInputRef.current?.focus(), 150);
        } else {
            onSearchChange('');
        }
    };

    /* close dropdowns on outside click */
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') {
                setMenuOpen(false);
                setNotifOpen(false);
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

    const getNotifIcon = (type) => {
        if (type === 'like') return '❤️';
        if (type === 'follow') return '👤';
        return '💬';
    };

    return (
        <header className="header" role="banner">
            <NavLink to="/" className="header-logo" aria-label="Home">
                <span className="logo-icon">📸</span>
                <h1>Social Platform</h1>
            </NavLink>

            {/* ── Desktop Search ─────────────────────────── */}
            <div className="header-search desktop-only">
                <svg className="search-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8888a8" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search posts, users..."
                    defaultValue={searchQuery}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    aria-label="Search posts"
                />
            </div>

            <nav className="header-nav" role="navigation">
                {/* Mobile Search Toggle */}
                <button className="nav-icon-btn mobile-only" onClick={toggleSearch} aria-label="Search" title="Search">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                </button>

                <NavLink to="/" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
                    <span className="btn-icon">🏠</span>
                    <span className="nav-label">Feed</span>
                </NavLink>

                <NavLink to="/create" className={({ isActive }) => `nav-btn create-btn ${isActive ? 'active' : ''}`}>
                    <span className="btn-icon">➕</span>
                    <span className="nav-label">Create</span>
                </NavLink>

                {/* ── Notifications ────────────────────────── */}
                <div className="notif-wrapper">
                    <button
                        className={`nav-icon-btn notif-btn ${notifOpen ? 'active' : ''}`}
                        onClick={() => { setNotifOpen(!notifOpen); setMenuOpen(false); }}
                        aria-label="Notifications"
                        title="Notifications"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 01-3.46 0" />
                        </svg>
                        {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                    </button>

                    {notifOpen && (
                        <>
                            <div className="menu-overlay" onClick={() => setNotifOpen(false)} />
                            <div className="notif-dropdown" role="dialog" aria-label="Notifications">
                                <div className="notif-dropdown-header">
                                    <h3>Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button className="mark-read-btn" onClick={markAllRead}>Mark all read</button>
                                    )}
                                </div>
                                <div className="notif-list">
                                    {notifications.length === 0 ? (
                                        <div className="notif-empty">
                                            <span>🔔</span>
                                            <p>No notifications yet</p>
                                        </div>
                                    ) : (
                                        notifications.map((n) => (
                                            <div key={n.id} className={`notif-item ${readIds.includes(n.id) ? 'read' : 'unread'}`}>
                                                <div className="notif-avatar">{n.avatar}</div>
                                                <div className="notif-body">
                                                    <p><strong>{n.user}</strong> {n.message}</p>
                                                    <span className="notif-time">{n.time}</span>
                                                </div>
                                                <span className="notif-type-icon">{getNotifIcon(n.type)}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* ── Profile ──────────────────────────────── */}
                <div className="profile-wrapper">
                    <button
                        className="profile-btn"
                        onClick={() => { setMenuOpen(!menuOpen); setNotifOpen(false); }}
                        title="Profile"
                        aria-label="Profile menu"
                    >
                        <div className="profile-avatar-ring">
                            <div className="profile-avatar">{user?.avatar || 'U'}</div>
                        </div>
                    </button>

                    {menuOpen && (
                        <>
                            <div className="menu-overlay" onClick={() => setMenuOpen(false)} />
                            <div className="profile-dropdown" role="dialog" aria-label="Profile menu">
                                <div className="dropdown-header">
                                    <div className="dropdown-avatar-ring">
                                        <div className="dropdown-avatar">{user?.avatar || 'U'}</div>
                                    </div>
                                    <div className="dropdown-info">
                                        <span className="dropdown-name">{user?.fullName || 'User'}</span>
                                        <span className="dropdown-handle">@{user?.username || 'user'}</span>
                                    </div>
                                </div>
                                <div className="dropdown-divider" />
                                <NavLink to="/profile" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    My Profile
                                </NavLink>
                                <NavLink to="/profile" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                                    </svg>
                                    Saved Posts
                                </NavLink>
                                <NavLink to="/profile" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="3" />
                                        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                                    </svg>
                                    Settings
                                </NavLink>
                                <div className="dropdown-divider" />
                                <button className="dropdown-item logout-item" onClick={onLogout}>
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

            {/* ── Mobile Search Bar (slide down) ────────── */}
            {searchOpen && (
                <div className="mobile-search-bar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8888a8" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search posts, users..."
                        defaultValue={searchQuery}
                        onChange={(e) => handleSearchInput(e.target.value)}
                        aria-label="Search posts"
                    />
                    <button className="mobile-search-close" onClick={toggleSearch} aria-label="Close search">✕</button>
                </div>
            )}
        </header>
    );
};

export default Header;
