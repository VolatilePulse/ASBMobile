export const SERVER_PREFIX_TEST = 'test:';

/** @fileOverview Servers that are only referenced by tests */

// TODO: Move this data out of the app and only load it along with the tests in dev mode.


/** A Server, but without an ID (as these are auto-generated) */
interface ServerDef {
   name: string;
   IBM: number;
   singlePlayer: boolean;
   multipliers: Array<Array<number | null | undefined>>;
}

// Servers in this group automatically have their IDs set (to 'test:<name>')
const servers: ServerDef[] = [
   {
      name: 'kohonac HP.IDM: 2.0',
      IBM: 1,
      singlePlayer: true,
      multipliers: [[, , 2]],
   },
   {
      name: 'eldoco87',
      IBM: 1,
      singlePlayer: false,
      multipliers: [[], [], [], [], [], [], [2]],
   },
   {
      name: '[BLPP] Jane',
      IBM: 1,
      singlePlayer: false,
      multipliers: [],
   },
   {
      name: 'Zerkxy Gremory',
      IBM: 1,
      singlePlayer: false,
      multipliers: [],
   },
   {
      name: 'Coldino SP',
      IBM: 1,
      singlePlayer: true,
      multipliers: [[], [2, , 2], [], [], [10, , 10], [0.2, , 0.22], [3, , 3]],
   },
   {
      name: 'Tp',
      IBM: 1,
      singlePlayer: false,
      multipliers: [[0.5, 0.5, 0.5, 1.3], [2.5, 2.5, 0.5], [1.3, 1.3], [1.3, 1.3, 1.3], [6, 6, 6, 6], [0.5, 0.4, 0.4], [1.6, 1.6, 1.6, 1.3], [1.3, 1.3, 1.3]],
   },
   {
      name: 'ARK PVE Community Server (test)',
      IBM: 1,
      singlePlayer: false,
      multipliers: [[], [], [], [], [, , 3, 1.5]],
   },
   {
      name: 'ARK PVE Community Server',
      IBM: 1,
      singlePlayer: false,
      multipliers: [[], [], [], [], [, , 1.5, 3], [], [2]],
   },
   {
      name: 'Dusty.P',
      IBM: 1,
      singlePlayer: false,
      multipliers: [[], [], [], [], [, , 2], [], [, , 1.2]],
   },
   {
      name: 'enohka',
      IBM: 1,
      singlePlayer: false,
      multipliers: [],
   },
   {
      name: 'DelilahEve',
      IBM: 1,
      singlePlayer: false,
      multipliers: [],
   },
   {
      name: 'VestedWind',
      IBM: 3,
      singlePlayer: false,
      multipliers: [[], [, , 2], [], [], [, , 150], [, , 2], [, , 4]],
   },
];

export default servers;
