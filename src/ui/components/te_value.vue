<template>
   <div class="m-0 p-0">
      <div class="m-0 p-0" v-if="valid" v-b-tooltip.html.hover.focus="tip">{{avg | display(PRE_TE, 1)}}%</div>
      <div class="m-0 p-0" v-else>{{placeholder}}</div>
      <!-- <b-tooltip target="te">{{lo | pct}}% &le; TE &le; {{hi | pct}}%</b-tooltip> -->
   </div>
</template>


<script lang="ts">
import { Component } from 'vue-property-decorator';
import Common from '@/ui/common';
import { intervalAverage } from '@/number_utils';
import { formatDisplayValue } from '@/ark';
import { PRE_TE } from '@/consts';

@Component({
   props: {
      value: { required: false }, // interval or number
      placeholder: { type: String, required: false, default: '-' },
   },
})
export default class TEValue extends Common {
   value: Interval;

   valid = false;
   interval = false;
   lo: number = null;
   hi: number = null;
   avg: number = null;

   PRE_TE = PRE_TE;

   created() {
      if (!(this.value == null)) {
         this.valid = true;

         if (typeof this.value === 'number') {
            this.avg = this.value;
         }
         else if (typeof this.value === 'object') {
            this.interval = true;
            this.lo = this.value.lo;
            this.hi = this.value.hi;
            this.avg = intervalAverage(this.value);
         }
      }
   }

   get tip() {
      return `${formatDisplayValue(this.lo, PRE_TE, 4)}% &le; TE &le; ${formatDisplayValue(this.hi, PRE_TE, 4)}%`;
   }
}
</script>
