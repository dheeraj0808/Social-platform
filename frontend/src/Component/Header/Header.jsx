import React from 'react';
import { NavLink } from 'react-router-dom';
import './Header.css';

const Header = () => {
    return (
        <header className="header">
            <div className="header-logo">
                <span className="logo-icon">📸</span>
                <h1>PostApp</h1>
            </div>
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
            </nav>
        </header>
    );
};

export default Header;
