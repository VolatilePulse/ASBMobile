import { Server } from '@/data/objects';


export const SERVER_PREFIX_PREDEF = 'predef:';
export const ID_OFFICIAL_SERVER = SERVER_PREFIX_PREDEF + 'Official Server';
export const ID_OFFICIAL_SERVER_SP = SERVER_PREFIX_PREDEF + 'Official Single Player';


// Servers in this group must have IDs prefixed with 'predef:' and must never change.
// Entries should never be deleted. We can add a 'hidden' mechanism if servers need to retire.
const servers: Server[] = [
   {
      _id: ID_OFFICIAL_SERVER,
      name: 'Official Server',
      IBM: 1,
      singlePlayer: false,
      multipliers: [],
   },
   {
      _id: ID_OFFICIAL_SERVER_SP,
      name: 'Official Single Player',
      IBM: 1,
      singlePlayer: true,
      multipliers: [],
   },
];

export default servers;
