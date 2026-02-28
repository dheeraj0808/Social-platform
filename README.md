<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</p>

# 🚀 Social Platform

A full-stack social media platform built with **React**, **Node.js**, **Express**, and **MySQL**. Features a premium dark-themed UI with glassmorphism effects, multi-image carousel posts, real-time interactions, and a comprehensive REST API.

> **Created by [Dheeraj Singh](https://github.com/dheeraj0808)**

---

## ✨ Features

### Frontend
- 🎨 **Premium Dark UI** — Glassmorphism, mesh gradients, and micro-animations
- 📸 **Multi-Image Posts** — Upload up to 5 images with carousel viewer
- ❤️ **Double-Tap to Like** — Instagram-style heart burst animation
- 💬 **Real-Time Comments** — Threaded comment system with emoji support 😄
- 🔖 **Save/Bookmark Posts** — Persistent save collection
- 📖 **Instagram Stories UI** — Story rings with rainbow gradients and viewer modal
- 🔔 **Notifications** — Bell icon with badge + dropdown panel
- 👤 **User Profiles** — Stats, bio, post grid with hover overlays
- 🔍 **Search & Explore** — Search posts, filter by trending tags
- 📱 **Responsive Design** — Mobile-optimized with bottom sheets
- 🌈 **Smooth Animations** — Toast alerts, skeleton loaders, fade-in transitions

### Backend
- 🔐 **Authentication** — Register & Login (simulated, extendable to JWT)
- 📝 **CRUD Posts** — Create, Read, Delete with multi-image support
- ❤️ **Like System** — Toggle likes with automatic notification
- 💬 **Comments** — Add, list, and delete comments with emoji support
- 🔖 **Save System** — Toggle bookmark/save on any post
- 👥 **Follow System** — Follow/unfollow users with notifications
- 🔔 **Notifications** — Auto-generated for likes, comments, and follows
- 👤 **User Profiles** — View profile with stats, update bio/name/website
- ☁️ **Cloud Storage** — Image uploads via ImageKit CDN

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, React Router 7, Axios, Vite 7 |
| **Backend** | Node.js, Express 5, CommonJS |
| **Database** | MySQL (utf8mb4 for emoji support) |
| **Storage** | ImageKit (cloud image CDN) |
| **Styling** | Vanilla CSS with CSS Custom Properties |
| **Dev Tools** | Nodemon, ESLint, Vite HMR |

---

## 📁 Project Structure

```
social-platform/
├── Backend/
│   ├── server.js                    # Entry point — DB init + server start
│   ├── package.json
│   ├── .env                         # Environment variables (gitignored)
│   ├── .env.example                 # Template for env vars
│   └── src/
│       ├── app.js                   # Express app — middleware + routes
│       ├── db/
│       │   └── db.js                # MySQL connection + query helper
│       ├── Models/
│       │   ├── User.model.js        # users table
│       │   ├── Post.model.js        # posts + post_images tables
│       │   ├── Like.model.js        # post_likes table
│       │   ├── Comment.model.js     # post_comments table
│       │   ├── SavedPost.model.js   # saved_posts table
│       │   ├── Follow.model.js      # follows table
│       │   └── Notification.model.js # notifications table
│       ├── routes/
│       │   ├── auth.routes.js       # /auth/register, /auth/login
│       │   ├── post.routes.js       # /createPost, /getPosts, likes, comments, save
│       │   ├── user.routes.js       # /users/:id, follow, followers, following
│       │   └── notification.routes.js # /notifications/:userId
│       └── Services/
│           └── Storage.services.js  # ImageKit upload helper
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx                 # React entry point
│       ├── App.jsx                  # Root — auth gate, routing, toast system
│       ├── App.css                  # Global design system (CSS variables)
│       ├── Component/
│       │   ├── Header/
│       │   │   ├── Header.jsx       # Glassmorphism nav bar
│       │   │   └── Header.css
│       │   └── Footer/
│       │       ├── Footer.jsx       # Footer component
│       │       └── Footer.css
│       └── Pages/
│           ├── Auth.jsx             # Login/Register with animated orbs
│           ├── Auth.css
│           ├── Feed.jsx             # Main feed — stories, posts, sidebar
│           ├── Feed.css
│           ├── CreatePost.jsx       # Multi-image upload + publish
│           ├── CreatePost.css
│           ├── Profile.jsx          # User profile — stats, grid, modals
│           └── Profile.css
│
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** ≥ 18.x
- **MySQL** ≥ 5.7 (or MariaDB)
- **npm** ≥ 9.x
- An **[ImageKit](https://imagekit.io)** account (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/dheeraj0808/Social-platform.git
cd Social-platform
```

### 2. Set Up the Database

Create a MySQL database:

```sql
CREATE DATABASE ImagePost;
```

> The backend automatically creates all required tables on first startup.

### 3. Configure Environment Variables

```bash
cp Backend/.env.example Backend/.env
```

Edit `Backend/.env` with your values:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ImagePost
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
```

### 4. Install Dependencies & Start

**Backend:**

```bash
cd Backend
npm install
npm run dev      # Starts with nodemon on port 3000
```

**Frontend** (in a separate terminal):

```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on port 5173
```

### 5. Open the App

Navigate to **[http://localhost:5173](http://localhost:5173)** — register an account and start posting!

---

## 🔌 API Reference

Base URL: `http://localhost:3000`

### Authentication

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `POST` | `/auth/register` | Register a new user | `{ fullName, username, email }` |
| `POST` | `/auth/login` | Login by email | `{ email }` |

### Posts

| Method | Endpoint | Description | Body / Query |
|--------|----------|-------------|--------------|
| `POST` | `/createPost` | Create post with image | `FormData: image, caption` |
| `GET` | `/getPosts` | Get all posts (enriched) | `?search=keyword` |
| `DELETE` | `/posts/:id` | Delete a post (owner only) | Header: `x-user-id` |

### Interactions

| Method | Endpoint | Description | Header |
|--------|----------|-------------|--------|
| `POST` | `/posts/:id/like` | Toggle like | `x-user-id` |
| `GET` | `/posts/:id/comments` | Get post comments | — |
| `POST` | `/posts/:id/comments` | Add comment | `x-user-id`, `{ text }` |
| `DELETE` | `/comments/:id` | Delete comment | `x-user-id` |
| `POST` | `/posts/:id/save` | Toggle save/bookmark | `x-user-id` |

### Users

| Method | Endpoint | Description | Header / Body |
|--------|----------|-------------|---------------|
| `GET` | `/users/:id` | Get user profile + stats | `x-user-id` (optional) |
| `PUT` | `/users/:id` | Update profile | `{ full_name, bio, website }` |
| `POST` | `/users/:id/follow` | Toggle follow | `x-user-id` |
| `GET` | `/users/:id/followers` | List followers | — |
| `GET` | `/users/:id/following` | List following | — |
| `GET` | `/users/:id/saved` | Get saved posts | — |

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/notifications/:userId` | Get notifications + unread count |
| `PUT` | `/notifications/:userId/read-all` | Mark all as read |

---

## 🗄️ Database Schema

```
┌─────────────┐     ┌────────────────┐     ┌────────────────┐
│   users      │     │    posts       │     │  post_images   │
├─────────────┤     ├────────────────┤     ├────────────────┤
│ id (PK)     │←────│ user_id (FK)   │     │ id (PK)        │
│ full_name   │     │ id (PK)        │────→│ post_id (FK)   │
│ username    │     │ caption        │     │ image_url      │
│ email       │     │ created_at     │     │ sort_order     │
│ bio         │     └────────────────┘     └────────────────┘
│ website     │
│ created_at  │     ┌────────────────┐     ┌────────────────┐
└─────────────┘     │  post_likes    │     │ post_comments  │
                    ├────────────────┤     ├────────────────┤
                    │ id (PK)        │     │ id (PK)        │
                    │ post_id (FK)   │     │ post_id (FK)   │
                    │ user_id        │     │ user_id        │
                    │ created_at     │     │ comment_text   │
                    └────────────────┘     │ created_at     │
                                           └────────────────┘
┌─────────────┐     ┌────────────────┐
│   follows    │     │ saved_posts    │     ┌────────────────┐
├─────────────┤     ├────────────────┤     │ notifications  │
│ id (PK)     │     │ id (PK)        │     ├────────────────┤
│ follower_id │     │ post_id (FK)   │     │ id (PK)        │
│ following_id│     │ user_id        │     │ user_id        │
│ created_at  │     │ created_at     │     │ type (enum)    │
└─────────────┘     └────────────────┘     │ message        │
                                           │ is_read        │
                                           │ created_at     │
                                           └────────────────┘
```

> All text columns use `utf8mb4` charset for full emoji support 🎉

---

## 🎨 Design System

The frontend uses a custom CSS design system built with CSS Custom Properties:

| Token | Value | Purpose |
|-------|-------|---------|
| `--bg-primary` | `#06060e` | Page background |
| `--bg-card` | `rgba(12, 12, 26, 0.65)` | Card surfaces |
| `--accent-purple` | `#7c3aed` | Primary accent |
| `--accent-violet` | `#a78bfa` | Interactive elements |
| `--gradient-primary` | Purple → Indigo | Buttons & CTAs |
| `--gradient-text` | Violet → Lavender | Heading gradients |
| `--radius-lg` | `16px` | Card corners |
| `--blur` | `blur(16px)` | Glassmorphism |

---

## 🛣️ Roadmap

- [ ] JWT authentication with password hashing (bcrypt)
- [ ] Real-time chat / direct messaging (Socket.io)
- [ ] Story upload with image/video support
- [ ] Explore page with infinite scroll
- [ ] Post editing functionality
- [ ] User search with autocomplete
- [ ] Email verification
- [ ] Rate limiting & security headers
- [ ] Docker deployment setup
- [ ] CI/CD pipeline

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**.

---

<p align="center">
  Made with ❤️ by <strong>Dheeraj Singh</strong>
</p>
