import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// --- STATELESS DATABASE ---
// The server only holds the current active quiz configuration.
let isQuizLive = false; 
let weeklyQuestions = []; 

// Health Check
app.get('/', (req, res) => {
    res.send("🟢 JEEsociety Arena Backend is live and serving questions!");
});

// 1. GET: Send questions to the React frontend
app.get('/api/config', (req, res) => {
    res.json({ isQuizLive, questions: weeklyQuestions });
});

// 2. POST: Admin updates the quiz
app.post('/api/admin/config', (req, res) => {
    const { questions, liveStatus } = req.body;
    weeklyQuestions = questions;
    isQuizLive = liveStatus;
    
    res.json({ success: true, message: "Arena updated successfully." });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Stateless Backend running on http://localhost:${PORT}`));