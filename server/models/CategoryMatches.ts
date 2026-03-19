import { Model } from 'sequelize';
import sequelize from '../config/db';
import { Robot } from './Robot';
import { User } from './User';
import { BaseMatchFields } from './BaseMatchFields';

export class RobofutMatch extends Model {}
RobofutMatch.init(BaseMatchFields, { sequelize, tableName: 'robofutMatches', modelName: 'RobofutMatch' });

export class MinisumoMatch extends Model {}
MinisumoMatch.init(BaseMatchFields, { sequelize, tableName: 'minisumoautonomoMatches', modelName: 'MinisumoMatch' });

export class BiobotMatch extends Model {}
BiobotMatch.init(BaseMatchFields, { sequelize, tableName: 'biobotMatches', modelName: 'BiobotMatch' });

export class SumoMatch extends Model {}
SumoMatch.init(BaseMatchFields, { sequelize, tableName: 'sumoMatches', modelName: 'SumoMatch' });

export class LaberintoMatch extends Model {}
LaberintoMatch.init(BaseMatchFields, { sequelize, tableName: 'laberintoMatches', modelName: 'LaberintoMatch' });

export class BattleBotsMatch extends Model {}
BattleBotsMatch.init(BaseMatchFields, { sequelize, tableName: 'battlebotsMatches', modelName: 'BattleBotsMatch' });

export class SeguidorMatch extends Model {}
SeguidorMatch.init(BaseMatchFields, { sequelize, tableName: 'seguidordelineaMatches', modelName: 'SeguidorMatch' });

export class PalitosMatch extends Model {}
PalitosMatch.init(BaseMatchFields, { sequelize, tableName: 'batalladepalitosMatches', modelName: 'PalitosMatch' });

// Setup associations for each model
const matchModels = [RobofutMatch, MinisumoMatch, BiobotMatch, SumoMatch, LaberintoMatch, BattleBotsMatch, SeguidorMatch, PalitosMatch];

matchModels.forEach(m => {
  m.belongsTo(Robot, { as: 'robotA', foreignKey: 'robotAId' });
  m.belongsTo(Robot, { as: 'robotB', foreignKey: 'robotBId' });
  m.belongsTo(User, { as: 'referee', foreignKey: 'refereeId' });
});

export const CATEGORY_MATCH_MODELS: Record<string, typeof Model> = {
  'RoboFut': RobofutMatch,
  'RoboFut Master': RobofutMatch,
  'Minisumo Autónomo': MinisumoMatch,
  'BioBot': BiobotMatch,
  'Sumo RC': SumoMatch,
  'Laberinto': LaberintoMatch,
  'BattleBots 1lb': BattleBotsMatch,
  'Seguidor de Línea': SeguidorMatch,
  'Batalla de Palitos de Helado': PalitosMatch
};

export const ALL_CATEGORY_MATCH_MODELS = matchModels;
