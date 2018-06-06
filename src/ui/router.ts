import theStore from '@/ui/store';
import Vue from 'vue';
import Router, { RawLocation, Route } from 'vue-router';
import Firestore from './views/dev/firestore.vue';
import Tester from './views/dev/tester.vue';
import Extractor from './views/extractor.vue';
import About from './views/info/about.vue';
import Welcome from './views/info/welcome.vue';
import WhatsNew from './views/info/whatsnew.vue';
import Libraries from './views/libraries.vue';
import NotFound from './views/not_found.vue';
import Settings from './views/settings.vue';
import User from './views/user.vue';


export type IRouterNext = (to?: RawLocation | false | ((vm: Vue) => any) | void) => void;

function requireAuth(to: Route, _from: Route, next: IRouterNext) {
   // FIXME: Add handling for when store.loaded.auth is not yet set
   if (!theStore.user) {
      // Go to login screen, remembering where to go back to
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
      { path: '/settings', component: Settings, beforeEnter: requireAuth },
      { path: '/extractor', component: Extractor, beforeEnter: requireAuth },
      { path: '/invite', component: Vue, beforeEnter: requireAuth },

      { path: '/libraries', name: 'libraries', component: Libraries, beforeEnter: requireAuth },
      { path: '/library/:library_id', name: 'library', component: Vue, beforeEnter: requireAuth },
      { path: '/library/:library_id/servers', name: 'servers', component: Vue, beforeEnter: requireAuth },
      { path: '/library/:library_id/server/:server_id', name: 'server', component: Vue, beforeEnter: requireAuth },
      { path: '/library/:library_id/creatures', name: 'creatures', component: Vue, beforeEnter: requireAuth },
      { path: '/library/:library_id/creature/:creature_id', name: 'creature', component: Vue, beforeEnter: requireAuth },

      { path: '/dev/tester', component: Tester },
      { path: '/dev/firestore', component: Firestore },

      { path: '*', component: NotFound },
   ],
});

router.beforeEach((to, from, next) => {
   console.log(`Routing: from:${from.fullPath} to:${to.fullPath}`);
   next();
});

export default router;
