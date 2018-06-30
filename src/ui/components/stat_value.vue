<template>
   <div v-if="valid" v-b-tooltip.html.hover.focus="tip" class="m-0 p-0 stat-row">
      <div class="wild">{{wild}}</div>
      <div class="stat-bullet">&bull;</div>
      <div class="dom">{{dom}}</div>
   </div>
   <div class="m-0 p-0" v-else>{{placeholder}}</div>
</template>


<style lang="scss" scoped>
.stat-row {
   margin: 0;
   padding: 0;

   justify-content: center;
   min-width: 5rem;

   div {
      // display: flex;
      margin: 0;
      padding: 0;
      // flex: auto;
   }

   & div:first-child {
      flex: 1 1 1rem;
      text-align: right;
   }
   div.stat-bullet {
      flex: none;
      padding-left: 4px;
      padding-right: 4px;
   }
   & div:last-child {
      flex: 1 1 1rem;
      text-align: left;
   }
}
</style>


<style lang="scss">
.wild {
   color: $statWild;
   font-weight: 600;
}
.dom {
   color: $statDom;
   font-weight: 600;
}
div.stat-bullet {
   display: flex;
   color: $gray-600;
   padding-left: 8px;
   padding-right: 8px;
}
</style>


<script lang="ts">
import { Component } from 'vue-property-decorator';
import Common from '@/ui/common';
import { Stat } from '@/ark/types';

@Component({
   props: {
      stat: { required: false }, // Stat object
      placeholder: { type: String, required: false, default: '-' },
   },
})
export default class StatValue extends Common {
   stat: Stat;

   valid = false;
   wild: number = null;
   dom: number = null;

   created() {
      if (!(this.stat == null)) {
         this.valid = true;

         if (typeof this.stat === 'object') {
            this.wild = this.stat.Lw;
            this.dom = this.stat.Ld;
         }
      }
   }

   get tip() {
      return `<span class="wild">${this.wild}</span> wild levels + <span class="dom">${this.dom}</span> dom levels`;
   }
}
</script>
