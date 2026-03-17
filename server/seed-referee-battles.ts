import { Category } from './models/Category';
import { Match } from './models/Match';
import { Robot } from './models/Robot';
import { Institution } from './models/Institution';
import { User } from './models/User';
import sequelize from './config/db';
import bcrypt from 'bcryptjs';

const seedRefereeBattles = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // 1. Create or Find Referee
    const REFEREE_USERNAME = 'referee_general';
    const [referee] = await User.findOrCreate({
      where: { username: REFEREE_USERNAME },
      defaults: {
        password: bcrypt.hashSync('referee123', 8),
        role: 'REFEREE'
      }
    });

    console.log(`Referee found/created: ${referee.username} (ID: ${referee.id})`);

    // 2. Clear old matches that might conflict if needed (Optional, we'll just clear matches for this referee)
    await Match.destroy({ where: { refereeId: referee.id } });
    console.log(`Cleared previous matches for referee: ${referee.username}`);

    // 3. Get all categories
    const categories = await Category.findAll();
    console.log(`Found ${categories.length} categories.`);

    // 4. Create one battle for each category with robots assigned
    let createdCount = 0;
    
    // Ensure we have a dummy institution for seed robots
    const [dummyInst] = await Institution.findOrCreate({
      where: { name: 'Seed Dummy Institute' },
      defaults: {
        contactEmail: 'seed@catobots.com',
        isPaid: true
      }
    });

    for (const cat of categories) {
      // Find or create 2 robots for this category
      let robots = await Robot.findAll({ where: { category: cat.name }, limit: 2 });
      
      if (robots.length < 2) {
        console.log(`Not enough robots for ${cat.name}. Creating dummy robots...`);
        const r1 = await Robot.create({
          name: `${cat.name} Alpha`,
          category: cat.name,
          level: 'SENIOR',
          isHomologated: true,
          institutionId: dummyInst.id
        });
        const r2 = await Robot.create({
          name: `${cat.name} Beta`,
          category: cat.name,
          level: 'SENIOR',
          isHomologated: true,
          institutionId: dummyInst.id
        });
        robots = [r1, r2];
      }

      await Match.create({
        category: cat.name,
        level: 'SENIOR', 
        refereeId: referee.id,
        robotAId: robots[0].id,
        robotBId: robots[1].id,
        round: 'TEST', 
        scoreA: 0, 
        scoreB: 0,
        isActive: false,
        isFinished: false,
        showInDashboard: true 
      });
      createdCount++;
      console.log(`Created match for category: ${cat.name} (${robots[0].name} vs ${robots[1].name})`);
    }

    console.log(`Successfully created ${createdCount} matches assigned to referee ${referee.username}.`);
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedRefereeBattles();
