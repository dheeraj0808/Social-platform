import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreatePost.css';

const CreatePost = ({ onPost, fetchPosts }) => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [description, setDescription] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const handleImageChange = (file) => {
        if (file && file.type.startsWith('image/')) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        handleImageChange(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleImageChange(file);
    };

    const removeImage = () => {
        setImage(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image || !description.trim()) return;

        try {
            const formData = new FormData();
            formData.append('image', image);
            formData.append('caption', description.trim());

            await axios.post("http://localhost:3000/createPost", formData);

            if (fetchPosts) fetchPosts();
            setImage(null);
            setPreview(null);
            setDescription('');
            navigate('/');
        } catch (err) {
            console.log("Error creating post:", err.message);
        }
    };

    return (
        <div className="create-post-page">
            <div className="create-post-card">
                <div className="card-header">
                    <span className="card-icon">✍️</span>
                    <h2>Create New Post</h2>
                    <p className="card-subtitle">Share something amazing with the world</p>
                </div>

                <form onSubmit={handleSubmit} className="post-form">
                    {/* Image Upload Area */}
                    <div
                        className={`upload-zone ${isDragging ? 'dragging' : ''} ${preview ? 'has-preview' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => !preview && fileInputRef.current?.click()}
                    >
                        {preview ? (
                            <div className="preview-container">
                                <img src={preview} alt="Preview" className="image-preview" />
                                <button
                                    type="button"
                                    className="remove-btn"
                                    onClick={(e) => { e.stopPropagation(); removeImage(); }}
                                >
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <div className="upload-placeholder">
                                <div className="upload-icon">📷</div>
                                <p className="upload-text">Drag & drop an image here</p>
                                <p className="upload-hint">or click to browse</p>
                                <span className="upload-formats">JPG, PNG, GIF, WEBP</span>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileInput}
                            className="file-input"
                        />
                    </div>

                    {/* Description */}
                    <div className="input-group">
                        <label htmlFor="description" className="input-label">
                            <span>📝</span> Description
                        </label>
                        <textarea
                            id="description"
                            placeholder="Write something about your post..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="description-input"
                            rows={4}
                            maxLength={500}
                        />
                        <span className="char-count">{description.length}/500</span>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={`post-submit-btn ${image && description.trim() ? 'ready' : ''}`}
                        disabled={!image || !description.trim()}
                    >
                        <span className="btn-spark">🚀</span>
                        Publish Post
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;
