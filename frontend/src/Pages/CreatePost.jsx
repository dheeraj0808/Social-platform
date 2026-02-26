import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreatePost.css';

const CreatePost = ({ onPost, fetchPosts, showToast, user }) => {
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [description, setDescription] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [previewIdx, setPreviewIdx] = useState(0);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const MAX_IMAGES = 5;

    const handleImageChange = (files) => {
        const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
        if (fileArray.length === 0) return;

        const remaining = MAX_IMAGES - images.length;
        const toAdd = fileArray.slice(0, remaining);
        if (toAdd.length < fileArray.length) {
            showToast(`Maximum ${MAX_IMAGES} images allowed`, 'info');
        }

        const newImages = [...images, ...toAdd];
        setImages(newImages);

        toAdd.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviews((prev) => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleFileInput = (e) => {
        handleImageChange(e.target.files);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        handleImageChange(e.dataTransfer.files);
    };

    const removeImage = (idx) => {
        setImages((prev) => prev.filter((_, i) => i !== idx));
        setPreviews((prev) => prev.filter((_, i) => i !== idx));
        if (previewIdx >= previews.length - 1 && previewIdx > 0) {
            setPreviewIdx(previewIdx - 1);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (images.length === 0 || !description.trim()) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', images[0]);
            formData.append('caption', description.trim());

            const response = await axios.post('http://localhost:3000/createPost', formData);

            /* Also add a local post with all images for carousel */
            const localPost = {
                id: response?.data?.post?.id || Date.now(),
                author: user?.fullName || 'User',
                username: user?.username || 'user',
                avatar: user?.avatar || 'U',
                image: previews[0],
                images: previews.length > 1 ? previews : undefined,
                description: description.trim(),
                caption: description.trim(),
                timestamp: new Date().toISOString(),
                likes: 0,
                comments: [],
            };

            if (onPost) onPost(localPost);
            if (fetchPosts) fetchPosts();

            setImages([]);
            setPreviews([]);
            setDescription('');
            setPreviewIdx(0);
            showToast('Post published! 🎉', 'success');
            navigate('/');
        } catch (err) {
            console.log('Error creating post:', err.message);
            showToast('Failed to publish post', 'error');
        } finally {
            setUploading(false);
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
                        className={`upload-zone ${isDragging ? 'dragging' : ''} ${previews.length > 0 ? 'has-preview' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => previews.length === 0 && fileInputRef.current?.click()}
                    >
                        {previews.length > 0 ? (
                            <div className="preview-container">
                                <img src={previews[previewIdx]} alt="Preview" className="image-preview" />
                                <button type="button" className="remove-btn" onClick={(e) => { e.stopPropagation(); removeImage(previewIdx); }} aria-label="Remove image">✕</button>

                                {/* Carousel controls for multi-image */}
                                {previews.length > 1 && (
                                    <>
                                        {previewIdx > 0 && (
                                            <button type="button" className="preview-nav prev" onClick={(e) => { e.stopPropagation(); setPreviewIdx((i) => i - 1); }}>‹</button>
                                        )}
                                        {previewIdx < previews.length - 1 && (
                                            <button type="button" className="preview-nav next" onClick={(e) => { e.stopPropagation(); setPreviewIdx((i) => i + 1); }}>›</button>
                                        )}
                                        <div className="preview-dots">
                                            {previews.map((_, i) => (
                                                <span key={i} className={`preview-dot ${i === previewIdx ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setPreviewIdx(i); }} />
                                            ))}
                                        </div>
                                    </>
                                )}

                                {/* Counter badge */}
                                <div className="image-counter">{previewIdx + 1}/{previews.length}</div>
                            </div>
                        ) : (
                            <div className="upload-placeholder">
                                <div className="upload-icon">📷</div>
                                <p className="upload-text">Drag & drop images here</p>
                                <p className="upload-hint">or click to browse</p>
                                <span className="upload-formats">JPG, PNG, GIF, WEBP · Up to {MAX_IMAGES} images</span>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileInput}
                            className="file-input"
                        />
                    </div>

                    {/* Add more images button */}
                    {previews.length > 0 && previews.length < MAX_IMAGES && (
                        <button type="button" className="add-more-btn" onClick={() => fileInputRef.current?.click()}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            Add more images ({previews.length}/{MAX_IMAGES})
                        </button>
                    )}

                    {/* Image thumbnails */}
                    {previews.length > 1 && (
                        <div className="image-thumbnails">
                            {previews.map((p, i) => (
                                <div key={i} className={`thumb ${i === previewIdx ? 'active' : ''}`} onClick={() => setPreviewIdx(i)}>
                                    <img src={p} alt={`Thumb ${i + 1}`} />
                                    <button type="button" className="thumb-remove" onClick={(e) => { e.stopPropagation(); removeImage(i); }}>✕</button>
                                </div>
                            ))}
                        </div>
                    )}

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
                        className={`post-submit-btn ${images.length > 0 && description.trim() ? 'ready' : ''}`}
                        disabled={images.length === 0 || !description.trim() || uploading}
                    >
                        {uploading ? (
                            <div className="upload-spinner" />
                        ) : (
                            <>
                                <span className="btn-spark">🚀</span>
                                Publish Post
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;
