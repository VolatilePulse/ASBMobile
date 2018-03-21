import "../../assets/scss/app.scss";
import "bootstrap-vue/dist/bootstrap-vue.min.css";

// @ts-ignore
import withRender from './Shell.html?style=./Shell.css';

import About from "../about/About.vue";
import Welcome from "../welcome/Welcome.vue";
import Settings from "../settings/Settings.vue";
import Servers from "../servers/Servers.vue";
import Extractor from "../extractor/Extractor.vue";
import Tester from "../tester/Tester.vue";
import Database from "../database/Database.vue";

import Vue from "vue";

import * as app from "../../app";
import * as Utils from "../../utils";
import { LoadData } from "../../ark/data";



Vue.component("About", About);
Vue.component("Welcome", Welcome);
Vue.component("Settings", Settings);
Vue.component("Servers", Servers);
Vue.component("Extractor", Extractor);
Vue.component("Tester", Tester);
Vue.component("Database", Database);


export default withRender({
   name: 'Shell',

   props: ['dataLoaded', 'devMode'],

   data: () => ({
      showSidebar: true,
      tab: 'welcome',
   }),

   computed: {
   },

   created: Init,
});


async function Init() {
   let json = await Utils.AsyncFileRead("static/data.json");
   LoadData(json);
   app.data.status.dataLoaded = true; // Reveal the main form once loading is complete
};
