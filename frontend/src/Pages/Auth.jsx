import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css';

const API_BASE = 'http://localhost:3000';

const Auth = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
        setError('');
        setSuccess('');
    };

    const validateForm = () => {
        if (!isLogin && !formData.fullName.trim()) {
            setError('Please enter your full name');
            return false;
        }
        if (!isLogin && !formData.username.trim()) {
            setError('Please choose a username');
            return false;
        }
        if (!formData.email.trim()) {
            setError('Please enter your email');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }
        if (!formData.password) {
            setError('Please enter your password');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }
        if (!isLogin && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                // ── Login ──────────────────────────────────
                const res = await axios.post(`${API_BASE}/auth/login`, {
                    email: formData.email,
                    password: formData.password,
                });

                if (res.data.success && res.data.user) {
                    const user = {
                        id: res.data.user.id,
                        fullName: res.data.user.full_name,
                        username: res.data.user.username,
                        email: res.data.user.email,
                        bio: res.data.user.bio || '',
                        avatar: (res.data.user.full_name || 'U').charAt(0).toUpperCase(),
                    };
                    localStorage.setItem('user', JSON.stringify(user));
                    if (onLogin) onLogin(user);
                }
            } else {
                // ── Register ───────────────────────────────
                const res = await axios.post(`${API_BASE}/auth/register`, {
                    fullName: formData.fullName,
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                });

                if (res.data.success && res.data.user) {
                    const user = {
                        id: res.data.user.id,
                        fullName: res.data.user.full_name,
                        username: res.data.user.username,
                        email: res.data.user.email,
                        bio: res.data.user.bio || '',
                        avatar: (res.data.user.full_name || 'U').charAt(0).toUpperCase(),
                    };
                    localStorage.setItem('user', JSON.stringify(user));
                    setSuccess('Account created successfully! Logging you in...');
                    setTimeout(() => {
                        if (onLogin) onLogin(user);
                    }, 1000);
                }
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const switchMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setSuccess('');
        setFormData({
            fullName: '',
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
        });
        setShowPassword(false);
    };

    return (
        <div className="auth-page">
            {/* Animated Background */}
            <div className="auth-bg-orb orb-1" />
            <div className="auth-bg-orb orb-2" />
            <div className="auth-bg-orb orb-3" />

            <div className="auth-container">
                {/* Left Branding Panel */}
                <div className="auth-brand-panel">
                    <div className="brand-logo">📸</div>
                    <h1 className="brand-title">Social Platform</h1>
                    <p className="brand-tagline">
                        Share moments, connect with friends, and discover amazing content from around the world.
                    </p>
                    <div className="brand-features">
                        <div className="brand-feature">
                            <div className="feature-icon">🖼️</div>
                            <span>Share beautiful photos</span>
                        </div>
                        <div className="brand-feature">
                            <div className="feature-icon">💬</div>
                            <span>Connect with friends</span>
                        </div>
                        <div className="brand-feature">
                            <div className="feature-icon">❤️</div>
                            <span>Like & comment on posts</span>
                        </div>
                        <div className="brand-feature">
                            <div className="feature-icon">🚀</div>
                            <span>Discover trending content</span>
                        </div>
                    </div>
                </div>

                {/* Right Form Panel */}
                <div className="auth-form-panel">
                    <div className="auth-form-header">
                        <h2>{isLogin ? 'Welcome back' : 'Create account'}</h2>
                        <p>
                            {isLogin
                                ? 'Sign in to continue to your feed'
                                : 'Join the community and start sharing'}
                        </p>
                    </div>

                    {error && (
                        <div className="auth-error">
                            <span className="error-icon">⚠️</span>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="auth-success">
                            <span>✅</span>
                            {success}
                        </div>
                    )}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {/* Full Name - Only Signup */}
                        {!isLogin && (
                            <div className="form-field">
                                <label>
                                    <span className="field-icon">👤</span>
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    className="form-input"
                                    placeholder="Enter your full name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    autoComplete="name"
                                />
                            </div>
                        )}

                        {/* Username - Only Signup */}
                        {!isLogin && (
                            <div className="form-field">
                                <label>
                                    <span className="field-icon">@</span>
                                    Username
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    className="form-input"
                                    placeholder="Choose a username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    autoComplete="username"
                                />
                            </div>
                        )}

                        {/* Email */}
                        <div className="form-field">
                            <label>
                                <span className="field-icon">✉️</span>
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                className="form-input"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="email"
                            />
                        </div>

                        {/* Password */}
                        <div className="form-field">
                            <label>
                                <span className="field-icon">🔒</span>
                                Password
                            </label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    className="form-input"
                                    placeholder={isLogin ? 'Enter your password' : 'Create a password (min 6 chars)'}
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password - Only Signup */}
                        {!isLogin && (
                            <div className="form-field">
                                <label>
                                    <span className="field-icon">🔒</span>
                                    Confirm Password
                                </label>
                                <div className="password-wrapper">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        className="form-input"
                                        placeholder="Confirm your password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="auth-spinner" />
                            ) : (
                                <>
                                    <span className="btn-icon">{isLogin ? '🚀' : '✨'}</span>
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-divider">
                        <span>or</span>
                    </div>

                    <div className="auth-switch">
                        {isLogin ? "Don't have an account?" : 'Already have an account?'}
                        <button className="auth-switch-btn" onClick={switchMode}>
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </div>

                    {!isLogin && (
                        <p className="auth-terms">
                            By creating an account, you agree to our{' '}
                            <a href="#">Terms of Service</a> and{' '}
                            <a href="#">Privacy Policy</a>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Auth;
