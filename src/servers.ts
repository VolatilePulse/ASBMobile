import Vue from "vue";

import testServersData from "./servers_test";
import preDefinedServersData from "./servers_predef";
import { Server } from "./ark/multipliers";


/** @type {{[name:string]:Server}} */
export const preDefinedServers = {};

/** @type {{[name:string]:Server}} */
export const testServers = {};

/** @type {{[name:string]:Server}} */
export const userServers = {};


/**
 * Look up a server by name, preferring user servers over anything else.
 * @param {string} name
 * @returns {Server}
 */
export function getServerByName(name) {
   let server = userServers[name] || preDefinedServers[name] || testServers[name];
   if (!server) {
      server = preDefinedServers["Official Server"];
   }
   return server;
}


/**
 * Copy a server and add it as a user server.
 * @param {Server} src A server definition
 * @returns {Server} The newly created server
 */
export function copyServer(src) {
   let newServer = new Server(src, src.IBM, !!src['singlePlayer'], src.serverName);
   newServer.isTestOnly = false;
   newServer.isPreDefined = false;

   // Give it a new name
   do
      newServer.serverName = "Copy of " + newServer.serverName;
   while (newServer.serverName in userServers);

   addUserServer(newServer);

   return newServer;
}

/**
 * @param {boolean} includeTest
 */
export async function initialise(includeTest) {
   console.log("Loading pre-defined servers...");

   // Only run once
   if (Object.keys(preDefinedServers).length > 0) return;

   if (includeTest) {
      for (let src of testServersData) {
         let server = new Server(src.multipliers, src.IBM, src.singlePlayer, src.serverName);
         server.isTestOnly = true;
         server.isPreDefined = true;
         testServers[server.serverName] = server;
      }
   }

   for (let src of preDefinedServersData) {

      let server = new Server(src.multipliers, src.IBM, src.singlePlayer, src.serverName);
      server.isTestOnly = false;
      server.isPreDefined = true;
      preDefinedServers[server.serverName] = server;
   }

   // TODO: Load user servers from the DB using await
}

/**
 * @param {Server} server
 */
export function addUserServer(server) {
   // TODO: Do this in the DB
   Vue.set(userServers, server.serverName, server);
}

/**
 * @param {string} name
 */
export function deleteUserServer(name) {
   // TODO: Do this in the DB
   Vue.delete(userServers, name);
}

/**
 * @param {string} oldName
 * @param {string} newName
 */
export function renameServer(oldName, newName) {
   // TODO: Do this in the database
   let server = userServers[oldName];
   deleteUserServer(oldName);
   server.serverName = newName;
   addUserServer(server);
}
