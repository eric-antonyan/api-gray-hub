import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import basicAuth from 'basic-auth';
import path from 'path';
import { fileURLToPath } from 'url';

// Initialize environment variables from .env file
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan(customFormat));

// Custom morgan format with timestamp
function customFormat(tokens, req, res) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${tokens.method(req, res)} ${tokens.url(req, res)} ${tokens.status(req, res)} ${tokens['response-time'](req, res)} ms`;
}

// Authentication Middleware
function authMiddleware(req, res, next) {
    const user = basicAuth(req);
    if (user && user.name === process.env.BASIC_AUTH_USER && user.pass === process.env.BASIC_AUTH_PASS) {
        return next();
    } else {
        return res.sendStatus(401);
    }
}

// User Data (Ideally should be in a database)
const user = {
    username: "gor_manukyan",
    password: process.env.USER_PASSWORD_HASH,
    bio: "Ես մեծ հետաքրքրություն ունեմ տեխնոլոգիաների հանդեպ, և սիրում եմ փորձարկել նոր սարքեր ու ծրագրեր: Ազատ ժամանակս հիմնականում անցկացնում եմ ֆուտբոլ դիտելով կամ շախմատ խաղալով ։ Սիրածս ֆուտբոլի թիմը Barcelona-ն է: Գիտակցելով ժամանակակից աշխարհի կարևորությունը, նաև փորձում եմ սովորել նոր լեզուներ՝ թե՛ ծրագրավորման, թե՛ մարդկային։ Դե իհարկե, շաբաթը մի քանի անգամ վազքով եմ զբաղվում՝ առողջությունս պահպանելու համար, մեկ էլ սիրում եմ շատ և անիմաստ խոսել։",
    age: 58,
    image: "https://media.istockphoto.com/id/880486494/photo/smiling-businessman-using-laptop.jpg?s=612x612&w=0&k=20&c=jNCdH9BlNovO74PeVmSJxVW3SsTktEPK8b4JygmfdqY=",
    firstName: "Գոռ",
    lastName: "Մանուկյան",
    get() {
        const { password, get, ...customUser } = this;
        return customUser;
    }
};

// Routes
app.post('/login', authMiddleware, async (req, res) => {
    try {
        const { username, password } = req.body;
        if (username === user.username && await bcrypt.compare(password, user.password)) {
            const accessToken = jwt.sign(user.get(), process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ access_token: accessToken });
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/user', authMiddleware, (req, res) => {
    res.json(user.get());
});

app.get('/public/assets/files/key/secret/zip', (req, res, next) => {
    const filePath = path.join(__dirname, 'public', 'secret.zip');
    res.sendFile(filePath, (err) => {
        if (err) {
            next(err);
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unexpected error:', err);
    res.status(500).json({ message: 'Internal server error' });
});

// Start server
app.listen(3001, () => {
    console.log("Server listening on port http://localhost:3001");
});
