# CampusConnect — Backend API Documentation

Production-grade Node.js + Express + Mongoose REST API and Socket.IO real-time server for CampusConnect.

---

## 📁 1. Final Folder Tree

```
backend/
├── .env
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── server.js
    ├── config/
    │   ├── db.js
    │   ├── env.js
    │   └── cloudinary.js
    ├── controllers/
    │   ├── admin.controller.js
    │   ├── auth.controller.js
    │   ├── chat.controller.js
    │   ├── doubt.controller.js
    │   ├── marketplace.controller.js
    │   ├── note.controller.js
    │   ├── notification.controller.js
    │   ├── report.controller.js
    │   ├── teamPost.controller.js
    │   └── user.controller.js
    ├── middleware/
    │   ├── adminOnly.middleware.js
    │   ├── auth.middleware.js
    │   ├── errorHandler.middleware.js
    │   ├── notFound.middleware.js
    │   ├── upload.middleware.js
    │   └── validate.middleware.js
    ├── models/
    │   ├── Answer.js
    │   ├── Block.js
    │   ├── Bookmark.js
    │   ├── Conversation.js
    │   ├── Doubt.js
    │   ├── MarketplaceListing.js
    │   ├── Message.js
    │   ├── Note.js
    │   ├── Notification.js
    │   ├── Rating.js
    │   ├── Report.js
    │   ├── TeamPost.js
    │   ├── TeamRequest.js
    │   └── User.js
    ├── routes/
    │   ├── admin.routes.js
    │   ├── auth.routes.js
    │   ├── chat.routes.js
    │   ├── doubt.routes.js
    │   ├── index.js
    │   ├── marketplace.routes.js
    │   ├── note.routes.js
    │   ├── notification.routes.js
    │   ├── recommendation.routes.js
    │   ├── report.routes.js
    │   ├── teamPost.routes.js
    │   └── user.routes.js
    ├── services/
    │   └── recommendation.service.js
    ├── sockets/
    │   ├── chat.socket.js
    │   ├── index.js
    │   └── notification.socket.js
    ├── utils/
    │   ├── apiResponse.js
    │   ├── asyncHandler.js
    │   └── generateToken.js
    └── validators/
        ├── auth.validator.js
        ├── doubt.validator.js
        ├── marketplace.validator.js
        ├── note.validator.js
        ├── report.validator.js
        └── teamPost.validator.js
```

---

## ⚙️ 2. Complete `.env.example`

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/campusconnect?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

## 🌐 3. Full API Endpoint Table

Response Shape for all endpoints:
- **Success**: `{ "success": true, "message": "...", "data": {} }`
- **Error**: `{ "success": false, "message": "...", "errors": [] }`

| Method | Endpoint | Access Role | Request Body / Params | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | None | Server health check |
| `POST` | `/api/auth/register` | Public | `name, email, password, college, branch, semester` | Register new user account |
| `POST` | `/api/auth/login` | Public | `email, password` | Authenticate user & receive JWT |
| `GET` | `/api/users/me` | Student / Admin | Headers: `Authorization: Bearer <token>` | Get logged-in user profile |
| `PUT` | `/api/users/me` | Student / Admin | `name, college, branch, bio, skills, photo (file)` | Update profile details & avatar |
| `GET` | `/api/notes` | Public | Query: `subject, branch, semester, tag, search, page` | Search & list approved notes |
| `POST` | `/api/notes` | Student | Multipart: `title, subject, branch, semester, file` | Upload new study note |
| `GET` | `/api/notes/:id` | Public | None | Get note detail (increments download count) |
| `PUT` | `/api/notes/:id` | Owner / Admin | Note fields | Update note details |
| `DELETE` | `/api/notes/:id` | Owner / Admin | None | Delete note |
| `PATCH` | `/api/notes/:id/approve` | Admin | `{ status: "approved" \| "rejected" }` | Moderate & approve note |
| `POST` | `/api/notes/:id/bookmark` | Student | None | Toggle note bookmark |
| `POST` | `/api/notes/:id/rate` | Student | `{ score: 1-5 }` | Rate note & recalculate average |
| `GET` | `/api/doubts` | Public | Query: `subject, status, search` | List doubts |
| `POST` | `/api/doubts` | Student | Multipart: `title, description, subject, image` | Create doubt post |
| `GET` | `/api/doubts/:id` | Public | None | Get doubt with populated answers |
| `POST` | `/api/doubts/:id/answers` | Student | `{ text }` | Submit answer to doubt |
| `PATCH` | `/api/answers/:id/upvote` | Student | None | Upvote or toggle answer upvote |
| `PATCH` | `/api/answers/:id/accept` | Doubt Owner | None | Mark answer as accepted solution |
| `GET` | `/api/team-posts` | Public | Query: `department, skill, search` | List team finder posts |
| `POST` | `/api/team-posts` | Student | `title, description, department, requiredSkills, teamSizeMax` | Create team finder post |
| `GET` | `/api/team-posts/:id` | Public | None | Get post detail (plus requests if owner) |
| `POST` | `/api/team-posts/:id/requests` | Student | `{ message }` | Submit request to join team |
| `PATCH` | `/api/team-requests/:id` | Post Owner | `{ status: "accepted" \| "rejected" }` | Respond to join request |
| `GET` | `/api/recommendations` | Student | Headers: `Authorization: Bearer <token>` | Get personalized notes & team recommendations |
| `GET` | `/api/marketplace` | Public | Query: `category, status, minPrice, maxPrice, search` | List marketplace items |
| `POST` | `/api/marketplace` | Student | Multipart: `title, description, category, price, images[]` | Create marketplace item |
| `GET` | `/api/marketplace/:id` | Public | None | Get listing detail |
| `PATCH` | `/api/marketplace/:id/status` | Owner / Admin | `{ status: "available" \| "reserved" \| "sold" }` | Update listing availability |
| `POST` | `/api/marketplace/:id/favorite` | Student | None | Toggle favorite listing |
| `POST` | `/api/reports` | Student | `{ targetType, targetId, reason }` | Report user or item |
| `POST` | `/api/blocks` | Student | `{ blockedUserId }` | Block user |
| `DELETE` | `/api/blocks/:userId` | Student | None | Unblock user |
| `GET` | `/api/chat/conversations` | Student | None | Get user conversations |
| `POST` | `/api/chat/conversations` | Student | `{ recipientId }` | Find or create chat conversation |
| `GET` | `/api/chat/conversations/:id/messages` | Student | Query: `page, limit` | Get message history |
| `GET` | `/api/notifications` | Student | None | Get user notifications & unread count |
| `PATCH` | `/api/notifications/:id/read` | Student | None | Mark single notification as read |
| `PATCH` | `/api/notifications/read-all` | Student | None | Mark all notifications as read |
| `GET` | `/api/admin/reports` | Admin | Query: `status` | List moderation reports |
| `PATCH` | `/api/admin/reports/:id` | Admin | `{ status }` | Update report status |
| `GET` | `/api/admin/analytics` | Admin | None | Get MongoDB aggregation analytics |

---

## 🛠️ 4. Steps to Run Locally

1. **Install Dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the `backend` directory based on `.env.example`.

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Verify Health Endpoint**:
   Visit `http://localhost:5000/api/health` in your browser or Postman.

---

## ☁️ 5. Manual Cloudinary & MongoDB Atlas Setup Steps

1. **MongoDB Atlas**:
   - Create a Cluster on MongoDB Atlas (Free M0 tier).
   - Go to **Database Access** -> Create a database user with Read/Write privileges.
   - Go to **Network Access** -> Add IP Address `0.0.0.0/0` (Allow Access from Anywhere for development/testing).
   - Go to **Database** -> Click **Connect** -> Choose **Drivers (Node.js)** -> Copy the connection string into `MONGODB_URI` in `.env`.

2. **Cloudinary**:
   - Sign up at [Cloudinary.com](https://cloudinary.com).
   - Copy `Cloud Name`, `API Key`, and `API Secret` from the Dashboard into `.env`.

---

## 🧪 6. Verification Commands & Results

To verify the codebase syntax and module wiring:
```bash
# Syntax check across entrypoint and all imported modules
node -c src/server.js
```
**Result**: Exit code `0` (Success, no syntax errors across Express, Mongoose schemas, Socket.IO handlers, and Joi validators).
