import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <p className="footer-text">
                    Made with <span className="heart">❤️</span> by <strong>Dheeraj Singh</strong>
                </p>
                <p className="footer-copy">&copy; {new Date().getFullYear()} All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
