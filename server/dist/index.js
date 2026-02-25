"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const User_1 = require("./models/User");
const Institution_1 = require("./models/Institution");
const Robot_1 = require("./models/Robot");
const Match_1 = require("./models/Match");
const Sponsor_1 = require("./models/Sponsor");
const Registration_1 = require("./models/Registration");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const emailService_1 = require("./utils/emailService");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Enhanced logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    // Log request
    console.log(`\n========== ${new Date().toISOString()} ==========`);
    console.log(`REQUEST: ${req.method} ${req.url}`);
    console.log(`HEADERS:`, JSON.stringify(req.headers, null, 2));
    if (req.body && Object.keys(req.body).length > 0) {
        console.log(`BODY:`, JSON.stringify(req.body, null, 2));
    }
    // Log response
    const originalSend = res.send;
    res.send = function (data) {
        console.log(`RESPONSE STATUS: ${res.statusCode}`);
        if (typeof data === 'string' && data.length < 500) {
            console.log(`RESPONSE DATA:`, data);
        }
        console.log(`DURATION: ${Date.now() - start}ms`);
        return originalSend.call(this, data);
    };
    next();
});
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
// Ensure uploads directory exists
const uploadDir = path_1.default.join(__dirname, 'uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir);
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({ storage: storage });
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    },
    allowEIO3: true,
    transports: ['polling', 'websocket']
});
const JWT_SECRET = process.env.JWT_SECRET || 'robot-super-secret-key';
// --- Middlewares ---
const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    console.log(`[AUTH] Token received:`, token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
    if (token) {
        jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                console.log(`[AUTH] Token verification failed:`, err.message);
                return res.sendStatus(403);
            }
            console.log(`[AUTH] User authenticated:`, user);
            req.user = user;
            next();
        });
    }
    else {
        console.log(`[AUTH] No token provided`);
        res.sendStatus(401);
    }
};
const isAdmin = (req, res, next) => {
    if (req.user.role === 'ADMIN')
        next();
    else
        res.status(403).send({ message: 'Require Admin Role!' });
};
// --- Auth Routes ---
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User_1.User.findOne({ where: { username } });
    if (user && bcryptjs_1.default.compareSync(password, user.password)) {
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, role: user.role, username: user.username, id: user.id });
    }
    else {
        res.status(401).send({ message: 'Invalid username or password' });
    }
});
// --- CRUD Routes ---
app.get('/api/institutions', async (req, res) => res.json(await Institution_1.Institution.findAll()));
app.post('/api/institutions', authenticateJWT, isAdmin, async (req, res) => {
    console.log('POST /api/institutions body:', req.body);
    const { name, contactEmail, isPaid, members } = req.body;
    if (!name) {
        console.log('Error: name is missing');
        return res.status(400).json({ message: 'El nombre de la institución es requerido' });
    }
    try {
        const institution = await Institution_1.Institution.create({ name, contactEmail, isPaid, members });
        console.log('Created institution:', institution.id);
        res.json(institution);
    }
    catch (err) {
        console.error('Error creating institution:', err.message);
        res.status(500).json({ message: err.message });
    }
});
app.put('/api/institutions/:id', authenticateJWT, isAdmin, async (req, res) => {
    await Institution_1.Institution.update(req.body, { where: { id: req.params.id } });
    res.json(await Institution_1.Institution.findByPk(req.params.id));
});
app.delete('/api/institutions/:id', authenticateJWT, isAdmin, async (req, res) => {
    await Institution_1.Institution.destroy({ where: { id: req.params.id } });
    res.sendStatus(204);
});
// Robots
app.get('/api/robots', async (req, res) => res.json(await Robot_1.Robot.findAll({ include: [Institution_1.Institution] })));
app.post('/api/robots', authenticateJWT, isAdmin, async (req, res) => {
    const { institutionId, category, level } = req.body;
    // Restriction: Max 3 robots per category per institution
    const count = await Robot_1.Robot.count({
        where: {
            institutionId,
            category,
            level
        }
    });
    if (count >= 3) {
        return res.status(400).send({
            message: `La institución ya tiene el máximo de 3 robots en la categoría ${category} (${level})`
        });
    }
    res.json(await Robot_1.Robot.create(req.body));
});
app.put('/api/robots/:id', authenticateJWT, isAdmin, async (req, res) => {
    await Robot_1.Robot.update(req.body, { where: { id: req.params.id } });
    res.json(await Robot_1.Robot.findByPk(req.params.id, { include: [Institution_1.Institution] }));
});
app.delete('/api/robots/:id', authenticateJWT, isAdmin, async (req, res) => {
    await Robot_1.Robot.destroy({ where: { id: req.params.id } });
    res.sendStatus(204);
});
// Referees (Users)
app.get('/api/users', authenticateJWT, isAdmin, async (req, res) => {
    res.json(await User_1.User.findAll({ where: { role: 'REFEREE' }, attributes: { exclude: ['password'] } }));
});
app.post('/api/users', authenticateJWT, isAdmin, async (req, res) => {
    const hashedPassword = bcryptjs_1.default.hashSync(req.body.password, 8);
    const newUser = await User_1.User.create({ ...req.body, password: hashedPassword, role: 'REFEREE' });
    res.json({ id: newUser.id, username: newUser.username, role: newUser.role });
});
app.put('/api/users/:id', authenticateJWT, isAdmin, async (req, res) => {
    const data = { ...req.body };
    if (data.password)
        data.password = bcryptjs_1.default.hashSync(data.password, 8);
    else
        delete data.password;
    await User_1.User.update(data, { where: { id: req.params.id } });
    res.json({ id: req.params.id, username: data.username });
});
app.delete('/api/users/:id', authenticateJWT, isAdmin, async (req, res) => {
    await User_1.User.destroy({ where: { id: req.params.id } });
    res.sendStatus(204);
});
// Sponsors
app.get('/api/sponsors', async (req, res) => res.json(await Sponsor_1.Sponsor.findAll()));
app.post('/api/sponsors', authenticateJWT, isAdmin, async (req, res) => {
    res.json(await Sponsor_1.Sponsor.create(req.body));
});
app.put('/api/sponsors/:id', authenticateJWT, isAdmin, async (req, res) => {
    await Sponsor_1.Sponsor.update(req.body, { where: { id: req.params.id } });
    res.json(await Sponsor_1.Sponsor.findByPk(req.params.id));
});
app.delete('/api/sponsors/:id', authenticateJWT, isAdmin, async (req, res) => {
    await Sponsor_1.Sponsor.destroy({ where: { id: req.params.id } });
    res.sendStatus(204);
});
app.get('/api/matches', async (req, res) => res.json(await Match_1.Match.findAll({ include: ['robotA', 'robotB', 'referee'] })));
app.post('/api/matches', authenticateJWT, isAdmin, async (req, res) => {
    const newMatch = await Match_1.Match.create(req.body);
    broadcastState();
    res.json(newMatch);
});
app.put('/api/matches/:id', authenticateJWT, isAdmin, async (req, res) => {
    await Match_1.Match.update(req.body, { where: { id: req.params.id } });
    broadcastState();
    res.json(await Match_1.Match.findByPk(req.params.id, { include: ['robotA', 'robotB', 'referee'] }));
});
app.delete('/api/matches/:id', authenticateJWT, isAdmin, async (req, res) => {
    await Match_1.Match.destroy({ where: { id: req.params.id } });
    broadcastState();
    res.sendStatus(204);
});
// --- Bracket Generation ---
app.post('/api/brackets/generate', authenticateJWT, isAdmin, async (req, res) => {
    const { category, level, robotIds, refereeId } = req.body;
    if (!robotIds || robotIds.length < 2)
        return res.status(400).send({ message: 'At least 2 robots required' });
    // Shuffle robots for fair seeding
    const shuffled = [...robotIds].sort(() => Math.random() - 0.5);
    // Calculate depth
    const numRobots = shuffled.length;
    const powerOf2 = Math.ceil(Math.log2(numRobots));
    const totalSlots = Math.pow(2, powerOf2);
    // Fill with nulls if not power of 2
    const filledRobots = [...shuffled];
    while (filledRobots.length < totalSlots)
        filledRobots.push(null);
    try {
        const rounds = []; // To keep track of matches created per round
        let currentRoundSlots = totalSlots;
        let currentRoundMatches = [];
        let prevRoundMatches = [];
        let roundLevel = 0;
        // We build from the bottom up? No, top down is easier to link nextMatchId
        // Let's create the final first, then semis, then quarters...
        const roundNames = ['FINAL', 'SEMIS', 'QUARTERS', 'OCTAVOS', '16VOS', '32VOS'];
        let nextRoundMatches = [];
        // Total matches to create: totalSlots - 1
        // Loop from level 0 (Final) to level powerOf2 - 1
        for (let level = 0; level < powerOf2; level++) {
            const numMatchesInRound = Math.pow(2, level);
            const roundName = roundNames[level] || `ROUND_${level}`;
            const matchesInThisRound = [];
            for (let i = 0; i < numMatchesInRound; i++) {
                const nextMatch = nextRoundMatches[Math.floor(i / 2)];
                const match = await Match_1.Match.create({
                    category,
                    level,
                    refereeId,
                    round: roundName,
                    nextMatchId: nextMatch ? nextMatch.id : null,
                    positionInNextMatch: nextMatch ? (i % 2 === 0 ? 'A' : 'B') : null,
                    scoreA: 0, scoreB: 0, timeLeft: 180,
                    robotAId: null, robotBId: null
                });
                matchesInThisRound.push(match);
            }
            rounds.push(matchesInThisRound);
            nextRoundMatches = matchesInThisRound;
        }
        // Now initialize the first round (the deepest one) with the robots
        const firstRoundMatches = rounds[rounds.length - 1];
        for (let i = 0; i < firstRoundMatches.length; i++) {
            const match = firstRoundMatches[i];
            match.robotAId = filledRobots[i * 2];
            match.robotBId = filledRobots[i * 2 + 1];
            await match.save();
        }
        broadcastState();
        res.json({ message: 'Bracket generated successfully', matchesCount: totalSlots - 1 });
    }
    catch (err) {
        console.error('Bracket gen error:', err);
        res.status(500).send({ message: 'Error generating bracket' });
    }
});
// --- Registration Routes (Public/Drafts) ---
app.post('/api/registrations/sync', async (req, res) => {
    const { email, step, data, paymentProof } = req.body;
    console.log('Sync request:', { email, step, hasData: !!data, hasPaymentProof: !!paymentProof });
    if (!email)
        return res.status(400).send({ message: 'Email required' });
    try {
        let registration = await Registration_1.Registration.findOne({ where: { google_email: email, status: 'DRAFT' } });
        if (registration) {
            registration.step = step;
            registration.data = data;
            if (paymentProof)
                registration.payment_proof_filename = paymentProof;
            await registration.save();
            console.log('Updated draft:', registration.id);
        }
        else {
            registration = await Registration_1.Registration.create({
                google_email: email,
                step,
                data,
                payment_proof_filename: paymentProof || null
            });
            console.log('Created draft:', registration.id);
        }
        res.json({ success: true, registration });
    }
    catch (err) {
        console.error('Sync error:', err);
        res.status(500).send({ message: 'Error syncing draft' });
    }
});
app.get('/api/registrations/draft', async (req, res) => {
    const { email } = req.query;
    if (!email)
        return res.status(400).send({ message: 'Email required' });
    const registration = await Registration_1.Registration.findOne({ where: { google_email: email, status: 'DRAFT' } });
    res.json({ registration });
});
app.post('/api/registrations/upload', upload.single('file'), (req, res) => {
    if (!req.file)
        return res.status(400).send({ message: 'No file uploaded' });
    // Return the filename (served via /uploads)
    res.json({ filename: req.file.filename });
});
app.post('/api/registrations/submit', async (req, res) => {
    console.log('Submit request body:', req.body);
    const { email } = req.body;
    if (!email) {
        console.log('Error: No email in request');
        return res.status(400).send({ message: 'Email required' });
    }
    const registration = await Registration_1.Registration.findOne({ where: { google_email: email, status: 'DRAFT' } });
    if (!registration) {
        console.log('Error: No draft found for email:', email);
        return res.status(404).send({ message: 'No draft found' });
    }
    registration.status = 'SUBMITTED';
    await registration.save();
    console.log('Registration submitted successfully:', registration.id);
    // Send response immediately FIRST
    console.log('Sending success response...');
    res.json({ success: true, id: registration.id });
    // Send welcome email AFTER response is sent (truly non-blocking)
    const targetEmail = registration.data?.email || email;
    setImmediate(() => {
        console.log('=== Starting background email send ===');
        console.log('Target email:', targetEmail);
        (0, emailService_1.sendWelcomeEmail)(targetEmail, registration.data).catch(err => {
            console.error('Failed to send welcome email:', err.message);
        });
    });
});
// Admin Registration Routes
app.get('/api/registrations', authenticateJWT, isAdmin, async (req, res) => {
    // Return all SUBMITTED registrations
    const registrations = await Registration_1.Registration.findAll({
        where: { status: 'SUBMITTED' },
        order: [['createdAt', 'DESC']]
    });
    res.json(registrations);
});
app.put('/api/registrations/:id', authenticateJWT, isAdmin, async (req, res) => {
    const { paymentStatus } = req.body;
    let isPaid = false;
    if (paymentStatus === 'APPROVED')
        isPaid = true;
    // If REJECTED or PENDING, isPaid remains false (or becomes false)
    await Registration_1.Registration.update({ isPaid, paymentStatus }, { where: { id: req.params.id } });
    const updatedRegistration = await Registration_1.Registration.findByPk(req.params.id);
    if (updatedRegistration && (paymentStatus === 'APPROVED' || paymentStatus === 'REJECTED')) {
        const targetEmail = updatedRegistration.data?.email || updatedRegistration.google_email;
        await (0, emailService_1.sendStatusEmail)(targetEmail, paymentStatus);
    }
    res.json(updatedRegistration);
});
// --- Socket.io Real-time Logic ---
const broadcastState = async () => {
    try {
        const allMatches = await Match_1.Match.findAll({
            include: [
                { model: Robot_1.Robot, as: 'robotA', include: [Institution_1.Institution] },
                { model: Robot_1.Robot, as: 'robotB', include: [Institution_1.Institution] },
            ]
        });
        const fullMatches = allMatches.map(m => {
            const json = m.toJSON();
            if (json.robotA)
                json.robotA.institution = json.robotA.Institution?.name;
            if (json.robotB)
                json.robotB.institution = json.robotB.Institution?.name;
            return json;
        });
        io.emit('all_matches', fullMatches);
    }
    catch (err) {
        console.error('Error broadcasting state:', err);
    }
};
// Global Timer
setInterval(async () => {
    const activeMatches = await Match_1.Match.findAll({ where: { isActive: true } });
    if (activeMatches.length === 0)
        return;
    for (const match of activeMatches) {
        if (match.timeLeft > 0) {
            match.timeLeft -= 1;
            await match.save();
        }
        else {
            match.isActive = false;
            await match.save();
        }
    }
    broadcastState();
}, 1000);
io.on('connection', (socket) => {
    broadcastState();
    socket.on('control_match', async (data) => {
        const { matchId, action, payload } = data;
        const match = await Match_1.Match.findByPk(matchId);
        if (!match)
            return;
        switch (action) {
            case 'START':
                match.isActive = true;
                break;
            case 'PAUSE':
                match.isActive = false;
                break;
            case 'RESET':
                match.scoreA = 0;
                match.scoreB = 0;
                match.penaltiesA = [];
                match.penaltiesB = [];
                match.timeLeft = 180;
                match.isActive = false;
                break;
            case 'ADD_SCORE_A':
                match.scoreA += payload || 1;
                break;
            case 'ADD_SCORE_B':
                match.scoreB += payload || 1;
                break;
            case 'ADD_PENALTY_A':
                match.penaltiesA = [...match.penaltiesA, payload || 'Warning'];
                break;
            case 'ADD_PENALTY_B':
                match.penaltiesB = [...match.penaltiesB, payload || 'Warning'];
                break;
            case 'ADD_TIME':
                match.timeLeft += Number(payload) || 30;
                break;
            case 'FINISH':
                match.isActive = false;
                match.isFinished = true;
                let winnerId = null;
                if (match.scoreA > match.scoreB)
                    winnerId = match.robotAId;
                else if (match.scoreB > match.scoreA)
                    winnerId = match.robotBId;
                match.winnerId = winnerId;
                // Auto-advance logic
                if (winnerId && match.nextMatchId) {
                    const nextMatch = await Match_1.Match.findByPk(match.nextMatchId);
                    if (nextMatch) {
                        if (match.positionInNextMatch === 'A') {
                            nextMatch.robotAId = winnerId;
                        }
                        else {
                            nextMatch.robotBId = winnerId;
                        }
                        await nextMatch.save();
                    }
                }
                break;
            case 'UNFINISH':
                match.isFinished = false;
                match.winnerId = null;
                break;
        }
        await match.save();
        broadcastState();
    });
});
const PORT = Number(process.env.PORT) || 3001;
db_1.default.sync().then(async () => {
    // Idempotent migration for missing columns
    try {
        const [cols] = await db_1.default.query("SHOW COLUMNS FROM Matches");
        const fields = cols.map((c) => c.Field);
        if (!fields.includes('isFinished')) {
            await db_1.default.query("ALTER TABLE Matches ADD COLUMN isFinished BOOLEAN DEFAULT false");
        }
        if (!fields.includes('round')) {
            await db_1.default.query("ALTER TABLE Matches ADD COLUMN round VARCHAR(255) DEFAULT 'QUARTERS'");
        }
        if (!fields.includes('level')) {
            await db_1.default.query("ALTER TABLE Matches ADD COLUMN level VARCHAR(255)");
        }
        if (!fields.includes('winnerId')) {
            await db_1.default.query("ALTER TABLE Matches ADD COLUMN winnerId CHAR(36) BINARY");
        }
        if (!fields.includes('nextMatchId')) {
            await db_1.default.query("ALTER TABLE Matches ADD COLUMN nextMatchId CHAR(36) BINARY");
        }
        if (!fields.includes('positionInNextMatch')) {
            await db_1.default.query("ALTER TABLE Matches ADD COLUMN positionInNextMatch VARCHAR(255)");
        }
        if (!fields.includes('showInDashboard')) {
            await db_1.default.query("ALTER TABLE Matches ADD COLUMN showInDashboard BOOLEAN DEFAULT false");
        }
        // Migration for Robots
        const [robotCols] = await db_1.default.query("SHOW COLUMNS FROM Robots");
        const rFields = robotCols.map((c) => c.Field);
        if (!rFields.includes('level'))
            await db_1.default.query("ALTER TABLE Robots ADD COLUMN level VARCHAR(50) DEFAULT 'JUNIOR'");
        if (!rFields.includes('category'))
            await db_1.default.query("ALTER TABLE Robots ADD COLUMN category VARCHAR(100) DEFAULT 'Minisumo Autónomo'");
        if (!rFields.includes('isHomologated'))
            await db_1.default.query("ALTER TABLE Robots ADD COLUMN isHomologated BOOLEAN DEFAULT false");
        // Migration for Institutions
        const [instCols] = await db_1.default.query("SHOW COLUMNS FROM Institutions");
        const iFields = instCols.map((c) => c.Field);
        if (!iFields.includes('contactEmail'))
            await db_1.default.query("ALTER TABLE Institutions ADD COLUMN contactEmail VARCHAR(255)");
        if (!iFields.includes('isPaid'))
            await db_1.default.query("ALTER TABLE Institutions ADD COLUMN isPaid BOOLEAN DEFAULT false");
        // Migration for Registrations
        const [regCols] = await db_1.default.query("SHOW COLUMNS FROM Registrations");
        const regFields = regCols.map((c) => c.Field);
        if (!regFields.includes('isPaid'))
            await db_1.default.query("ALTER TABLE Registrations ADD COLUMN isPaid BOOLEAN DEFAULT false");
        if (!regFields.includes('paymentStatus'))
            await db_1.default.query("ALTER TABLE Registrations ADD COLUMN paymentStatus ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING'");
    }
    catch (err) {
        console.log('Migration info: Columns check finished.');
    }
    // Seed admin if not exist
    const adminExists = await User_1.User.findOne({ where: { username: 'admin' } });
    if (!adminExists) {
        await User_1.User.create({
            username: 'admin',
            password: bcryptjs_1.default.hashSync('admin123', 8),
            role: 'ADMIN'
        });
        console.log('Seed: Admin user created');
    }
    httpServer.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running with MySQL support on port ${PORT}`);
    });
}).catch(err => {
    console.error('Database connection failed:', err);
});
