import { Category } from './models/Category';
import { Match } from './models/Match';
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

    // 4. Create one battle for each category
    let createdCount = 0;
    for (const cat of categories) {
      await Match.create({
        category: cat.name,
        level: null, // Depending on the minigame, levels might vary. We can leave it null for this generic seed or assign a default.
        refereeId: referee.id,
        round: 'FINAL', // Just a default round
        scoreA: 0, 
        scoreB: 0,
        isActive: false,
        isFinished: false,
        showInDashboard: true // Optional: show in dashboard if needed
      });
      createdCount++;
      console.log(`Created match for category: ${cat.name}`);
    }

    console.log(`Successfully created ${createdCount} matches assigned to referee ${referee.username}.`);
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedRefereeBattles();
