import { Vue, Component } from 'vue-property-decorator';

import theStore from '@/ui/store';
import { Range, FormatNumber } from '@/utils';
import { statNames, NUM_STATS } from '@/consts';


@Component
export default class extends Vue {
   statIndices = Range(NUM_STATS);
   statNames = statNames;

   store = theStore;


   formatFloat(n: number) { return FormatNumber(n, 2); }
   formatRound(n: number) { return FormatNumber(n, 0); }

   range(n: number): number[] {
      return Range(n)
   }
}
