// import theStore from '@/ui/store';
// import { DeepCopy } from '@/utils';
// import cuid from 'cuid';
// import preDefinedServersData, { SERVER_PREFIX_PREDEF } from './ark/servers_predef';
// import testServersData, { SERVER_PREFIX_TEST } from './ark/servers_test';
// import { Server } from './data/firestore/objects';

/** @fileOverview Server management and manipulation. Does not include persisting to the database. */


// export const preDefinedServers: Server[] = [];
// export const testServers: Server[] = [];

// /** Generate a new unique ID for a Server */
// function generateServerId() {
//    // Adds game name, for future expansion
//    return 'ark:' + cuid();
// }

// /** Check if a server is editable or readonly from its ID */
// export function isServerEditable(server: Server): boolean {
//    if (!server._id) return false;
//    if (server._id.startsWith(SERVER_PREFIX_PREDEF)) return false;
//    if (server._id.startsWith(SERVER_PREFIX_TEST)) return false;
//    return true;
// }

// /**
//  * Look up a server by ID, prioritising pre-defined servers, then user servers, then test servers.
//  */
// export function getServerById(id: string): Server {
//    const stores: Server[][] = [];

//    stores.push(preDefinedServers);
//    if (LibraryManager.current) stores.push(LibraryManager.current.getUserServersCache().content);
//    if (theStore.devMode) stores.push(testServers);

//    for (const store of stores) {
//       const found = store.find(v => v._id === id);
//       if (found) return found;
//    }

//    return undefined;
// }

// /**
//  * Copy a server and add it as a user server.
//  */
// export async function copyServer(src: Server): Promise<Server> {
//    const newServer = DeepCopy(src);
//    newServer._id = generateServerId();
//    newServer._rev = undefined;

//    // Give it a new name, checking for uniqueness
//    do
//       newServer.name = 'Copy of ' + newServer.name;
//    while (LibraryManager.current.getUserServersCache().content.find(server => server.name === newServer.name));

//    await LibraryManager.current.saveServer(newServer);

//    return newServer;
// }

// export async function initialise() {
//    // Only run once
//    if (Object.keys(preDefinedServers).length > 0) return;

//    for (const src of testServersData) {
//       // Set test server IDs from their name
//       const server = src as Server;
//       server._id = 'test:' + src.name;
//       if (testServers.find(s => s._id === server._id)) console.error(`Duplicate test server name "${src.name}`);
//       testServers.push(server);
//    }

//    for (const src of preDefinedServersData) {
//       preDefinedServers.push(src);
//    }
// }
