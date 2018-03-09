
/** @typedef {{serverName:string,multipliers:number[][],IBM:number,singlePlayer:boolean}} ServerDef */


/** @type {ServerDef[]} */
let servers = [
   {
      serverName: "Official Server",
      IBM: 1,
      singlePlayer: false,
      multipliers: [],
   },
   {
      serverName: "Official Single Player",
      IBM: 1,
      singlePlayer: true,
      multipliers: [],
   },
];

export default servers;
