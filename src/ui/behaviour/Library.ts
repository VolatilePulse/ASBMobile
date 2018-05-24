import { Stat } from '@/ark/types';
import Common from '@/ui/behaviour/Common';
import theStore from '@/ui/store';
import { FilledArray } from '@/utils';
import { Component } from 'vue-property-decorator';

/** @fileOverview Tab containing the UI for the creature library */


@Component
export default class LibraryTab extends Common {
   stats: Stat[] = FilledArray(8, () => new Stat());
   entries = theStore.creaturesCache.content;
   fields = [
      { key: 'species', label: 'Species' },
      { key: 'name', label: 'Name' },
      { key: 'tribe', label: 'Tribe' },
      { key: 'stats', label: 'Stats' },
   ];
}
