import * as migration_20260317_040204 from './20260317_040204';
import * as migration_20260317_222625 from './20260317_222625';

export const migrations = [
  {
    up: migration_20260317_040204.up,
    down: migration_20260317_040204.down,
    name: '20260317_040204',
  },
  {
    up: migration_20260317_222625.up,
    down: migration_20260317_222625.down,
    name: '20260317_222625'
  },
];
