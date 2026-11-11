# CampusConnect - College Networking Platform

CampusConnect is a production-level full-stack MERN application that serves as a networking platform exclusively for college students.

## Tech Stack
- MongoDB & Mongoose
- Express.js
- React (Vite) & Tailwind CSS
- Node.js
- Socket.io (Mock setup)
- JWT Authentication

## Running Locally

### 1. Setup Environment
In `server/.env`, configure your MongoDB URI. A default local running mongo address `mongodb://127.0.0.1:27017/campusconnect` is present.
Ensure MongoDB is running locally.

### 2. Run Backend
```bash
cd server
npm i
node server.js
```
The backend will run on `http://localhost:5000`

### 3. Run Frontend
Open a new terminal.
```bash
cd client
npm i
npm run dev
```
The frontend will run on the Vite default URL (usually `http://localhost:5173`)
