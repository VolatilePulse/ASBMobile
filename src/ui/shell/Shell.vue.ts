import '../../assets/scss/app.scss';
import 'bootstrap-vue/dist/bootstrap-vue.min.css';

import Vue from 'vue';
import Component from 'vue-class-component';

import WithRender from './Shell.html?style=./Shell.css';

import About from '@/ui/about/About.vue';
import Welcome from '@/ui/welcome/Welcome.vue';
import Settings from '@/ui/settings/Settings.vue';
import Servers from '@/ui/servers/Servers.vue';
import Extractor from '@/ui/extractor/Extractor.vue';
import Tester from '@/ui/tester/Tester.vue';
import Database from '@/ui/database/Database.vue';

import * as Utils from '@/utils';
import { LoadData } from '@/ark/data';
import theStore from '@/ui/store';


Vue.component('About', About);
Vue.component('Welcome', Welcome);
Vue.component('Settings', Settings);
Vue.component('Servers', Servers);
Vue.component('Extractor', Extractor);
Vue.component('Tester', Tester);
Vue.component('Database', Database);


@WithRender
@Component({
   name: 'shell',
})
export default class ShellComponent extends Vue {
   store = theStore;

   showSidebar = true;
   tab = 'welcome';

   async created() {
      const json = await Utils.AsyncFileRead('static/data.json');
      LoadData(json);
      theStore.dataLoaded = true; // Reveal the main form once loading is complete
   }
}
