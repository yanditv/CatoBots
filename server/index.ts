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
import { Sponsor } from './models/Sponsor';
import { Registration } from './models/Registration';
import { Category } from './models/Category';
import { Level } from './models/Level';
import { CategoryLevel } from './models/CategoryLevel';
import { EventConfig } from './models/EventConfig';
import { CATEGORY_MATCH_MODELS, ALL_CATEGORY_MATCH_MODELS } from './models/CategoryMatches';

// Associations: Category <-> Level (many-to-many through CategoryLevel)
Category.belongsToMany(Level, { through: CategoryLevel, foreignKey: 'categoryId', otherKey: 'levelId' });
Level.belongsToMany(Category, { through: CategoryLevel, foreignKey: 'levelId', otherKey: 'categoryId' });
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { sendWelcomeEmail, sendStatusEmail } from './utils/emailService';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Enhanced logging and caching middleware
app.use((req, res, next) => {
  // Disable caching for API calls to prevent stale data
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');

  const start = Date.now();
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`BODY:`, JSON.stringify(req.body, null, 2));
  }
  
  // Log response
  const originalSend = res.send;
  res.send = function (data: any) {
    console.log(`RESPONSE STATUS: ${res.statusCode}`);
    if (typeof data === 'string' && data.length < 500) {
      console.log(`RESPONSE DATA:`, data);
    }
    console.log(`DURATION: ${Date.now() - start}ms`);
    return originalSend.call(this, data);
  };
  
  next();
});

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
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
    methods: ["GET", "POST"],
    credentials: true
  },
  allowEIO3: true,
  transports: ['polling', 'websocket']
});

const JWT_SECRET = process.env.JWT_SECRET || 'robot-super-secret-key';

// --- Middlewares ---

const authenticateJWT = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  console.log(`[AUTH] Token received:`, token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
  
  if (token) {
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) {
        console.log(`[AUTH] Token verification failed:`, err.message);
        return res.sendStatus(403);
      }
      console.log(`[AUTH] User authenticated:`, user);
      req.user = user;
      next();
    });
  } else {
    console.log(`[AUTH] No token provided`);
    res.sendStatus(401);
  }
};

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user.role === 'ADMIN') next();
  else res.status(403).send({ message: 'Require Admin Role!' });
};

// --- Helpers for Category-Specific Matches ---

const getMatchModel = (category: string) => {
  if (!category) return null;
  const normalized = category.trim();
  // Find key in CATEGORY_MATCH_MODELS that matches
  const key = Object.keys(CATEGORY_MATCH_MODELS).find(k => k.toLowerCase() === normalized.toLowerCase());
  return key ? CATEGORY_MATCH_MODELS[key] : null;
};

const findMatchInAllTables = async (id: string, options: any = {}) => {
  // Priority order: Category-specific tables
  for (const model of ALL_CATEGORY_MATCH_MODELS) {
    const match = await (model as any).findByPk(id, options);
    if (match) return { match, model };
  }
  return null;
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
  console.log('POST /api/institutions body:', req.body);
  const { name, contactEmail, isPaid, members } = req.body;
  if (!name) {
    console.log('Error: name is missing');
    return res.status(400).json({ message: 'El nombre de la institución es requerido' });
  }
  try {
    const institution = await Institution.create({ name, contactEmail, isPaid, members });
    console.log('Created institution:', institution.id);
    res.json(institution);
  } catch (err: any) {
    console.error('Error creating institution:', err.message);
    res.status(500).json({ message: err.message });
  }
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

// Save advisor/members for a robot — finds linked registration or creates one
app.put('/api/robots/:id/meta', authenticateJWT, isAdmin, async (req, res) => {
  const { advisorName, advisorPhone, members, robotName, institutionName, category, level } = req.body;
  const membersStr = Array.isArray(members) ? members.join(', ') : (members || '');
  const normName = (s: string) => s?.trim().toLowerCase() || '';

  const allRegs = await Registration.findAll({ where: { status: 'SUBMITTED' } });
  const reg = allRegs.find(r =>
    normName(r.data?.robotName) === normName(robotName) ||
    normName(r.data?.teamName) === normName(robotName)
  ) || null;

  if (reg) {
    await reg.update({ data: { ...reg.data, advisorName: advisorName || '', advisorPhone: advisorPhone || '', members: membersStr } });
  } else {
    const categoryLevel = (level || 'JUNIOR');
    const subCatKey = categoryLevel === 'JUNIOR' ? 'juniorCategory' : categoryLevel === 'SENIOR' ? 'seniorCategory' : 'masterCategory';
    await Registration.create({
      google_email: `robot-${req.params.id}@admin.local`,
      status: 'SUBMITTED',
      paymentStatus: 'APPROVED',
      isPaid: true,
      data: {
        robotName,
        institution: institutionName || '',
        category: categoryLevel,
        [subCatKey]: category || '',
        advisorName: advisorName || '',
        advisorPhone: advisorPhone || '',
        members: membersStr,
      },
    });
  }

  res.json({ success: true });
});

app.delete('/api/robots/:id', authenticateJWT, isAdmin, async (req, res) => {
  await Robot.destroy({ where: { id: req.params.id } });
  res.sendStatus(204);
});

// Categories (public GET, admin CUD)
app.get('/api/categories', async (req, res) => {
  const categories = await Category.findAll({
    where: { isActive: true },
    order: [['order', 'ASC']],
    include: [{ model: Level, through: { attributes: [] }, attributes: ['id', 'name'] }]
  });
  // Transform to include levels as string array for frontend compatibility
  const result = categories.map((c: any) => ({
    ...c.toJSON(),
    levels: c.Levels?.map((l: any) => l.name) || []
  }));
  res.json(result);
});
app.get('/api/categories/all', authenticateJWT, isAdmin, async (req, res) => {
  const categories = await Category.findAll({
    order: [['order', 'ASC']],
    include: [{ model: Level, through: { attributes: [] }, attributes: ['id', 'name'] }]
  });
  const result = categories.map((c: any) => ({
    ...c.toJSON(),
    levels: c.Levels?.map((l: any) => l.name) || []
  }));
  res.json(result);
});
app.post('/api/categories', authenticateJWT, isAdmin, async (req, res) => {
  const { levels, ...catData } = req.body;
  const cat = await Category.create(catData);
  if (levels && Array.isArray(levels)) {
    const levelRecords = await Level.findAll({ where: { name: levels } });
    await (cat as any).setLevels(levelRecords);
  }
  const result = await Category.findByPk(cat.id, { include: [{ model: Level, through: { attributes: [] }, attributes: ['id', 'name'] }] });
  res.json({ ...(result as any).toJSON(), levels: (result as any).Levels?.map((l: any) => l.name) || [] });
});
app.put('/api/categories/:id', authenticateJWT, isAdmin, async (req, res) => {
  const { levels, ...catData } = req.body;
  await Category.update(catData, { where: { id: req.params.id } });
  if (levels && Array.isArray(levels)) {
    const cat = await Category.findByPk(req.params.id);
    const levelRecords = await Level.findAll({ where: { name: levels } });
    await (cat as any).setLevels(levelRecords);
  }
  const result = await Category.findByPk(req.params.id, { include: [{ model: Level, through: { attributes: [] }, attributes: ['id', 'name'] }] });
  res.json({ ...(result as any).toJSON(), levels: (result as any).Levels?.map((l: any) => l.name) || [] });
});
app.delete('/api/categories/:id', authenticateJWT, isAdmin, async (req, res) => {
  await Category.destroy({ where: { id: req.params.id } });
  res.sendStatus(204);
});

// Levels (public GET, admin CUD)
app.get('/api/levels', async (req, res) => {
  const levels = await Level.findAll({
    where: { isActive: true },
    order: [['order', 'ASC']]
  });
  res.json(levels);
});
app.get('/api/levels/all', authenticateJWT, isAdmin, async (req, res) => {
  const levels = await Level.findAll({ order: [['order', 'ASC']] });
  res.json(levels);
});
app.post('/api/levels', authenticateJWT, isAdmin, async (req, res) => {
  res.json(await Level.create(req.body));
});
app.put('/api/levels/:id', authenticateJWT, isAdmin, async (req, res) => {
  await Level.update(req.body, { where: { id: req.params.id } });
  res.json(await Level.findByPk(req.params.id));
});
app.delete('/api/levels/:id', authenticateJWT, isAdmin, async (req, res) => {
  await Level.destroy({ where: { id: req.params.id } });
  res.sendStatus(204);
});

// EventConfig (public GET, admin PUT)
app.get('/api/event-config', async (req, res) => {
  const configs = await EventConfig.findAll();
  const result: Record<string, string> = {};
  configs.forEach((c: any) => { result[c.key] = c.value; });
  res.json(result);
});
app.get('/api/event-config/all', authenticateJWT, isAdmin, async (req, res) => {
  const configs = await EventConfig.findAll({ order: [['group', 'ASC'], ['key', 'ASC']] });
  res.json(configs);
});
app.put('/api/event-config', authenticateJWT, isAdmin, async (req, res) => {
  const updates = req.body; // { key: value, key2: value2, ... }
  for (const [key, value] of Object.entries(updates)) {
    const [record] = await EventConfig.findOrCreate({ where: { key }, defaults: { key, value: value as string, label: key, group: 'custom' } });
    await record.update({ value: value as string });
  }
  const configs = await EventConfig.findAll();
  const result: Record<string, string> = {};
  configs.forEach((c: any) => { result[c.key] = c.value; });
  res.json(result);
});

// Event asset upload (logo, payment image, etc.)
app.post('/api/event-assets/upload', authenticateJWT, isAdmin, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).send({ message: 'No file uploaded' });
  const configKey = req.body.configKey; // e.g. 'paymentImageUrl' or 'logoUrl'
  const fileUrl = `/uploads/${req.file.filename}`;
  if (configKey) {
    const existing = await EventConfig.findOne({ where: { key: configKey } });
    if (existing) {
      await EventConfig.update({ value: fileUrl }, { where: { key: configKey } });
    } else {
      await EventConfig.create({ key: configKey, value: fileUrl, label: configKey, group: 'branding' });
    }
  }
  res.json({ url: fileUrl, configKey });
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

app.get('/api/matches', async (req, res) => {
  try {
    let allMatches: any[] = [];
    const include = ['robotA', 'robotB', 'referee'];
    
    // Fetch from all category tables
    for (const model of ALL_CATEGORY_MATCH_MODELS) {
      const ms = await (model as any).findAll({ include });
      allMatches = [...allMatches, ...ms];
    }
    
    res.json(allMatches);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post('/api/matches', authenticateJWT, isAdmin, async (req, res) => {
  const model = getMatchModel(req.body.category);
  if (!model) return res.status(400).json({ message: 'Categoría no válida' });
  const newMatch = await (model as any).create(req.body);
  broadcastState();
  res.json(newMatch);
});

app.put('/api/matches/:id', authenticateJWT, isAdmin, async (req, res) => {
  const found = await findMatchInAllTables(req.params.id);
  if (!found) return res.status(404).json({ message: 'Match not found' });
  
  await found.match.update(req.body);
  broadcastState();
  
  const updated = await (found.model as any).findByPk(req.params.id, { include: ['robotA', 'robotB', 'referee'] });
  res.json(updated);
});

app.delete('/api/matches/:id', authenticateJWT, isAdmin, async (req, res) => {
  const found = await findMatchInAllTables(req.params.id);
  if (found) {
    await found.match.destroy();
    broadcastState();
  }
  res.sendStatus(204);
});

// Match routes... (logs removed)

// --- Bracket Generation ---

app.post('/api/brackets/generate', authenticateJWT, isAdmin, async (req, res) => {
  const { category: catName, level: lvlName, robotIds, refereeId: refId } = req.body;
  if (!robotIds || robotIds.length < 2) return res.status(400).send({ message: 'At least 2 robots required' });

  const isRoundBased = (name: string) => {
    const c = name.toLowerCase();
    return c.includes("laberinto") || c.includes("seguidor") || c.includes("biobot") || c.includes("innovaci");
  };

  if (isRoundBased(catName)) {
    try {
      const numRobots = robotIds.length;
      const TargetModel = getMatchModel(catName) as any;
      if (!TargetModel) return res.status(400).json({ message: 'Categoría no válida para rondas' });
      
      // RONDA 1: All participants
      for (const robotId of robotIds) {
        await TargetModel.create({
          category: catName, 
          level: lvlName, 
          refereeId: refId,
          robotAId: robotId,
          robotBId: null as any,
          round: 'RONDA 1',
          isActive: false, 
          isFinished: false, 
          showInDashboard: false,
          scoreA: 0, 
          scoreB: 0, 
          timeLeft: 180
        });
      }

      // RONDA 2: Only if count >= 10 (per user's latest request)
      if (numRobots >= 10) {
        const slotsR2 = Math.floor(numRobots / 2);
        for (let i = 0; i < slotsR2; i++) {
          await TargetModel.create({
            category: catName, 
            level: lvlName, 
            refereeId: refId,
            robotAId: null as any, 
            robotBId: null as any,
            round: 'RONDA 2',
            isActive: false, 
            isFinished: false, 
            showInDashboard: false,
            scoreA: 0, 
            scoreB: 0, 
            timeLeft: 180
          });
        }
      }

      broadcastState();
      return res.json({ message: 'Rounds generated correctly' });
    } catch (err) {
      console.error('Round gen error:', err);
      return res.status(500).send({ message: 'Error generating rounds' });
    }
  }

  // Bracket logic with play-in (CLASIFICATORIO) for non-power-of-2 team counts
  const shuffled = [...robotIds].sort(() => Math.random() - 0.5);
  const numRobots = shuffled.length;

  // Largest power of 2 <= numRobots
  const floorLog = Math.floor(Math.log2(numRobots));
  const floorPow2 = Math.pow(2, floorLog);
  const extra = numRobots - floorPow2;    // number of play-in matches needed
  const directTeams = floorPow2 - extra;  // robots going directly to first round

  try {
    const roundsList: any[][] = [];
    const roundNames = ['FINAL', 'SEMIS', 'QUARTERS', 'OCTAVOS', '16VOS', '32VOS'];
    let lastMatches: any[] = [];
    const TargetModel = getMatchModel(catName) as any;
    if (!TargetModel) return res.status(400).json({ message: 'Categoría no válida para llaves' });

    // Build main bracket top-down (FINAL → first round) using floorPow2 slots
    for (let currentLevel = 0; currentLevel < floorLog; currentLevel++) {
      const numMatchesInRound = Math.pow(2, currentLevel);
      const roundName = roundNames[currentLevel] || `ROUND_${currentLevel}`;
      const matchesInThisRound: any[] = [];

      for (let i = 0; i < numMatchesInRound; i++) {
        const nextMatch = lastMatches[Math.floor(i / 2)];
        const match = await TargetModel.create({
          category: catName,
          level: lvlName,
          refereeId: refId,
          round: roundName,
          nextMatchId: nextMatch ? nextMatch.id : null,
          positionInNextMatch: nextMatch ? (i % 2 === 0 ? 'A' : 'B') : null,
          scoreA: 0,
          scoreB: 0,
          timeLeft: 180,
          robotAId: null as any,
          robotBId: null as any,
          showInDashboard: false
        });
        matchesInThisRound.push(match);
      }

      roundsList.push(matchesInThisRound);
      lastMatches = matchesInThisRound;
    }

    // Assign direct robots to first-round slots (slots 0..directTeams-1)
    const firstRoundMatches = roundsList[roundsList.length - 1];
    for (let i = 0; i < firstRoundMatches.length; i++) {
      const match = firstRoundMatches[i];
      const slotA = i * 2;
      const slotB = i * 2 + 1;
      match.robotAId = slotA < directTeams ? shuffled[slotA] : null;
      match.robotBId = slotB < directTeams ? shuffled[slotB] : null;
      await match.save();
    }

    // Create CLASIFICATORIO play-in matches for the extra teams
    // Each play-in match winner advances to the corresponding first-round slot
    for (let j = 0; j < extra; j++) {
      const targetSlot = directTeams + j;
      const targetMatchIndex = Math.floor(targetSlot / 2);
      const targetPosition = targetSlot % 2 === 0 ? 'A' : 'B';
      const targetMatch = firstRoundMatches[targetMatchIndex];

      await TargetModel.create({
        category: catName,
        level: lvlName,
        refereeId: refId,
        round: 'CLASIFICATORIO',
        nextMatchId: targetMatch.id,
        positionInNextMatch: targetPosition,
        scoreA: 0,
        scoreB: 0,
        timeLeft: 180,
        robotAId: shuffled[directTeams + j * 2],
        robotBId: shuffled[directTeams + j * 2 + 1],
        showInDashboard: false
      });
    }

    broadcastState();
    res.json({ message: 'Bracket generated successfully', matchesCount: floorPow2 - 1 + extra });
  } catch (err) {
    console.error('Bracket gen error:', err);
    res.status(500).send({ message: 'Error generating bracket' });
  }
});

// --- Generic Upload Route ---
app.post('/api/upload', authenticateJWT, isAdmin, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send({ message: 'No file uploaded' });
  res.json({ filename: req.file.filename });
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
  if (!email) {
    return res.status(400).send({ message: 'Email required' });
  }

  const registration = await Registration.findOne({ where: { google_email: email, status: 'DRAFT' } });
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
    sendWelcomeEmail(targetEmail, registration.data).catch(err => {
      console.error('Failed to send welcome email:', err.message);
    });
  });
});

// Public: buscar registro enviado por email (para página /pago)
app.get('/api/registrations/status', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: 'Email requerido' });
  const registration = await Registration.findOne({
    where: { google_email: email as string, status: 'SUBMITTED' },
    order: [['createdAt', 'DESC']]
  });
  if (!registration) return res.status(404).json({ message: 'No se encontró registro' });
  // Solo retornar campos públicos necesarios
  res.json({
    id: registration.id,
    google_email: registration.google_email,
    paymentStatus: registration.paymentStatus,
    payment_proof_filename: registration.payment_proof_filename,
    data: {
      institution: registration.data?.institution,
      robotName: registration.data?.robotName,
      teamName: registration.data?.teamName,
      category: registration.data?.category,
      members: registration.data?.members,
    }
  });
});

// Public: subir comprobante a un registro existente
app.patch('/api/registrations/:id/payment-proof', async (req, res) => {
  const { email, payment_proof_filename } = req.body;
  if (!email || !payment_proof_filename) return res.status(400).json({ message: 'Email y comprobante requeridos' });
  const registration = await Registration.findOne({
    where: { id: req.params.id, google_email: email, status: 'SUBMITTED' }
  });
  if (!registration) return res.status(404).json({ message: 'Registro no encontrado' });
  await registration.update({ payment_proof_filename });
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

app.post('/api/registrations', authenticateJWT, isAdmin, async (req, res) => {
  const { google_email, paymentStatus, payment_proof_filename, data } = req.body;
  if (!google_email) return res.status(400).json({ message: 'Email required' });
  try {
    const isPaid = paymentStatus === 'APPROVED';
    const registration = await Registration.create({
      google_email,
      step: 8,
      status: 'SUBMITTED',
      data: data || {},
      payment_proof_filename: payment_proof_filename || null,
      isPaid,
      paymentStatus: paymentStatus || 'PENDING'
    });
    res.status(201).json(registration);

    // Post-response: Institution/Robot creation (if APPROVED) + email (non-blocking)
    setImmediate(async () => {
      try {
        if (paymentStatus === 'APPROVED' && data) {
          const institutionName = data.institution || 'INDEPENDIENTE';
          const contactEmail = data.email || google_email;
          const membersArr = data.members
            ? data.members.split(',').map((m: string) => m.trim()).filter((m: string) => m.length > 0)
            : [];

          const [institution, created] = await Institution.findOrCreate({
            where: { name: institutionName },
            defaults: { contactEmail, isPaid: true, members: membersArr },
          });

          if (!created) {
            const existingMembers: string[] = institution.members || [];
            const merged = Array.from(new Set([...existingMembers, ...membersArr]));
            await institution.update({ isPaid: true, members: merged });
          }

          const categoryLevel = (data.category || 'JUNIOR').toUpperCase();
          let specificCategory = 'Minisumo Autónomo';
          if (categoryLevel === 'SENIOR' && data.seniorCategory) specificCategory = data.seniorCategory;
          else if (categoryLevel === 'JUNIOR' && data.juniorCategory) specificCategory = data.juniorCategory;
          else if (categoryLevel === 'MASTER' && data.masterCategory) specificCategory = data.masterCategory;

          const robotName = data.robotName || data.teamName || 'ROBOT S/N';
          const existingRobot = await Robot.findOne({
            where: { name: robotName, institutionId: institution.id, category: specificCategory, level: categoryLevel }
          });
          if (!existingRobot) {
            await Robot.create({ name: robotName, institutionId: institution.id, category: specificCategory, level: categoryLevel, isHomologated: false });
          }
          console.log(`[Admin create] Robot "${robotName}" → Institution "${institutionName}" (${existingRobot ? 'ya existía' : 'creado'})`);
        }
      } catch (err) {
        console.error('[Admin create] Error creating Robot/Institution:', err);
      }

      try {
        const targetEmail = data?.email || google_email;
        if (paymentStatus === 'APPROVED') {
          await sendStatusEmail(targetEmail, 'APPROVED', data);
        } else {
          await sendWelcomeEmail(targetEmail, data);
        }
      } catch (err) {
        console.error('[Admin create] Error sending email:', err);
      }
    });
  } catch (err) {
    console.error('Error creating registration (admin):', err);
    res.status(500).json({ message: 'Error creating registration' });
  }
});

app.put('/api/registrations/:id', authenticateJWT, isAdmin, async (req, res) => {
  const { paymentStatus, google_email, payment_proof_filename, data: bodyData } = req.body;

  const updateFields: any = {};
  if (paymentStatus !== undefined) {
    updateFields.paymentStatus = paymentStatus;
    updateFields.isPaid = paymentStatus === 'APPROVED';
  }
  if (google_email !== undefined) updateFields.google_email = google_email;
  if (payment_proof_filename !== undefined) updateFields.payment_proof_filename = payment_proof_filename;
  if (bodyData !== undefined) updateFields.data = bodyData;

  await Registration.update(updateFields, { where: { id: req.params.id } });

  const updatedRegistration = await Registration.findByPk(req.params.id);

  res.json(updatedRegistration);

  // Post-response: Institution/Robot creation and email (non-blocking)
  setImmediate(async () => {
    const regData = updatedRegistration?.data;

    if (updatedRegistration && paymentStatus === 'APPROVED' && regData) {
      try {
        const institutionName = regData.institution || 'INDEPENDIENTE';
        const contactEmail = regData.email || updatedRegistration.google_email;
        const membersArr = regData.members
          ? regData.members.split(',').map((m: string) => m.trim()).filter((m: string) => m.length > 0)
          : [];

        // 1. Find or Create Institution, then update if already existed
        const [institution, created] = await Institution.findOrCreate({
          where: { name: institutionName },
          defaults: { contactEmail, isPaid: true, members: membersArr },
        });

        if (!created) {
          // Merge new members into existing list (no duplicates)
          const existingMembers: string[] = institution.members || [];
          const merged = Array.from(new Set([...existingMembers, ...membersArr]));
          await institution.update({ isPaid: true, members: merged });
        }

        // 2. Determine level and specific category
        const categoryLevel = (regData.category || 'JUNIOR').toUpperCase();
        let specificCategory = 'Minisumo Autónomo';
        if (categoryLevel === 'SENIOR' && regData.seniorCategory) specificCategory = regData.seniorCategory;
        else if (categoryLevel === 'JUNIOR' && regData.juniorCategory) specificCategory = regData.juniorCategory;
        else if (categoryLevel === 'MASTER' && regData.masterCategory) specificCategory = regData.masterCategory;

        const robotName = regData.robotName || regData.teamName || 'ROBOT S/N';

        // 3. Find or Create Robot (usando findOne + create para evitar problemas con findOrCreate e institutionId)
        const existingRobot = await Robot.findOne({
          where: { name: robotName, institutionId: institution.id, category: specificCategory, level: categoryLevel }
        });
        if (!existingRobot) {
          await Robot.create({ name: robotName, institutionId: institution.id, category: specificCategory, level: categoryLevel, isHomologated: false });
        }
        console.log(`[Auto-Create] Robot "${robotName}" → Institution "${institutionName}" (${existingRobot ? 'ya existía' : 'creado'})`);
      } catch (err) {
        console.error('[Auto-Create] Error creating Robot/Institution:', err);
      }
    }

    if (updatedRegistration && (paymentStatus === 'APPROVED' || paymentStatus === 'REJECTED')) {
      try {
        const targetEmail = updatedRegistration.data?.email || updatedRegistration.google_email;
        await sendStatusEmail(targetEmail, paymentStatus, updatedRegistration.data);
      } catch (err) {
        console.error('[Email] Error sending status email:', err);
      }
    }
  });
});

app.delete('/api/registrations/:id', authenticateJWT, isAdmin, async (req, res) => {
  await Registration.destroy({ where: { id: req.params.id } });
  res.sendStatus(204);
});

// --- Socket.io Real-time Logic ---

const broadcastState = async () => {
  try {
    let allMatches: any[] = [];
    const include = [
      { model: Robot, as: 'robotA', include: [Institution] },
      { model: Robot, as: 'robotB', include: [Institution] },
    ];

    // Fetch from all category tables
    for (const model of ALL_CATEGORY_MATCH_MODELS) {
      const ms = await (model as any).findAll({ include });
      allMatches = [...allMatches, ...ms];
    }
    
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


io.on('connection', (socket) => {
  broadcastState();
  socket.on('control_match', async (data: { matchId: string, action: string, payload?: any }) => {
    const { matchId, action, payload } = data;
    const found = await findMatchInAllTables(matchId, { include: ['robotA', 'robotB'] });
    if (!found) return;
    
    const { match, model } = found;

    switch (action) {
      case 'START': match.isActive = true; break;
      case 'PAUSE': match.isActive = false; break;
      case 'RESET':
        match.scoreA = 0; match.scoreB = 0;
        match.penaltiesA = []; match.penaltiesB = [];
        match.roundWinners = [];
        match.timeLeft = typeof payload === 'number' ? payload : 180;
        match.isActive = false;
        match.isFinished = false;
        match.winnerId = null as any;
        break;
      case 'SET_TIME': match.timeLeft = Number(payload) || 0; break;
      case 'ADD_SCORE_A': {
        const p = typeof payload === 'object' ? payload.points : (payload || 1);
        match.scoreA += p; 
        break;
      }
      case 'ADD_SCORE_B': {
        const p = typeof payload === 'object' ? payload.points : (payload || 1);
        match.scoreB += p; 
        break;
      }
      case 'SET_SCORE_A': match.scoreA = Number(payload); break;
      case 'SET_SCORE_B': match.scoreB = Number(payload); break;
      case 'ADD_PENALTY_A': match.penaltiesA = [...match.penaltiesA, payload || 'Warning']; break;
      case 'ADD_PENALTY_B': match.penaltiesB = [...match.penaltiesB, payload || 'Warning']; break;
      case 'ADD_TIME': match.timeLeft += Number(payload) || 30; break;
      
      case 'BB_LOOSE_PARTS': match.isActive = false; break;
      case 'BB_ACCIDENT_START': match.isActive = false; break;
      case 'BB_PROLONGATION_START':
        match.isActive = false;
        if (payload === 'A') {
          match.scoreA -= 5;
          match.penaltiesA = [...match.penaltiesA, 'Prórroga'];
        } else {
          match.scoreB -= 5;
          match.penaltiesB = [...match.penaltiesB, 'Prórroga'];
        }
        break;
      
      case 'MS_ROUND_WIN':
        if (payload === 'A') match.scoreA += 1;
        if (payload === 'B') match.scoreB += 1;
        match.roundWinners = [...match.roundWinners, payload];
        break;
      case 'MS_VIOLATION':
        if (payload === 'A') {
          match.penaltiesA = [...match.penaltiesA, 'Violación'];
          const vCount = (match.penaltiesA || []).filter((p: any) => p === 'Violación').length;
          if (vCount > 0 && vCount % 2 === 0) {
            // Reaches 2, 4, 6... violations total
            match.scoreB += 1;
            match.roundWinners = [...(match.roundWinners || []), 'B'];
            match.isActive = false;
          }
        } else {
          match.penaltiesB = [...match.penaltiesB, 'Violación'];
          const vCount = (match.penaltiesB || []).filter((p: any) => p === 'Violación').length;
          if (vCount > 0 && vCount % 2 === 0) {
            match.scoreA += 1;
            match.roundWinners = [...(match.roundWinners || []), 'A'];
            match.isActive = false;
          }
        }
        break;
      case 'MS_GRAVE_PENALTY':
        if (payload === 'A') {
          match.scoreA = 0; match.scoreB = 3;
          match.roundWinners = ['B', 'B', 'B'];
          match.winnerId = match.robotBId as any;
          match.penaltiesA = [...(match.penaltiesA || []), 'Falta Grave/Descalificación'];
        } else {
          match.scoreB = 0; match.scoreA = 3;
          match.roundWinners = ['A', 'A', 'A'];
          match.winnerId = match.robotAId as any;
          match.penaltiesB = [...(match.penaltiesB || []), 'Falta Grave/Descalificación'];
        }
        // User requested NOT to finish automatically, referee will click FINISH manually
        match.isActive = false;
        break;
      case 'MS_IMMOBILIZATION_START': match.isActive = false; break;
      case 'BB_IMMOBILIZATION_START': match.isActive = false; break;
      case 'BB_SURRENDER':
        match.isActive = false;
        match.isFinished = true;
        match.timeLeft = 0;
        if (payload === 'A') match.winnerId = match.robotBId as any;
        else match.winnerId = match.robotAId as any;
        break;
      
      case 'BIO_OBJECT_START': break;
      case 'BIO_OBJECT_RESULT':
        if (payload.success) match.scoreA += (payload.points || 0);
        break;
      case 'BIO_REST_START': break;
      case 'FINISH':
        match.isActive = false;
        match.isFinished = true;
        let winnerId = payload?.winnerId || null;
        if (!winnerId) {
          if (match.scoreA > match.scoreB) winnerId = match.robotAId;
          else if (match.scoreB > match.scoreA) winnerId = match.robotBId;
        }
        match.winnerId = winnerId as any;

        if (winnerId && match.nextMatchId) {
          // IMPORTANT: nextMatch should be in the SAME category table
          const nextMatch = await (model as any).findByPk(match.nextMatchId);
          if (nextMatch) {
            if (match.positionInNextMatch === 'A') nextMatch.robotAId = winnerId as any;
            else nextMatch.robotBId = winnerId as any;
            await nextMatch.save();
          }
        }
        break;

      case 'MAZE_START': match.isActive = true; break;
      case 'MAZE_FINISH': match.isActive = false; break;
      case 'MAZE_RESTART': break;
      case 'MAZE_FAULT': break;
      case 'MAZE_DISQUALIFY':
        match.isActive = false;
        match.isFinished = true;
        match.winnerId = null as any; 
        break;

      case 'REVEAL_WINNER':
        io.emit('trigger_reveal_winner', { matchId: match.id });
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
sequelize.sync({ alter: true }).then(async () => {
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

  // Seed levels if empty
  const levelCount = await Level.count();
  if (levelCount === 0) {
    await Level.bulkCreate([
      { name: 'Junior', description: 'OPERADORES EN FORMACIÓN\n(Básico)', icon: 'Baby', order: 1 },
      { name: 'Senior', description: 'COMBATIENTES INTERMEDIOS\n(Bachillerato)', icon: 'Bot', order: 2 },
      { name: 'Master', description: 'INGENIERÍA PESADA\n(Universidades/Clubes)', icon: 'GraduationCap', order: 3 },
    ]);
    console.log('Seed: Levels created');
  }

  // Seed categories if empty
  const categoryCount = await Category.count();
  if (categoryCount === 0) {
    const urls = {
      robofut: 'https://ucacueedu-my.sharepoint.com/personal/nathalia_peralta_ucacue_edu_ec/_layouts/15/Doc.aspx?sourcedoc=%7BABC9DD7A-3FCE-409D-ABCA-E0D90576CBBA%7D&file=Reglas_Robofut.docx&action=default&mobileredirect=true&CT=1771016156656&OR=ItemsView',
      minisumo: 'https://ucacueedu-my.sharepoint.com/personal/nathalia_peralta_ucacue_edu_ec/_layouts/15/onedrive.aspx?id=%2Fpersonal%2Fnathalia%5Fperalta%5Fucacue%5Fedu%5Fec%2FDocuments%2F1%2E%20Unidad%20Academica%20de%20Informatica%2C%20ciencias%20de%20la%20computaci%C3%B3n%20e%20innovacion%20tecnologica%2FGestion%20de%20proyectos%2FCatoBots%2FIII%20Edicion%2FReglamentos&ga=1',
      laberinto: 'https://ucacueedu-my.sharepoint.com/:w:/r/personal/nathalia_peralta_ucacue_edu_ec/_layouts/15/Doc.aspx?sourcedoc=%7B8B8E0F68-2D21-4C00-979A-7195CBF59F2A%7D&file=ReglamentoLaberinto_v1.docx&action=default&mobileredirect=true',
      battlebots: 'https://ucacueedu-my.sharepoint.com/:w:/r/personal/nathalia_peralta_ucacue_edu_ec/_layouts/15/Doc.aspx?sourcedoc=%7B84E15B97-6EE4-4462-B0F5-CAD12491D94F%7D&file=BattleBots.docx&action=default&mobileredirect=true',
      seguidor: 'https://ucacueedu-my.sharepoint.com/:w:/r/personal/nathalia_peralta_ucacue_edu_ec/_layouts/15/Doc.aspx?sourcedoc=%7BCAE4B9A8-D383-41E6-9AB8-2DF7FCBE172C%7D&file=ReglamentoSeguidordeLinea.docx&action=default&mobileredirect=true',
      sumo_rc: 'https://ucacueedu-my.sharepoint.com/:w:/r/personal/nathalia_peralta_ucacue_edu_ec/_layouts/15/Doc.aspx?sourcedoc=%7BE504FB42-63DE-4F59-81F4-39B0B7B477DD%7D&file=ReglamentoSumoRC.docx&action=default&mobileredirect=true',
      scratch: 'https://ucacueedu-my.sharepoint.com/:w:/r/personal/nathalia_peralta_ucacue_edu_ec/_layouts/15/Doc.aspx?sourcedoc=%7B964F0D59-F202-4681-BFAD-FA11CCEDEC2C%7D&file=Scratch%20%26%20Play%20-%20Code%20Masters%20Arena.docx&action=default&mobileredirect=true',
    };

    const categoryDefs = [
      { data: { name: 'RoboFut', icon: 'Trophy', rulesUrl: urls.robofut, order: 1 }, levels: ['Junior', 'Senior'] },
      { data: { name: 'Minisumo Autónomo', icon: 'Bot', rulesUrl: urls.minisumo, order: 2 }, levels: ['Junior', 'Senior', 'Master'] },
      { data: { name: 'Laberinto', icon: 'Map', rulesUrl: urls.laberinto, order: 3 }, levels: ['Junior', 'Senior'] },
      { data: { name: 'BattleBots 1lb', icon: 'Hammer', rulesUrl: urls.battlebots, order: 4 }, levels: ['Junior', 'Senior', 'Master'] },
      { data: { name: 'Seguidor de Línea', icon: 'Activity', rulesUrl: urls.seguidor, order: 5 }, levels: ['Junior', 'Senior', 'Master'] },
      { data: { name: 'Sumo RC', icon: 'Gamepad2', rulesUrl: urls.sumo_rc, order: 6 }, levels: ['Junior', 'Senior'] },
      { data: { name: 'Scratch & Play: Code Masters Arena', icon: 'Code', rulesUrl: urls.scratch, order: 7 }, levels: ['Junior', 'Senior'] },
      { data: { name: 'Batalla de Palitos de Helado', icon: 'Hammer', rulesUrl: null, order: 8 }, levels: ['Junior'] },
      { data: { name: 'BioBot', icon: 'Leaf', rulesUrl: null, order: 9 }, levels: ['Senior'] },
      { data: { name: 'RoboFut Master', icon: 'Trophy', rulesUrl: urls.robofut, order: 10 }, levels: ['Master'] },
    ];

    for (const def of categoryDefs) {
      const cat = await Category.create(def.data);
      const levelRecords = await Level.findAll({ where: { name: def.levels } });
      await (cat as any).setLevels(levelRecords);
    }
    console.log('Seed: Categories created with level assignments');
  }

  // Seed event config if empty
  const configCount = await EventConfig.count();
  if (configCount === 0) {
    await EventConfig.bulkCreate([
      // Event Info
      { key: 'eventName', value: 'CATOBOTS IV EDICIÓN', label: 'Nombre del Evento', group: 'evento' },
      { key: 'eventDate', value: '20 DE MARZO DEL 2026', label: 'Fecha del Evento', group: 'evento' },
      { key: 'eventVenue', value: 'COLISEO DE LAS AGUILAS ROJAS (TARQUI Y HUMBOLT)', label: 'Dirección del Evento', group: 'evento' },
      { key: 'eventMapsUrl', value: 'https://maps.app.goo.gl/dwUEErcrpNe4CiN59', label: 'URL Google Maps', group: 'evento' },
      // Contacts
      { key: 'contactPhone', value: '', label: 'Teléfono de Contacto', group: 'contacto' },
      { key: 'contactEmail', value: '', label: 'Correo de Contacto', group: 'contacto' },
      // Payment
      { key: 'registrationCost', value: '10', label: 'Costo de Inscripción ($)', group: 'pago' },
      { key: 'bankName', value: 'Cooperativa Biblián', label: 'Entidad Financiera', group: 'pago' },
      { key: 'accountNumber', value: '0212011159836', label: 'Número de Cuenta', group: 'pago' },
      { key: 'accountType', value: 'Ahorros', label: 'Tipo de Cuenta', group: 'pago' },
      { key: 'accountHolder', value: 'Segundo Pauta', label: 'Beneficiario', group: 'pago' },
      { key: 'accountHolderId', value: '0101995843', label: 'Cédula del Beneficiario', group: 'pago' },
      // General Instructions
      { key: 'generalInstructions', value: 'Representación Institucional: Cada Unidad Educativa podrá inscribir un máximo de 4 robots por categoría. Estos cupos son exclusivos para la institución, independientemente de si los estudiantes pertenecen a la jornada matutina, vespertina o a un club independiente. La Unidad Educativa es la única entidad encargada de seleccionar a sus representantes oficiales.\n\nCosto de Inscripción: El valor de la inscripción es de $10 por Institución Educativa.\n\nEs fundamental escribir correctamente los nombres de la Unidad Educativa, Robots, Equipos e Integrantes.\n\nSe recomienda leer detenidamente el reglamento que será compartido.\n\nLos robots deberán ser homologados previamente a la competencia.\n\nLos equipos deben registrarse a través del formulario oficial del evento.', label: 'Indicaciones Generales', group: 'instrucciones' },
      // Logo
      { key: 'logoUrl', value: '/logo-yellow.png', label: 'URL del Logo', group: 'branding' },
      { key: 'paymentImageUrl', value: '/src/assets/pago.png', label: 'Imagen de Pago', group: 'branding' },
      { key: 'rulesGeneralUrl', value: 'https://ucacueedu-my.sharepoint.com/personal/nathalia_peralta_ucacue_edu_ec/_layouts/15/onedrive.aspx?id=%2Fpersonal%2Fnathalia%5Fperalta%5Fucacue%5Fedu%5Fec%2FDocuments%2F1%2E%20Unidad%20Academica%20de%20Informatica%2C%20ciencias%20de%20la%20computaci%C3%B3n%20e%20innovacion%20tecnologica%2FGestion%20de%20proyectos%2FCatoBots%2FIII%20Edicion%2FReglamentos&ga=1', label: 'Enlace Reglamento General', group: 'reglas' },
      { key: 'maxRobotsPerCategory', value: '4', label: 'Máx. Robots por Categoría por Institución', group: 'reglas' },
    ]);
    console.log('Seed: EventConfig created');
  }

  // Global Timer
  setInterval(async () => {
    try {
      let anyTick = false;
      for (const model of ALL_CATEGORY_MATCH_MODELS) {
        const activeMatches = await (model as any).findAll({ where: { isActive: true } });
        for (const match of activeMatches) {
          anyTick = true;
          if (match.timeLeft > 0) {
            match.timeLeft -= 1;
            await match.save();
          } else {
            match.isActive = false;
            await match.save();
          }
        }
      }
      if (anyTick) broadcastState();
    } catch (err) {
      console.error('Error in global timer:', err);
    }
  }, 1000);

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running with MySQL support on port ${PORT}`);
  });
}).catch(err => {
  console.error('Database connection failed:', err);
});
