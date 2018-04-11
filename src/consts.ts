export const HEALTH = 0, STAMINA = 1, OXYGEN = 2, FOOD = 3, WEIGHT = 4, DAMAGE = 5, SPEED = 6, TORPOR = 7;
export const PRE_TE = -1, PRE_IB = -2;

export const EPSILON = 1E-10;

export const STAT_EPSILON = [
   0.05,
   0.05,
   0.05,
   0.05,
   0.05,
   0.0005,
   0.0005,
   0.05,
];

export const STAT_B = 0, STAT_IW = 1, STAT_ID = 2, STAT_TA = 3, STAT_TM = 4;
export const SERVER_TAM = 0, SERVER_TMM = 1, SERVER_IDM = 2, SERVER_IWM = 3;

export const DB_VER_M = 1, DB_VER_L = 1;

export const NUM_STATS = 8;

export const statNames = [
   'Health',
   'Stamina',
   'Oxygen',
   'Food',
   'Weight',
   'Melee',
   'Speed',
   'Torpor',
];


export const SAVE_TIMEOUT = 1000;
export const SAVE_MAX_TIMEOUT = 10_000;
