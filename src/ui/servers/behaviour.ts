import { Server } from '../../ark/multipliers';  // eslint-disable-line no-unused-vars

/**
 * @fileOverview Holds behaviour code for the UI Servers tab.
 */

export const NEW_SERVER_ID = "___NEW___SERVER___";

/**
 * @param {number} s
 * @param {number} p
 * @param {string} v
 * @param {Server} server
 */
export function setMult(s, p, v, server) {
   let num = v ? parseFloat(v) : undefined;
   if (num <= 0) num = undefined;
   server[s][p] = num;
}

export function onServerChange(newName, ui) {
   if (newName == NEW_SERVER_ID) {
      ui.setServerByName("Official Server");
      ui.copyServer();
   }
   else {
      ui.setServerByName(newName);
   }
}
