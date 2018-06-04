import theStore from '@/ui/store';
import Vue from 'vue';
import Router, { RawLocation, Route } from 'vue-router';
import About from './views/About.vue';
import Fireauth from './views/Fireauth.vue';
import Firestore from './views/Firestore.vue';
import NotFound from './views/NotFound.vue';
import Settings from './views/Settings.vue';
import Tester from './views/Tester.vue';
import Welcome from './views/Welcome.vue';
import whatsnew from './views/about/whatsnew.vue';


export type IRouterNext = (to?: RawLocation | false | ((vm: Vue) => any) | void) => void;

function requireAuth(to: Route, _from: Route, next: IRouterNext) {
   // FIXME: Add handling for when store.loaded.auth is not yet set
   if (!theStore.user) {
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
      { path: '/about', component: About, alias: '/' },
      { path: '/about/welcome', component: Welcome },
      { path: '/about/whatsnew', component: whatsnew },
      { path: '/about/firestore', component: Firestore },

      { path: '/login', component: Fireauth },
      { path: '/user', component: Fireauth, beforeEnter: requireAuth },
      { path: '/settings', component: Settings, beforeEnter: requireAuth },
      { path: '/invite', component: Vue, beforeEnter: requireAuth },

      { path: '/libraries', name: 'libraries', component: Vue, beforeEnter: requireAuth },
      { path: '/library/:library_id', name: 'library', component: Vue, beforeEnter: requireAuth },
      { path: '/library/:library_id/servers', name: 'servers', component: Vue, beforeEnter: requireAuth },
      { path: '/library/:library_id/server/:server_id', name: 'server', component: Vue, beforeEnter: requireAuth },
      { path: '/library/:library_id/creatures', name: 'creatures', component: Vue, beforeEnter: requireAuth },
      { path: '/library/:library_id/creature/:creature_id', name: 'creature', component: Vue, beforeEnter: requireAuth },

      { path: '/tester', component: Tester },

      { path: '*', component: NotFound },
   ],
});

router.beforeEach((to, from, next) => {
   console.log(`Routing: from:${from.fullPath} to:${to.fullPath}`);
   next();
});

export default router;
