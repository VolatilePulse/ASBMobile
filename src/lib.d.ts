// This file is where we declare types for external modules that don't have their own TypeScript type definitions


// Cheap fix: these just resolve as 'any' so they act like untyped Javascript
declare module 'bootstrap-vue';
declare module 'pouch-vue';
declare module 'pouchdb-live-find';
declare module 'interval-arithmetic';
declare module 'interval-arithmetic-eval';
