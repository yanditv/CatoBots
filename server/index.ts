import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import sequelize from './config/db';
import { User } from './models/User';
import { Institution } from './models/Institution';
import { Robot } from './models/Robot';
import { Match } from './models/Match';
import { Sponsor } from './models/Sponsor';
import { Registration } from './models/Registration';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { sendWelcomeEmail, sendStatusEmail } from './utils/emailService';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const JWT_SECRET = process.env.JWT_SECRET || 'robot-super-secret-key';

// --- Middlewares ---

const authenticateJWT = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user.role === 'ADMIN') next();
  else res.status(403).send({ message: 'Require Admin Role!' });
};

// --- Auth Routes ---

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });
  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ id: user.id, role: user.role, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, role: user.role, username: user.username, id: user.id });
  } else {
    res.status(401).send({ message: 'Invalid username or password' });
  }
});

// --- CRUD Routes ---

app.get('/api/institutions', async (req, res) => res.json(await Institution.findAll()));
app.post('/api/institutions', authenticateJWT, isAdmin, async (req, res) => {
  res.json(await Institution.create(req.body));
});

app.put('/api/institutions/:id', authenticateJWT, isAdmin, async (req, res) => {
  await Institution.update(req.body, { where: { id: req.params.id } });
  res.json(await Institution.findByPk(req.params.id));
});

app.delete('/api/institutions/:id', authenticateJWT, isAdmin, async (req, res) => {
  await Institution.destroy({ where: { id: req.params.id } });
  res.sendStatus(204);
});

// Robots
app.get('/api/robots', async (req, res) => res.json(await Robot.findAll({ include: [Institution] })));
app.post('/api/robots', authenticateJWT, isAdmin, async (req, res) => {
  const { institutionId, category, level } = req.body;

  // Restriction: Max 3 robots per category per institution
  const count = await Robot.count({
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

  res.json(await Robot.create(req.body));
});
app.put('/api/robots/:id', authenticateJWT, isAdmin, async (req, res) => {
  await Robot.update(req.body, { where: { id: req.params.id } });
  res.json(await Robot.findByPk(req.params.id, { include: [Institution] }));
});

app.delete('/api/robots/:id', authenticateJWT, isAdmin, async (req, res) => {
  await Robot.destroy({ where: { id: req.params.id } });
  res.sendStatus(204);
});

// Referees (Users)
app.get('/api/users', authenticateJWT, isAdmin, async (req, res) => {
  res.json(await User.findAll({ where: { role: 'REFEREE' }, attributes: { exclude: ['password'] } }));
});
app.post('/api/users', authenticateJWT, isAdmin, async (req, res) => {
  const hashedPassword = bcrypt.hashSync(req.body.password, 8);
  const newUser = await User.create({ ...req.body, password: hashedPassword, role: 'REFEREE' });
  res.json({ id: newUser.id, username: newUser.username, role: newUser.role });
});
app.put('/api/users/:id', authenticateJWT, isAdmin, async (req, res) => {
  const data = { ...req.body };
  if (data.password) data.password = bcrypt.hashSync(data.password, 8);
  else delete data.password;
  await User.update(data, { where: { id: req.params.id } });
  res.json({ id: req.params.id, username: data.username });
});

app.delete('/api/users/:id', authenticateJWT, isAdmin, async (req, res) => {
  await User.destroy({ where: { id: req.params.id } });
  res.sendStatus(204);
});

// Sponsors
app.get('/api/sponsors', async (req, res) => res.json(await Sponsor.findAll()));
app.post('/api/sponsors', authenticateJWT, isAdmin, async (req, res) => {
  res.json(await Sponsor.create(req.body));
});
app.put('/api/sponsors/:id', authenticateJWT, isAdmin, async (req, res) => {
  await Sponsor.update(req.body, { where: { id: req.params.id } });
  res.json(await Sponsor.findByPk(req.params.id));
});
app.delete('/api/sponsors/:id', authenticateJWT, isAdmin, async (req, res) => {
  await Sponsor.destroy({ where: { id: req.params.id } });
  res.sendStatus(204);
});

app.get('/api/matches', async (req, res) => res.json(await Match.findAll({ include: ['robotA', 'robotB', 'referee'] })));
app.post('/api/matches', authenticateJWT, isAdmin, async (req, res) => {
  const newMatch = await Match.create(req.body);
  broadcastState();
  res.json(newMatch);
});
app.put('/api/matches/:id', authenticateJWT, isAdmin, async (req, res) => {
  await Match.update(req.body, { where: { id: req.params.id } });
  broadcastState();
  res.json(await Match.findByPk(req.params.id, { include: ['robotA', 'robotB', 'referee'] }));
});
app.delete('/api/matches/:id', authenticateJWT, isAdmin, async (req, res) => {
  await Match.destroy({ where: { id: req.params.id } });
  broadcastState();
  res.sendStatus(204);
});

// --- Bracket Generation ---

app.post('/api/brackets/generate', authenticateJWT, isAdmin, async (req, res) => {
  const { category, level, robotIds, refereeId } = req.body;
  if (!robotIds || robotIds.length < 2) return res.status(400).send({ message: 'At least 2 robots required' });

  // Shuffle robots for fair seeding
  const shuffled = [...robotIds].sort(() => Math.random() - 0.5);

  // Calculate depth
  const numRobots = shuffled.length;
  const powerOf2 = Math.ceil(Math.log2(numRobots));
  const totalSlots = Math.pow(2, powerOf2);

  // Fill with nulls if not power of 2
  const filledRobots = [...shuffled];
  while (filledRobots.length < totalSlots) filledRobots.push(null as any);

  try {
    const rounds = []; // To keep track of matches created per round
    let currentRoundSlots = totalSlots;
    let currentRoundMatches: any[] = [];
    let prevRoundMatches: any[] = [];
    let roundLevel = 0;

    // We build from the bottom up? No, top down is easier to link nextMatchId
    // Let's create the final first, then semis, then quarters...

    const roundNames = ['FINAL', 'SEMIS', 'QUARTERS', 'OCTAVOS', '16VOS', '32VOS'];

    let nextRoundMatches: any[] = [];

    // Total matches to create: totalSlots - 1
    // Loop from level 0 (Final) to level powerOf2 - 1
    for (let level = 0; level < powerOf2; level++) {
      const numMatchesInRound = Math.pow(2, level);
      const roundName = roundNames[level] || `ROUND_${level}`;
      const matchesInThisRound: any[] = [];

      for (let i = 0; i < numMatchesInRound; i++) {
        const nextMatch = nextRoundMatches[Math.floor(i / 2)];
        const match = await Match.create({
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
  } catch (err) {
    console.error('Bracket gen error:', err);
    res.status(500).send({ message: 'Error generating bracket' });
  }
});

// --- Registration Routes (Public/Drafts) ---

app.post('/api/registrations/sync', async (req, res) => {
  const { email, step, data, paymentProof } = req.body;

  if (!email) return res.status(400).send({ message: 'Email required' });

  try {
    let registration = await Registration.findOne({ where: { google_email: email, status: 'DRAFT' } });

    if (registration) {
      registration.step = step;
      registration.data = data;
      if (paymentProof) registration.payment_proof_filename = paymentProof;
      await registration.save();
    } else {
      registration = await Registration.create({
        google_email: email,
        step,
        data,
        payment_proof_filename: paymentProof || null
      });
    }

    res.json({ success: true, registration });
  } catch (err) {
    console.error('Sync error:', err);
    res.status(500).send({ message: 'Error syncing draft' });
  }
});

app.get('/api/registrations/draft', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).send({ message: 'Email required' });

  const registration = await Registration.findOne({ where: { google_email: email as string, status: 'DRAFT' } });
  res.json({ registration });
});

app.post('/api/registrations/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send({ message: 'No file uploaded' });

  // Return the filename (served via /uploads)
  res.json({ filename: req.file.filename });
});

app.post('/api/registrations/submit', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).send({ message: 'Email required' });

  const registration = await Registration.findOne({ where: { google_email: email, status: 'DRAFT' } });
  if (!registration) return res.status(404).send({ message: 'No draft found' });

  registration.status = 'SUBMITTED';
  await registration.save();

  // Trigger welcome email
  await sendWelcomeEmail(email, registration.data);

  res.json({ success: true });
});

// Admin Registration Routes
app.get('/api/registrations', authenticateJWT, isAdmin, async (req, res) => {
  // Return all SUBMITTED registrations
  const registrations = await Registration.findAll({
    where: { status: 'SUBMITTED' },
    order: [['createdAt', 'DESC']]
  });
  res.json(registrations);
});

app.put('/api/registrations/:id', authenticateJWT, isAdmin, async (req, res) => {
  const { paymentStatus } = req.body;

  let isPaid = false;
  if (paymentStatus === 'APPROVED') isPaid = true;
  // If REJECTED or PENDING, isPaid remains false (or becomes false)

  await Registration.update({ isPaid, paymentStatus }, { where: { id: req.params.id } });

  const updatedRegistration = await Registration.findByPk(req.params.id);

  if (updatedRegistration && (paymentStatus === 'APPROVED' || paymentStatus === 'REJECTED')) {
    await sendStatusEmail(updatedRegistration.google_email, paymentStatus);
  }

  res.json(updatedRegistration);
});

// --- Socket.io Real-time Logic ---

const broadcastState = async () => {
  try {
    const allMatches = await Match.findAll({
      include: [
        { model: Robot, as: 'robotA', include: [Institution] },
        { model: Robot, as: 'robotB', include: [Institution] },
      ]
    });

    const fullMatches = allMatches.map(m => {
      const json = m.toJSON() as any;
      if (json.robotA) json.robotA.institution = json.robotA.Institution?.name;
      if (json.robotB) json.robotB.institution = json.robotB.Institution?.name;
      return json;
    });

    io.emit('all_matches', fullMatches);
  } catch (err) {
    console.error('Error broadcasting state:', err);
  }
};

// Global Timer
setInterval(async () => {
  const activeMatches = await Match.findAll({ where: { isActive: true } });
  if (activeMatches.length === 0) return;

  for (const match of activeMatches) {
    if (match.timeLeft > 0) {
      match.timeLeft -= 1;
      await match.save();
    } else {
      match.isActive = false;
      await match.save();
    }
  }
  broadcastState();
}, 1000);

io.on('connection', (socket) => {
  broadcastState();
  socket.on('control_match', async (data: { matchId: string, action: string, payload?: any }) => {
    const { matchId, action, payload } = data;
    const match = await Match.findByPk(matchId);
    if (!match) return;

    switch (action) {
      case 'START': match.isActive = true; break;
      case 'PAUSE': match.isActive = false; break;
      case 'RESET':
        match.scoreA = 0; match.scoreB = 0;
        match.penaltiesA = []; match.penaltiesB = [];
        match.timeLeft = 180; match.isActive = false;
        break;
      case 'ADD_SCORE_A': match.scoreA += payload || 1; break;
      case 'ADD_SCORE_B': match.scoreB += payload || 1; break;
      case 'ADD_PENALTY_A': match.penaltiesA = [...match.penaltiesA, payload || 'Warning']; break;
      case 'ADD_PENALTY_B': match.penaltiesB = [...match.penaltiesB, payload || 'Warning']; break;
      case 'ADD_TIME': match.timeLeft += Number(payload) || 30; break;
      case 'FINISH':
        match.isActive = false;
        match.isFinished = true;
        let winnerId = null;
        if (match.scoreA > match.scoreB) winnerId = match.robotAId;
        else if (match.scoreB > match.scoreA) winnerId = match.robotBId;

        match.winnerId = winnerId as any;

        // Auto-advance logic
        if (winnerId && match.nextMatchId) {
          const nextMatch = await Match.findByPk(match.nextMatchId);
          if (nextMatch) {
            if (match.positionInNextMatch === 'A') {
              nextMatch.robotAId = winnerId as any;
            } else {
              nextMatch.robotBId = winnerId as any;
            }
            await nextMatch.save();
          }
        }
        break;
      case 'UNFINISH':
        match.isFinished = false;
        match.winnerId = null as any;
        break;
    }
    await match.save();
    broadcastState();
  });
});

const PORT = Number(process.env.PORT) || 3001;
sequelize.sync().then(async () => {
  // Idempotent migration for missing columns
  try {
    const [cols]: any = await sequelize.query("SHOW COLUMNS FROM Matches");
    const fields = cols.map((c: any) => c.Field);
    if (!fields.includes('isFinished')) {
      await sequelize.query("ALTER TABLE Matches ADD COLUMN isFinished BOOLEAN DEFAULT false");
    }
    if (!fields.includes('round')) {
      await sequelize.query("ALTER TABLE Matches ADD COLUMN round VARCHAR(255) DEFAULT 'QUARTERS'");
    }
    if (!fields.includes('level')) {
      await sequelize.query("ALTER TABLE Matches ADD COLUMN level VARCHAR(255)");
    }
    if (!fields.includes('winnerId')) {
      await sequelize.query("ALTER TABLE Matches ADD COLUMN winnerId CHAR(36) BINARY");
    }
    if (!fields.includes('nextMatchId')) {
      await sequelize.query("ALTER TABLE Matches ADD COLUMN nextMatchId CHAR(36) BINARY");
    }
    if (!fields.includes('positionInNextMatch')) {
      await sequelize.query("ALTER TABLE Matches ADD COLUMN positionInNextMatch VARCHAR(255)");
    }
    if (!fields.includes('showInDashboard')) {
      await sequelize.query("ALTER TABLE Matches ADD COLUMN showInDashboard BOOLEAN DEFAULT false");
    }

    // Migration for Robots
    const [robotCols]: any = await sequelize.query("SHOW COLUMNS FROM Robots");
    const rFields = robotCols.map((c: any) => c.Field);
    if (!rFields.includes('level')) await sequelize.query("ALTER TABLE Robots ADD COLUMN level VARCHAR(50) DEFAULT 'JUNIOR'");
    if (!rFields.includes('category')) await sequelize.query("ALTER TABLE Robots ADD COLUMN category VARCHAR(100) DEFAULT 'Minisumo Autónomo'");
    if (!rFields.includes('isHomologated')) await sequelize.query("ALTER TABLE Robots ADD COLUMN isHomologated BOOLEAN DEFAULT false");

    // Migration for Institutions
    const [instCols]: any = await sequelize.query("SHOW COLUMNS FROM Institutions");
    const iFields = instCols.map((c: any) => c.Field);
    if (!iFields.includes('contactEmail')) await sequelize.query("ALTER TABLE Institutions ADD COLUMN contactEmail VARCHAR(255)");
    if (!iFields.includes('isPaid')) await sequelize.query("ALTER TABLE Institutions ADD COLUMN isPaid BOOLEAN DEFAULT false");

    // Migration for Registrations
    const [regCols]: any = await sequelize.query("SHOW COLUMNS FROM Registrations");
    const regFields = regCols.map((c: any) => c.Field);
    if (!regFields.includes('isPaid')) await sequelize.query("ALTER TABLE Registrations ADD COLUMN isPaid BOOLEAN DEFAULT false");
    if (!regFields.includes('paymentStatus')) await sequelize.query("ALTER TABLE Registrations ADD COLUMN paymentStatus ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING'");

  } catch (err) {
    console.log('Migration info: Columns check finished.');
  }

  // Seed admin if not exist
  const adminExists = await User.findOne({ where: { username: 'admin' } });
  if (!adminExists) {
    await User.create({
      username: 'admin',
      password: bcrypt.hashSync('admin123', 8),
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
