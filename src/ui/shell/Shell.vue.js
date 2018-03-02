import 'w3-css/w3.css';
import withRender from './Shell.html?style=./Shell.css';

import Vue from "vue";

import About from "../about/About.vue";
import Servers from "../servers/Servers.vue";
import Extractor from "../extractor/Extractor.vue";
import Tester from "../tester/Tester.vue";

import * as app from "../../app";
import * as Utils from "../../utils";
import * as Data from "../../data";



Vue.component("About", About);
Vue.component("Servers", Servers);
Vue.component("Extractor", Extractor);
Vue.component("Tester", Tester);


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
   let json = await Utils.AsyncFileRead("static/values.json");
   Data.LoadValues(json);
   app.data.status.dataLoaded = true; // Reveal the main form once loading is complete
};
