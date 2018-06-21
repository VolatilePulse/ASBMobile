import theStore, { EVENT_LOADED_AUTH, EVENT_LOADED_FIRESTORE } from '@/ui/store';
import Vue from 'vue';
import Router, { RawLocation, Route } from 'vue-router';
import Creature from './views/creature.vue';
import Creatures from './views/creatures.vue';
import CreatureEdit from './views/creature_edit.vue';
import ChangesTest from './views/dev/changes.vue';
import Console from './views/dev/console.vue';
import Firestore from './views/dev/firestore.vue';
import LayoutTest from './views/dev/layout_test.vue';
// import Tester from './views/dev/tester.vue';
import About from './views/info/about.vue';
import Welcome from './views/info/welcome.vue';
import WhatsNew from './views/info/whatsnew.vue';
import Libraries from './views/libraries.vue';
import Library from './views/library.vue';
import NotFound from './views/not_found.vue';
import Server from './views/server.vue';
import Servers from './views/servers.vue';
import User from './views/user.vue';


export type IRouterNext = (to?: RawLocation | false | ((vm: Vue) => any) | void) => void;

// TODO: Implement a general way to say what a page requires, from:
//  * An authenticated user
//  * Subsystem ready: Authentication
//  * Subsystem ready: Firestore
//  * Ark Data is loaded
//  * Online connection


// FIXME: We have a loop here now...

/** Called before navigating to a page that requires authentication */
function requireAuth(to: Route, from: Route, next: IRouterNext) {
   // If the system isn't fully loaded yet, call us back when we are...
   if (!theStore.loaded.auth) {
      theStore.routerAwaitingLoad = true;
      console.log('Router: Deferring requireAuth until auth loaded');
      theStore.events.once(EVENT_LOADED_AUTH, () => requireAuth(to, from, next));
      return;
   }
   if (!theStore.loaded.firestore) {
      theStore.routerAwaitingLoad = true;
      console.log('Router: Deferring requireAuth until firestore loaded');
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

const router = new Router({
   mode: 'history',
   routes: [
      { path: '/info/about', component: About },
      { path: '/info/welcome', component: Welcome, alias: '/' },
      { path: '/info/whatsnew', component: WhatsNew },

      { path: '/login', component: User },
      { path: '/user', component: User, beforeEnter: requireAuth },
      // { path: '/settings', component: Settings, beforeEnter: requireAuth },
      // { path: '/extractor', component: Extractor, beforeEnter: requireAuth },
      { path: '/invite', component: Vue, beforeEnter: requireAuth },

      { path: '/libraries', name: 'libraries', component: Libraries, beforeEnter: requireAuth },
      { path: '/library/:library_id', name: 'library', component: Library, beforeEnter: requireAuth },
      { path: '/library/:library_id/servers', name: 'servers', component: Servers, beforeEnter: requireAuth },
      { path: '/library/:library_id/server/:server_id', name: 'server', component: Server, beforeEnter: requireAuth },
      { path: '/library/:library_id/creatures', name: 'creatures', component: Creatures, beforeEnter: requireAuth },
      { path: '/library/:library_id/creature/:creature_id', name: 'creature', component: Creature, beforeEnter: requireAuth },
      { path: '/library/:library_id/creature/:creature_id/edit', component: CreatureEdit, beforeEnter: requireAuth },

      // { path: '/dev/tester', component: Tester },
      { path: '/dev/firestore', component: Firestore },
      { path: '/dev/layout', component: LayoutTest },
      { path: '/dev/changes', component: ChangesTest },
      { path: '/dev/console', component: Console },

      { path: '*', component: NotFound },
   ],
});

router.beforeEach((to, from, next) => {
   console.log(`Routing: from:${from.fullPath} to:${to.fullPath}`);
   next();
});

export default router;
