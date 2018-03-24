import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import WithRender from './About.html?style=./About.css';

import theStore from '@/ui/store';


@WithRender
@Component({
   name: 'about',
})
export default class AboutComponent extends Vue {
   store = theStore;

   get dbVersion() { return theStore.valuesJson; }
}
