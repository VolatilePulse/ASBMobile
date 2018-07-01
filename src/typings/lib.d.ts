// This file is where we declare types for external modules that don't have their own TypeScript type definitions


// Cheap fix: these just resolve as 'any' so they act like untyped Javascript
declare module 'bootstrap-vue';
declare module 'math-float32-nextafter';
declare module 'color-hash';


// Vue shim to support importing components from *.vue
declare module '*.vue' {
   import Vue from 'vue';
   export default Vue;
}
