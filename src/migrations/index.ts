import * as migration_20260317_040204 from './20260317_040204';
import * as migration_20260317_222625 from './20260317_222625';
import * as migration_20260318_004457 from './20260318_004457';
import * as migration_20260318_025259 from './20260318_025259';
import * as migration_20260318_035330 from './20260318_035330';
import * as migration_20260318_092231 from './20260318_092231';
import * as migration_20260321_111103 from './20260321_111103';

export const migrations = [
  {
    up: migration_20260317_040204.up,
    down: migration_20260317_040204.down,
    name: '20260317_040204',
  },
  {
    up: migration_20260317_222625.up,
    down: migration_20260317_222625.down,
    name: '20260317_222625',
  },
  {
    up: migration_20260318_004457.up,
    down: migration_20260318_004457.down,
    name: '20260318_004457',
  },
  {
    up: migration_20260318_025259.up,
    down: migration_20260318_025259.down,
    name: '20260318_025259',
  },
  {
    up: migration_20260318_035330.up,
    down: migration_20260318_035330.down,
    name: '20260318_035330',
  },
  {
    up: migration_20260318_092231.up,
    down: migration_20260318_092231.down,
    name: '20260318_092231',
  },
  {
    up: migration_20260321_111103.up,
    down: migration_20260321_111103.down,
    name: '20260321_111103'
  },
];
