import Vue from 'vue';

import * as app from '../../app';
//import { DeepCopy } from '../../utils';
import { Server } from '../../ark/multipliers';


export function copyServer() {
   this.isEditable = true;
   let newServer = new Server(this.server, this.server.IBM, !!this.server['singlePlayer']);
   newServer.serverName = this.server.serverName;
   newServer.testOnly = false;
   newServer.isPreDefined = false;
   do
      newServer.serverName = "Copy of " + newServer.serverName;
   while (newServer.serverName in this.userServers);

   this.server = newServer;
   this.name = newServer.name;

   // TODO: The DB system should do this bit
   Vue.set(this.userServers, newServer.serverName, newServer);
}

export function deleteServer(name) {
   // TODO: The DB system should do this bit
   delete this.userServers[name];
}

export function setServerByName(name) {
   console.log("setServerByName(" + JSON.stringify(arguments) + ")");
   app.data.currentServerName = name;
   this.server = this.userServers[name] || app.data.preDefinedServers[name];
   if (!this.server) {
      app.data.currentServerName = "Official Server";
      this.server = app.data.preDefinedServers[name];
   }
}

export function onServerChange(newName) {
   if (newName == this.newServerId) {
      this.setServerByName("Official Server");
      this.copyServer();
   }
   else {
      this.setServerByName(newName);
   }
}
