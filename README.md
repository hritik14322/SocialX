# socialX - Mini Social Post Application

[![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20Express%20%7C%20MongoDB-blue?style=for-the-badge)](https://github.com/)

**socialX** is a responsive, modern full-stack Mini Social Application inspired by the Social Page of the **TaskPlanet** application. Built using **React.js**, **Node.js / Express.js**, and **MongoDB Atlas**, it strictly adheres to the requirement of using **ONLY TWO MongoDB COLLECTIONS** (`Users` and `Posts`) with embedded likes and comments.

---

## 🌟 Key Features

### 🎨 TaskPlanet Inspired UI/UX
- **Dark Theme Aesthetic**: Built with a sleek dark canvas (`#070D19`), rounded dark cards (`#111D35`), TaskPlanet blue accents (`#0066FF`), and gold rank badges (`Bronze`, `Gold`, `Legend`).
- **Header & Mobile Bottom Nav**: Responsive top app bar with coins counter (`50 ⭐️`), balance (`₹0.00`), dark mode icon, and profile ring. Includes sticky bottom navigation bar for mobile devices.
- **Feed Search & Filter Pills**: Instant search bar and filter tabs (*All Posts*, *For You*, *Most Liked*, *Most Commented*).

### 🔑 Authentication
- **Secure Auth**: JWT-based authentication with `bcryptjs` password hashing.
- **Signup & Login**: Input validation, duplicate email & username prevention, clean error alerts.
- **Protected Actions**: Auth middleware protecting post creation, like toggle, and comment submission.

### 📝 Create Post & Media Support
- **Flexible Post Creation**: Create posts with text-only, image-only, or text + image.
- **Image Upload & Preview**: Drag-and-drop file upload via `Multer` with real-time preview, or direct image URL input.
- **Validation**: Prevents publishing empty posts.

### ❤️ Instant Like System
- **Optimistic UI Updates**: Instant heart animation and like count updates without full page reloads.
- **Likers Modal**: Interactive dark modal displaying usernames of users who liked the post.

### 💬 Instant Comment System
- **Inline Comment Drawer**: Real-time comment submission with instant count badge updates.
- **Comment Management**: Comment author and post owner can delete comments.
- **Relative Timestamps**: Displays humanized timestamps (e.g. *"1 minute ago"*, *"2 hours ago"*).

---

## 🗄️ Database Architecture (2 Collections Constraint)

Strictly uses **only two MongoDB collections**:

```
socialX Database
├── 1. Users Collection
│   ├── _id (ObjectId)
│   ├── username (String, Unique)
│   ├── email (String, Unique)
│   ├── password (Hashed String)
│   ├── badge (Enum: Bronze, Gold, Legend)
│   └── createdAt (Date)
│
└── 2. Posts Collection
    ├── _id (ObjectId)
    ├── author (Ref to Users)
    ├── content (String)
    ├── image (String / Upload Path)
    ├── likes [Array of User ObjectIds]  <-- EMBEDDED
    ├── comments [                      <-- EMBEDDED
    │     {
    │       _id,
    │       user (Ref to User),
    │       username (String),
    │       text (String),
    │       createdAt (Date)
    │     }
    │   ]
    ├── createdAt (Date)
    └── updatedAt (Date)
```

---

## 📁 Project Structure

```
mini-social-app/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx / Navbar.css
│   │   │   ├── BottomNav.jsx / BottomNav.css
│   │   │   ├── CreatePostCard.jsx / CreatePostCard.css
│   │   │   ├── PostCard.jsx / PostCard.css
│   │   │   ├── PostFilterBar.jsx / PostFilterBar.css
│   │   │   ├── CommentSection.jsx / CommentSection.css
│   │   │   ├── LikersModal.jsx / LikersModal.css
│   │   │   ├── SkeletonLoader.jsx / SkeletonLoader.css
│   │   │   └── Toast.jsx / Toast.css
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── FeedPage.jsx / FeedPage.css
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   └── AuthPages.css
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   └── package.json
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── postController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   └── Post.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── postRoutes.js
│   ├── utils/
│   │   └── seed.js
│   ├── server.js
│   ├── test-api.js
│   ├── .env
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🔌 REST API Documentation

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Public | Register user (`username`, `email`, `password`) |
| `POST` | `/api/auth/login` | Public | Authenticate user (`email`, `password`) |
| `GET` | `/api/auth/me` | Protected | Fetch current user session |

### Post Routes (`/api/posts`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/posts` | Protected | Create post (`content`, `image` file or `imageUrl`) |
| `GET` | `/api/posts` | Public | Fetch feed posts (supports `page`, `limit`, `filter`) |
| `GET` | `/api/posts/:id` | Public | Fetch single post details |
| `DELETE`| `/api/posts/:id` | Protected | Delete owned post |
| `POST` | `/api/posts/:id/like` | Protected | Toggle Like/Unlike on post |
| `POST` | `/api/posts/:id/comments` | Protected | Add comment to post (`text`) |
| `GET` | `/api/posts/:id/comments` | Public | Get comments for post |
| `DELETE`| `/api/posts/:id/comments/:commentId` | Protected | Delete comment |

---

## 🛠️ Local Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account or local MongoDB instance

### 1. Clone & Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/socialX?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

Seed the database with sample TaskPlanet posts:
```bash
npm run seed
```

Start backend dev server:
```bash
npm run dev
```

### 2. Setup Frontend
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🚀 Deployment Guide

### Database: MongoDB Atlas
1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create database `socialX` and copy connection string into `MONGO_URI`.

### Backend: Render
1. Connect repository to [Render](https://render.com/).
2. Set Build Command: `npm install`
3. Set Start Command: `node server.js`
4. Environment variables: Add `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`.

### Frontend: Vercel / Netlify
1. Import project into [Vercel](https://vercel.com/).
2. Set Framework Preset: **Vite**
3. Set Environment Variable: `VITE_API_URL=https://your-backend.onrender.com/api`
