import { Category } from './models/Category';
import { Robot } from './models/Robot';
import { Institution } from './models/Institution';
import { User } from './models/User';
import { Level } from './models/Level';
import { CategoryLevel } from './models/CategoryLevel';
import { CATEGORY_MATCH_MODELS, ALL_CATEGORY_MATCH_MODELS } from './models/CategoryMatches';
import sequelize from './config/db';
import bcrypt from 'bcryptjs';

const getMatchModel = (category: string) => {
    return CATEGORY_MATCH_MODELS[category];
};

const seedAllData = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // 1. Ensure Categories and Levels exist (re-sync)
        await sequelize.sync({ alter: true });
        console.log('Database synced.');

        // 2. Clear old data to prevent duplication
        for (const model of ALL_CATEGORY_MATCH_MODELS) {
            await (model as any).destroy({ where: {} });
        }
        await Robot.destroy({ where: {} });
        console.log('Cleared All Matches and Robots.');

        // 3. Ensure a dummy institution exists
        const [dummyInst] = await Institution.findOrCreate({
            where: { name: 'CATO BOTS INSTITUTE' },
            defaults: {
                contactEmail: 'competition@catobots.edu',
                isPaid: true,
                members: ['Admin Principal', 'Coordinador General']
            }
        });

        // 4. Configuration for seeding
        const competitionConfigs = [
            { catName: 'RoboFut', level: 'JUNIOR', count: 16, type: 'bracket' },
            { catName: 'RoboFut', level: 'SENIOR', count: 15, type: 'bracket' },
            { catName: 'RoboFut Master', level: 'MASTER', count: 9, type: 'bracket' },
            { catName: 'Minisumo Autónomo', level: 'JUNIOR', count: 6, type: 'bracket' },
            { catName: 'Minisumo Autónomo', level: 'SENIOR', count: 6, type: 'bracket' },
            { catName: 'Minisumo Autónomo', level: 'MASTER', count: 9, type: 'bracket' },
            { catName: 'Laberinto', level: 'JUNIOR', count: 3, type: 'round' },
            { catName: 'Laberinto', level: 'SENIOR', count: 3, type: 'round' },
            { catName: 'BattleBots 1lb', level: 'JUNIOR', count: 9, type: 'bracket' },
            { catName: 'BattleBots 1lb', level: 'SENIOR', count: 8, type: 'bracket' },
            { catName: 'BattleBots 1lb', level: 'MASTER', count: 8, type: 'bracket' },
            { catName: 'Seguidor de Línea', level: 'JUNIOR', count: 11, type: 'round' },
            { catName: 'Seguidor de Línea', level: 'SENIOR', count: 10, type: 'round' },
            { catName: 'Seguidor de Línea', level: 'MASTER', count: 11, type: 'round' },
            { catName: 'Sumo RC', level: 'JUNIOR', count: 16, type: 'bracket' },
            { catName: 'Sumo RC', level: 'SENIOR', count: 16, type: 'bracket' },
            { catName: 'Batalla de Palitos de Helado', level: 'JUNIOR', count: 5, type: 'bracket' },
            { catName: 'BioBot', level: 'SENIOR', count: 3, type: 'round' },
        ];

        for (const config of competitionConfigs) {
            console.log(`\n--- Seeding ${config.catName} (${config.level}) ---`);

            // Find category to ensure it exists
            const category = await Category.findOne({ where: { name: config.catName } });
            if (!category) {
                console.error(`Category ${config.catName} not found in database! Skipping.`);
                continue;
            }

            // A. Find or create a unique referee for this category/level combination
            const refUsername = `ref_${config.catName.replace(/ /g, '_').toLowerCase()}_${config.level.toLowerCase()}`;
            const [referee] = await User.findOrCreate({
                where: { username: refUsername },
                defaults: {
                    password: bcrypt.hashSync('referee123', 8),
                    role: 'REFEREE'
                }
            });
            console.log(`- Referee: ${referee.username}`);

            // B. Create Robots
            const robots = [];
            for (let i = 1; i <= config.count; i++) {
                const robot = await Robot.create({
                    name: `Robot_${config.catName.substring(0, 3)}_${config.level.substring(0, 2)}_${i}`,
                    category: config.catName,
                    level: config.level as any,
                    isHomologated: true,
                    institutionId: dummyInst.id
                });
                robots.push(robot);
            }
            console.log(`- Created ${robots.length} robots.`);

            // C. Create Matches / Bracket
            const TargetModel = getMatchModel(config.catName) as any;

            if (config.type === 'bracket' && robots.length >= 2) {
                console.log(`- Generating bracket in ${TargetModel.tableName}...`);
                await generateBracket(config.catName, config.level as any, robots.map(r => r.id), referee.id);
            } else if (config.type === 'round' && robots.length > 0) {
                console.log(`- Generating round matches in ${TargetModel.tableName}...`);
                // RONDA 1: All robots compete individually
                for (const robot of robots) {
                    await TargetModel.create({
                        category: config.catName,
                        level: config.level as any,
                        refereeId: referee.id,
                        robotAId: robot.id,
                        robotBId: null as any,
                        round: 'RONDA 1',
                        isActive: false,
                        isFinished: false,
                        showInDashboard: true,
                        scoreA: 0,
                        scoreB: 0,
                        timeLeft: 180
                    });
                }

                // RONDA 2: Top X slots (Dynamic: Half of participants, only if count > 5)
                const ronda2Slots = robots.length > 5 ? Math.floor(robots.length / 2) : 0;
                if (ronda2Slots > 0) {
                    for (let i = 0; i < ronda2Slots; i++) {
                        await TargetModel.create({
                            category: config.catName,
                            level: config.level as any,
                            refereeId: referee.id,
                            robotAId: null as any,
                            robotBId: null as any,
                            round: 'RONDA 2',
                            isActive: false,
                            isFinished: false,
                            showInDashboard: true,
                            scoreA: 0,
                            scoreB: 0,
                            timeLeft: 180
                        });
                    }
                }
            } else {
                console.log(`- No matches created (type: ${config.type}, count: ${robots.length})`);
            }
        }

        console.log('\n--- SEEDING COMPLETED SUCCESSFULLY ---');
        process.exit(0);
    } catch (err) {
        console.error('Seeding process failed:', err);
        process.exit(1);
    }
};

async function generateBracket(category: string, level: string, robotIds: string[], refereeId: string) {
    const shuffled = [...robotIds].sort(() => Math.random() - 0.5);
    const numRobots = shuffled.length;
    const powerOf2 = Math.ceil(Math.log2(numRobots));
    const totalSlots = Math.pow(2, powerOf2);

    const filledRobots = [...shuffled];
    while (filledRobots.length < totalSlots) filledRobots.push(null as any);

    const rounds = [];
    const roundNames = ['FINAL', 'SEMIS', 'QUARTERS', 'OCTAVOS', '16VOS', '32VOS'];
    let nextRoundMatches: any[] = [];
    const TargetModel = getMatchModel(category) as any;

    // Create matches level by level (Final to early rounds)
    for (let currentLevel = 0; currentLevel < powerOf2; currentLevel++) {
        const numMatchesInRound = Math.pow(2, currentLevel);
        const roundName = roundNames[currentLevel] || `ROUND_${currentLevel}`;
        const matchesInThisRound: any[] = [];

        for (let i = 0; i < numMatchesInRound; i++) {
            const nextMatch = nextRoundMatches[Math.floor(i / 2)];
            const match = await TargetModel.create({
                category,
                level: level,
                refereeId,
                round: roundName,
                nextMatchId: nextMatch ? nextMatch.id : null,
                positionInNextMatch: nextMatch ? (i % 2 === 0 ? 'A' : 'B') : null,
                scoreA: 0,
                scoreB: 0,
                timeLeft: 180,
                robotAId: null as any,
                robotBId: null as any,
                showInDashboard: true
            });
            matchesInThisRound.push(match);
        }

        rounds.push(matchesInThisRound);
        nextRoundMatches = matchesInThisRound;
    }

    // Assign robots to the first round (the deepest one)
    const firstRoundMatches = rounds[rounds.length - 1];
    for (let i = 0; i < firstRoundMatches.length; i++) {
        const match = firstRoundMatches[i];
        match.robotAId = filledRobots[i * 2];
        match.robotBId = filledRobots[i * 2 + 1];
        await match.save();
    }
}

seedAllData();
