import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import WithRender from './Welcome.html?style=./Welcome.css';

import theStore from '@/ui/store';


@WithRender
@Component({
   name: 'welcome',
})
export default class WelcomeComponent extends Vue {
   store = theStore;

   get dbVersion() { return theStore.valuesJson; }
}
