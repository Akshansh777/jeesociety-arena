import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// --- IN-MEMORY DATABASE ---
let isQuizLive = true; 
let leaderboard = []; 
let weeklyQuestions = []; // Questions now live here!

// Set the leaderboard reveal time (e.g., Today at 22:00:00 or 10:00 PM)
// For testing right now, you might want to set this to 1 minute from now!
let dropTime = new Date();
dropTime.setHours(22, 0, 0, 0); 

// 1. GET: Status, Time, and Questions
app.get('/api/config', (req, res) => {
    res.json({ 
        isQuizLive, 
        dropTime: dropTime.getTime(), // Send timestamp to frontend
        questions: weeklyQuestions 
    });
});

// 2. POST: Submit Score
app.post('/api/submit', (req, res) => {
    const { name, avatar, score, time } = req.body;
    if (!isQuizLive) return res.status(403).json({ error: "Quiz closed." });

    const playerEntry = { id: Date.now().toString(), name, avatar, score, time };
    leaderboard.push(playerEntry);

    // Sort: Highest Score first, then Lowest Time
    leaderboard.sort((a, b) => b.score !== a.score ? b.score - a.score : a.time - b.time);
    
    const rank = leaderboard.findIndex(p => p.id === playerEntry.id) + 1;
    res.json({ success: true, rank });
});

// 3. GET: Leaderboard (Only works if time is past 10 PM)
app.get('/api/leaderboard', (req, res) => {
    if (new Date().getTime() < dropTime.getTime()) {
        return res.status(403).json({ error: "Leaderboard is locked." });
    }
    res.json(leaderboard.slice(0, 100));
});

// 4. ADMIN POST: Set new quiz config
app.post('/api/admin/config', (req, res) => {
    const { questions, newDropTime, liveStatus } = req.body;
    
    weeklyQuestions = questions;
    isQuizLive = liveStatus;
    if (newDropTime) dropTime = new Date(newDropTime);
    
    // Wipe leaderboard for the new week
    leaderboard = []; 
    
    res.json({ success: true, message: "Arena updated successfully." });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));