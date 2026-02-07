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

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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

// --- Socket.io Real-time Logic ---

const broadcastState = async () => {
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
    }
    await match.save();
    broadcastState();
  });
});

const PORT = Number(process.env.PORT) || 3001;
sequelize.sync().then(async () => {
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
