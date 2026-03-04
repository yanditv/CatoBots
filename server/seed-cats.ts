import { Category } from './models/Category';
import { Level } from './models/Level';
import { CategoryLevel } from './models/CategoryLevel';
import sequelize from './config/db';

Category.belongsToMany(Level, { through: CategoryLevel, foreignKey: 'categoryId', otherKey: 'levelId' });
Level.belongsToMany(Category, { through: CategoryLevel, foreignKey: 'levelId', otherKey: 'categoryId' });

async function run() {
  await sequelize.authenticate();

  const urls = {
    robofut: 'https://ucacueedu-my.sharepoint.com/...',
    minisumo: 'https://ucacueedu-my.sharepoint.com/...',
    laberinto: 'https://ucacueedu-my.sharepoint.com/...',
    battlebots: 'https://...',
    seguidor: 'https://...',
    sumo_rc: 'https://...',
    scratch: 'https://...',
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

  await Category.destroy({ where: {} });
  await CategoryLevel.destroy({ where: {} });

  for (const def of categoryDefs) {
    const cat = await Category.create(def.data);
    const levelRecords = await Level.findAll({ where: { name: def.levels } });
    await (cat as any).setLevels(levelRecords);
  }
  
  console.log('Categories seeded successfully with levels!');
  process.exit(0);
}

run();
