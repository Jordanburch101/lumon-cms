import * as migration_20260317_040204 from './20260317_040204';

export const migrations = [
  {
    up: migration_20260317_040204.up,
    down: migration_20260317_040204.down,
    name: '20260317_040204'
  },
];
