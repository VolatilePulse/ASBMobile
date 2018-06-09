<template>
   <b-container fluid>
      <h2>Creature</h2>
      <b-alert v-if="cache && cache.error" variant="danger">{{cache.error}}</b-alert>
      <b-btn :to="$route.path+'/edit'" variant="link">edit</b-btn>
      <!--
         Offer different colored cards based on creature "mode"
         <b-card v-if="cache && cache.data" v-bind:bg-variant="cache.data.isTamed ? 'success' : cache.data.isBred ? 'info ' : 'default '">
      -->
      <b-card v-if="cache && cache.data">
         <h1>
            <!-- Display Gender Symbol -->
            <p v-if="cache.data.isFemale">&#9792;</p>
            <p v-else>&#9794;</p>

            <!-- If no creature name, display the species only -->
            <!--
               Display Species BP Path on hover
               {{cache.data.speciesBP}}
            -->
            <p v-if="cache.data.name">{{cache.data.name}} ({{cache.data.speciesName}})</p>
            <p v-else>{{cache.data.speciesName}}</p>
         </h1>
         <h3>LEVEL:
            <p v-if="cache.data.level">{{cache.data.level}}</p>
            <p v-else>{{calculatedLevel()}}</p>
         </h3>
         <h4>
            <p v-if="cache.data.owner && cache.data.owner !== cache.data.tribe">{{cache.data.tribe}} - </p>
            <p v-if="cache.data.tribe">{{cache.data.tribe}}</p>
         </h4>
         <!-- {{cache.data.colors}} -->
         <wheel :size=200 :colors=cache.data.colors></wheel>
         <div v-if="cache.data.isTamed">Tamed @ {{cache.data.WL}} w/ {{displayPercent(cache.data.TE)}} Taming Effectiveness</div>
         <div v-else-if="cache.data.isBred">Bred @ {{cache.data.levelsWild[TORPOR] + 1}} w/ {{displayPercent(cache.data.IB)}} Imprinting</div>

         <!--
            Display Stat Values and Breeding Values
            {{cache.data.breedingValues}}
         -->
         <b-row v-for="i in range(8)" :key=i>
            <div>
               <b-img :src="store.statImages[i]" fluid-grow class="align-items-center" style="max-height:28px;min-height:22px"></b-img>
            </div>

            <div>
               {{cache.data.statValues}} = ({{cache.data.levelsWild[i]}} + {{cache.data.levelsDom[i]}})
            </div>
         </b-row>

         <br />
         <div>{{cache.data.inputSource}}</div>
         <div>{{cache.data.originServer}}</div>
         <div>{{cache.data.currentServer}}</div>

         <div>{{cache.data.mutations}}</div>
         <div>{{cache.data.mutationsMaternal}}</div>
         <div>{{cache.data.mutationsPaternal}}</div>
         <div>{{cache.data.mother}}</div>
         <div>{{cache.data.father}}</div>

         <div>{{cache.data.status}}</div>
         <div>{{cache.data.tags}}</div>
      </b-card>
   </b-container>
</template>

<style lang="scss" scoped>
</style>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import Common from '../common';
import { LiveDocument, CreateLiveDocument } from '@/data/firestore/live';
import { Creature } from '@/data/firestore/objects';
import Wheel from '@/ui/components/wheel.vue';
import { TORPOR } from '@/consts';

@Component({ name: 'Creature', components: { wheel: Wheel } })
export default class extends Common {
   cache: LiveDocument<Creature> = null;
   colors: number[] = [];
   content: string = '';

   async mounted() {
      this.cache = CreateLiveDocument<Creature>(`/library/${this.$route.params.library_id}/creature/${this.$route.params.creature_id}`);
   }

   beforeDestroy() {
      this.cache.close();
   }
   displayPercent(num: number) {
      return (num * 100).toFixed(2) + '%';
   }
   calculatedLevel() {
      // All creatures start at level 1
      let sum = 1 + this.cache.data.levelsWild[TORPOR];

      for (const value of this.cache.data.levelsDom)
         sum += value;

      return sum;
   }
}
</script>
