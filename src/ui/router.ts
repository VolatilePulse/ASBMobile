import theStore, { EVENT_LOADED_AUTH, EVENT_LOADED_FIRESTORE } from '@/ui/store';
import Vue from 'vue';
import Router, { RawLocation, Route } from 'vue-router';
import Creature from './views/creature.vue';
import Creatures from './views/creatures.vue';
import CreatureEdit from './views/creature_edit.vue';
import About from './views/info/about.vue';
import Welcome from './views/info/welcome.vue';
import WhatsNew from './views/info/whatsnew.vue';
import Libraries from './views/libraries.vue';
import Library from './views/library.vue';
import NotFound from './views/not_found.vue';
import Server from './views/server.vue';
import Servers from './views/servers.vue';
import Settings from './views/settings.vue';


// These pages are lazily loaded and not included in the main app bundle
const DevTester = () => import(/* webpackChunkName: "dev-pages" */ './views/dev/tester.vue');
const DevTest = () => import(/* webpackChunkName: "dev-pages" */ './views/dev/test.vue');
const DevErrors = () => import(/* webpackChunkName: "dev-pages" */ './views/dev/errors.vue');
const DevChanges = () => import(/* webpackChunkName: "dev-pages" */ './views/dev/changes.vue');
const DevConsole = () => import(/* webpackChunkName: "dev-pages" */ './views/dev/console.vue');
const DevFirestore = () => import(/* webpackChunkName: "dev-pages" */ './views/dev/firestore.vue');
const DevLayoutTest = () => import(/* webpackChunkName: "dev-pages" */ './views/dev/layout_test.vue');
const DevBulk = () => import(/* webpackChunkName: "dev-pages" */ './views/dev/bulk.vue');

const User = () => import(/* webpackChunkName: "auth-pages" */ './views/user.vue');


// Annoying that vue-router doesn't provide this type
export type IRouterNext = (to?: RawLocation | false | ((vm: Vue) => any) | void) => void;

// TODO: Implement a general way to say what a page requires, from:
//  * An authenticated user
//  * Subsystem ready: Authentication
//  * Subsystem ready: Firestore
//  * Ark Data is loaded
//  * Online connection


/** Called before navigating to a page that requires authentication */
function requireAuth(to: Route, from: Route, next: IRouterNext) {
   // If the system isn't fully loaded yet, call us back when we are...
   if (!theStore.loaded.auth) {
      theStore.routerAwaitingLoad = true;
      console.log('Router: Deferring navigation until auth loaded');
      theStore.events.once(EVENT_LOADED_AUTH, () => requireAuth(to, from, next));
      return;
   }
   if (!theStore.loaded.firestore) {
      theStore.routerAwaitingLoad = true;
      console.log('Router: Deferring navigation until firestore loaded');
      theStore.events.once(EVENT_LOADED_FIRESTORE, () => requireAuth(to, from, next));
      return;
   }

   theStore.routerAwaitingLoad = false;
   if (!theStore.authUser) {
      // Go to login screen, remembering where to go back to
      console.log('Router: requireAuth failed to find user');
      next({
         path: '/login',
         query: { redirect: to.fullPath },
      });
   }
   else {
      next();
   }
}

/** Called before navigating to a page that requires Firestore, but not authentication */
function requireFirestore(to: Route, from: Route, next: IRouterNext) {
   // If the system isn't fully loaded yet, call us back when we are...
   if (!theStore.loaded.firestore) {
      theStore.routerAwaitingLoad = true;
      console.log('Router: Deferring navigation until firestore loaded');
      theStore.events.once(EVENT_LOADED_FIRESTORE, () => requireFirestore(to, from, next));
      return;
   }

   theStore.routerAwaitingLoad = false;
   next();
}

const router = new Router({
   mode: 'history',
   routes: [
      { path: '/info/about', component: About },
      { path: '/info/welcome', component: Welcome, alias: '/' },
      { path: '/info/whatsnew', component: WhatsNew },

      { path: '/login', component: User },
      { path: '/user', component: User, beforeEnter: requireAuth },
      { path: '/settings', component: Settings },
      // { path: '/extractor', component: Extractor, beforeEnter: requireAuth },
      { path: '/invite', component: Vue, beforeEnter: requireAuth },

      { path: '/libraries', name: 'libraries', component: Libraries, beforeEnter: requireAuth },
      { path: '/library/:library_id', name: 'library', component: Library, beforeEnter: requireAuth },
      { path: '/library/:library_id/servers', name: 'servers', component: Servers, beforeEnter: requireAuth },
      { path: '/library/:library_id/server/:server_id', name: 'server', component: Server, beforeEnter: requireAuth },
      { path: '/library/:library_id/creatures', name: 'creatures', component: Creatures, beforeEnter: requireAuth },
      { path: '/library/:library_id/creature/:creature_id', name: 'creature', component: Creature, beforeEnter: requireAuth },
      { path: '/library/:library_id/creature/:creature_id/edit', component: CreatureEdit, beforeEnter: requireAuth },

      { path: '/dev/tester', component: DevTester, alias: '/dev/testing', beforeEnter: requireFirestore },
      { path: '/dev/test/:test_id', component: DevTest, beforeEnter: requireFirestore },
      { path: '/dev/firestore', component: DevFirestore, beforeEnter: requireFirestore },
      { path: '/dev/layout', component: DevLayoutTest },
      { path: '/dev/changes', component: DevChanges },
      { path: '/dev/errors', component: DevErrors },
      { path: '/dev/console', component: DevConsole },
      { path: '/dev/bulk', component: DevBulk, beforeEnter: requireFirestore },

      { path: '*', component: NotFound },
   ],
});

router.beforeEach((to, from, next) => {
   console.log(`Routing: from:${from.fullPath} to:${to.fullPath}`);
   next();
});

export default router;
