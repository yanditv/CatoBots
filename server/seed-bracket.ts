
import { Robot } from './models/Robot';
import { Institution } from './models/Institution';
import { Match } from './models/Match';
import { User } from './models/User';
import sequelize from './config/db';
import bcrypt from 'bcryptjs';

const DEMO_CATEGORY = 'Minisumo Autónomo';
const DEMO_LEVEL = 'SENIOR';

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    await sequelize.sync({ force: false });
    console.log('Database synchronized.');

    // Fix legacy schema issue
    try {
      await sequelize.query("ALTER TABLE Robots MODIFY COLUMN weightClass VARCHAR(255) NULL");
    } catch (e) {
      // Ignore if column doesn't exist or other error
      console.log('Schema fix note:', (e as any).message);
    }

    // Clear existing for demo category
    await Match.destroy({ where: { category: DEMO_CATEGORY } });
    await Robot.destroy({ where: { category: DEMO_CATEGORY, level: DEMO_LEVEL } });
    await Institution.destroy({ where: { name: 'Demo Tech Institute' } }); // Cleanup previous runs if specific name used

    // Create Referee
    const [referee] = await User.findOrCreate({
      where: { username: 'referee_demo' },
      defaults: {
        password: bcrypt.hashSync('demo123', 8),
        role: 'REFEREE'
      }
    });

    // Create Institutions & Robots (16 robots for Octavos)
    const robots = [];
    for (let i = 1; i <= 8; i++) {
      const inst = await Institution.create({
        name: `Instituto Técnico ${i}`,
        contactEmail: `contact${i}@tech.edu`,
        isPaid: true,
        members: [`Estudiante A${i}`, `Estudiante B${i}`]
      });

      const r1 = await Robot.create({
        name: `RoboWarrior ${i}-A`,
        level: DEMO_LEVEL,
        category: DEMO_CATEGORY,
        isHomologated: true,
        institutionId: inst.id
      });
      
      const r2 = await Robot.create({
        name: `RoboWarrior ${i}-B`,
        level: DEMO_LEVEL,
        category: DEMO_CATEGORY,
        isHomologated: true,
        institutionId: inst.id
      });
      
      robots.push(r1, r2);
    }

    console.log(`Created ${robots.length} robots.`);

    // Generate Matches (Octavos -> Final)
    // 16 Robots -> 8 Matches (Octavos) -> 4 (Quarters) -> 2 (Semis) -> 1 (Final)
    // Total rounds: 4. PowerOf2 = 4 (2^4 = 16)

    const roundNames = ['FINAL', 'SEMIS', 'QUARTERS', 'OCTAVOS']; // Level 0 to 3
    let nextRoundMatches: any[] = [];
    const rounds: any[] = [];

    // Create matches Top-Down (Final first) so we have IDs for nextMatchId
    for (let level = 0; level < 4; level++) {
      const roundName = roundNames[level];
      const numMatches = Math.pow(2, level);
      const currentRoundMatches = [];

      for (let i = 0; i < numMatches; i++) {
        const nextMatch = nextRoundMatches[Math.floor(i / 2)];
        const match = await Match.create({
          category: DEMO_CATEGORY,
          level: DEMO_LEVEL,
          refereeId: referee.id,
          round: roundName,
          nextMatchId: nextMatch ? nextMatch.id : null,
          positionInNextMatch: nextMatch ? (i % 2 === 0 ? 'A' : 'B') : null,
          scoreA: 0, 
          scoreB: 0,
          isActive: false,
          isFinished: false
        });
        currentRoundMatches.push(match);
      }
      rounds.push(currentRoundMatches);
      nextRoundMatches = currentRoundMatches;
    }

    // Assign robots to the first round (Octavos - index 3 in rounds array)
    const firstRoundMatches = rounds[3]; // The last created round
    // Shuffle robots
    const shuffled = robots.sort(() => 0.5 - Math.random());

    for (let i = 0; i < firstRoundMatches.length; i++) {
      const match = firstRoundMatches[i];
      match.robotAId = shuffled[i * 2].id;
      match.robotBId = shuffled[i * 2 + 1].id;
      await match.save();
    }

    // SIMULATE: Play first 2 matches of Octavos
    const m1 = firstRoundMatches[0];
    const m2 = firstRoundMatches[1];

    // M1: Robot A wins
    m1.scoreA = 3;
    m1.scoreB = 0;
    m1.isFinished = true;
    m1.winnerId = m1.robotAId;
    await m1.save();

    // M2: Robot B wins
    m2.scoreA = 1;
    m2.scoreB = 2;
    m2.isFinished = true;
    m2.winnerId = m2.robotBId;
    await m2.save();

    // Advance winners to Quarters Match 0
    const qMatch = rounds[2][0]; // First match of Quarters
    qMatch.robotAId = m1.winnerId;
    qMatch.robotBId = m2.winnerId;
    await qMatch.save();

    console.log('Simulated 2 matches played and winners advanced.');

    console.log('Bracket generated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
