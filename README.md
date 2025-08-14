# MERN Realtime Chat (Socket.IO)

A minimal practice project with:
- **MongoDB** (messages persistence)
- **Express** REST API
- **Socket.IO** realtime chat (rooms)
- **React (Vite)** client

## 1) Prerequisites
- Node.js 18+
- MongoDB (local) or MongoDB Atlas connection string

## 2) Run locally

### Server
```bash
cd server
cp .env.example .env
# tweak CLIENT_URL and MONGODB_URI if needed
npm install
npm run dev
```
Server defaults to http://localhost:3001

### Client
```bash
cd client
cp .env.example .env
# set VITE_SERVER_URL to your server URL if not default
npm install
npm run dev
```
Open the printed Vite URL (usually http://localhost:5173) and chat away in multiple browser tabs.

## 3) How it works
- Client connects to Socket.IO, joins a room (`chat:join`), and sends messages (`chat:message`).
- Server saves messages to MongoDB and broadcasts to everyone in the room.
- History loads via `GET /api/messages?room=general&limit=50`.

## 4) Deployment (quick path)
**Database:** Create a free MongoDB Atlas cluster. Get the connection string.

**Backend (Render/Railway/Fly/EC2):**
- Deploy the `server/` directory.
- Set env vars:
  - `PORT` (provided by host or 3001)
  - `CLIENT_URL` (your frontend URL, e.g., https://yourchat.vercel.app)
  - `MONGODB_URI` (Atlas URI)
- Open the service URL (e.g., https://your-api.onrender.com).

**Frontend (Vercel/Netlify):**
- Deploy the `client/` directory.
- Set env var:
  - `VITE_SERVER_URL` to your backend URL (e.g., https://your-api.onrender.com)
- Build. Visit the site, test chatting.

**CORS & Sockets:** Ensure `CLIENT_URL` matches your deployed frontend origin and `VITE_SERVER_URL` points to the deployed backend.

## 5) Next steps (nice practice extensions)
- Auth (JWT + protected rooms)
- Typing indicators / online presence
- Read receipts & delivered statuses
- Infinite scroll for history
- Private DMs (room = sorted user pair id)
- File/image messages (S3 or Cloudinary)
- Rate limiting & message sanitization
