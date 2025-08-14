# MERN Realtime Chat – Server

## Setup
```bash
cd server
cp .env.example .env
# edit .env if needed
npm install
npm run dev
```

- API: `GET /api/messages?room=general&limit=50`
- WS events:
  - Client -> Server: `chat:join` (roomName), `chat:message` ({ sender, text, room })
  - Server -> Client: `chat:system` (string), `chat:message` (message doc)

Make sure MongoDB is running locally or use MongoDB Atlas and set `MONGODB_URI`.
