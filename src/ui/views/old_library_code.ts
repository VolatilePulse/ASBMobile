import { Stat } from '@/ark/types';
import Common from '@/ui/common';
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
      { key: 'level', label: 'Lvl', class: 'text-center' },
      { key: 'stat0', label: 'HP', class: 'stat' },
      { key: 'stat1', label: 'ST', class: 'stat' },
      { key: 'stat2', label: 'OX', class: 'stat' },
      { key: 'stat3', label: 'FD', class: 'stat' },
      { key: 'stat4', label: 'WE', class: 'stat' },
      { key: 'stat5', label: 'DM', class: 'stat' },
      { key: 'stat6', label: 'SP', class: 'stat' },
   ];
}
