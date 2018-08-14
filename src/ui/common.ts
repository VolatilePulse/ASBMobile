import { NUM_STATS, statNames } from '@/consts';
import theStore from '@/ui/store';
import { FormatNumber, Range } from '@/utils';
import { Component, Vue } from 'vue-property-decorator';

/** @fileOverview Vue component that all pages inherit from, containing common data and functionality. */


@Component
export default class UICommon extends Vue {
   statIndices = Range(NUM_STATS);
   statNames = statNames;

   store = theStore;


   formatFloat(n: number) { return FormatNumber(n, 2); }
   formatRound(n: number) { return FormatNumber(n, 0); }

   range(n: number): number[] {
      return Range(n);
   }

   goBack() {
      window.history.length > 1 ? this.$router.go(-1) : this.$router.push('/');
   }
}
