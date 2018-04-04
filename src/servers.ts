import Vue from 'vue';
import PouchDB from 'pouchdb-core';

import testServersData from './ark/servers_test';
import preDefinedServersData from './ark/servers_predef';
import { Server } from './ark/multipliers';
import { LibraryManager } from '@/data';
import { TableMonitor } from '@/data/table';
import { Delay } from '@/utils';


export const preDefinedServers: { [name: string]: Server } = {};
export const testServers: { [name: string]: Server } = {};
export const userServers: { [name: string]: Server } = {};

export let lifeFinder: TableMonitor<Server>;

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
export async function copyServer(src: Server): Promise<Server> {
   const newServer = new Server(src, src.IBM, !!src['singlePlayer'], src.serverName);
   newServer.isTestOnly = false;
   newServer.isPreDefined = false;

   // Give it a new name
   do
      newServer.serverName = 'Copy of ' + newServer.serverName;
   while (newServer.serverName in userServers);

   await addUserServer(newServer);

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

   try {
      lifeFinder = new TableMonitor<Server>('servers');
      await lifeFinder.initialise();

      console.log(lifeFinder.name);

      var db = new PouchDB<Server>('servers');

      await Delay(10);

      await db.post(preDefinedServers['Official Server']);
      await waitForChange(); console.log(lifeFinder.cache.content.map(o => o._id).join(', '));
      await db.post(preDefinedServers['Official Single Player']);
      await waitForChange(); console.log(lifeFinder.cache.content.map(o => o._id).join(', '));
   } catch (ex) {
      console.error(ex);
   }
}

var timerId = 1;

async function waitForChange() {
   var current = lifeFinder.cache.content.length;
   console.time('timer ' + timerId);
   do
      await Delay(10);
   while (lifeFinder.cache.content.length == current);
   console.timeEnd('timer ' + timerId++);
}

export async function addUserServer(server: Server) {
   Vue.set(userServers, server.serverName, server);
   LibraryManager.current.addServer(server);
}

export async function deleteUserServer(name: string) {
   const server = userServers[name];
   if (!server) throw Error(`Unable to find server '${name}' to delete`);
   Vue.delete(userServers, name);
   LibraryManager.current.deleteServer(server);
}

export async function renameServer(oldName: string, newName: string) {
   let server = userServers[oldName];
   if (!server) throw Error(`Unable to find server '${oldName}' to rename`);
   server.serverName = newName;
   Vue.delete(userServers, oldName);
   Vue.set(userServers, server.serverName, server);
   LibraryManager.current.saveServer(server);
}
