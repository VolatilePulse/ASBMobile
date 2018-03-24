import Vue from 'vue';

import testServersData from './ark/servers_test';
import preDefinedServersData from './ark/servers_predef';
import { Server } from './ark/multipliers';


export const preDefinedServers: { [name: string]: Server } = {};
export const testServers: { [name: string]: Server } = {};
export const userServers: { [name: string]: Server } = {};


/**
 * Look up a server by name, preferring user servers over anything else.
 */
export function getServerByName(name: string): Server {
   let server = userServers[name] || preDefinedServers[name] || testServers[name];
   if (!server) {
      server = preDefinedServers['Official Server'];
   }
   return server;
}


/**
 * Copy a server and add it as a user server.
 */
export function copyServer(src: Server): Server {
   const newServer = new Server(src, src.IBM, !!src['singlePlayer'], src.serverName);
   newServer.isTestOnly = false;
   newServer.isPreDefined = false;

   // Give it a new name
   do
      newServer.serverName = 'Copy of ' + newServer.serverName;
   while (newServer.serverName in userServers);

   addUserServer(newServer);

   return newServer;
}

export async function initialise(includeTest: boolean) {
   // Only run once
   if (Object.keys(preDefinedServers).length > 0) return;

   if (includeTest) {
      for (const src of testServersData) {
         const server = new Server(src.multipliers, src.IBM, src.singlePlayer, src.serverName);
         server.isTestOnly = true;
         server.isPreDefined = true;
         testServers[server.serverName] = server;
      }
   }

   for (const src of preDefinedServersData) {
      const server = new Server(src.multipliers, src.IBM, src.singlePlayer, src.serverName);
      server.isTestOnly = false;
      server.isPreDefined = true;
      preDefinedServers[server.serverName] = server;
   }

   // TODO: Load user servers from the DB using await
}

export function addUserServer(server: Server) {
   // TODO: Do this in the DB
   Vue.set(userServers, server.serverName, server);
}

export function deleteUserServer(name: string) {
   // TODO: Do this in the DB
   Vue.delete(userServers, name);
}

export function renameServer(oldName: string, newName: string) {
   // TODO: Do this in the database
   const server = userServers[oldName];
   deleteUserServer(oldName);
   server.serverName = newName;
   addUserServer(server);
}
