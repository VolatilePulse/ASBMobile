<template>
   <b-container fluid>
      <section class="my-3">
         <div>Application version: {{store.applicationVersion || 'n/a'}}</div>
         <div>Database version: {{store.dataLoaded ? store.valuesVersion : "n/a"}}</div>
      </section>
      <section>
         <div>ASBMobile is possible with help from:</div>
         <div class="madewith d-flex flex-wrap justify-content-center align-items-stretch">
            <div>
               <b-img :src="require('@/assets/github.svg')" v-b-tooltip title="GitHub"></b-img>
            </div>
            <div>
               <b-img :src="require('@/assets/vue.svg')" v-b-tooltip title="Vue"></b-img>
            </div>
            <div>
               <b-img :src="require('@/assets/pouchdb.svg')" v-b-tooltip title="PouchDB"></b-img>
            </div>
            <div>
               <b-img :src="require('@/assets/bootstrap.svg')" v-b-tooltip title="Bootstrap 4"></b-img>
            </div>
            <div>
               <b-img :src="require('@/assets/typescript.svg')" v-b-tooltip title="TypeScript"></b-img>
            </div>
            <div>
               <b-img :src="require('@/assets/webpack.svg')" v-b-tooltip title="Webpack"></b-img>
            </div>
            <div>
               <b-img :src="require('@/assets/lodash.svg')" v-b-tooltip title="Lodash"></b-img>
            </div>
         </div>
         <div>
            And...
            <ul>
               <li>vue-cli v3</li>
               <li>Bootstrap-vue</li>
               <li>Pouch-vue</li>
               <li>Icons from
                  <a href="https://fontawesome.com/license">FontAwesome</a> and
                  <a href="https://material.io/icons/">Material.io</a>.
               </li>
               <li>Optimised using
                  <a href="https://jakearchibald.github.io/svgomg/">SVGOMG</a>.
               </li>
            </ul>
         </div>
      </section>
   </b-container>
</template>


<style scoped>
.madewith {
  text-align: center;
  font-size: 80%;
}

.madewith > div {
  margin: 0.5em;
}

.madewith img {
  min-width: 48px;
  max-width: 96px;
  height: 40px;
  object-fit: contain;
}
</style>


<script lang="ts">
import { Component } from 'vue-property-decorator';
import Behaviour from '../behaviour/Common';
@Component({ name: 'About' })
export default class extends Behaviour { }
</script>
