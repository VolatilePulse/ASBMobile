<template>
   <b-container fluid>
      <b-row>
         <b-col sm="6" class="pb-4">
            <b-card>
               <b-form-row>
                  <h4>Network</h4>
               </b-form-row>
               <b-form-row>
                  <b-form-group label="Text:">
                     <b-form-input type="text" v-model="network.str"></b-form-input>
                  </b-form-group>
               </b-form-row>
               <b-form-row>
                  <b-form-group label="Number:">
                     <b-form-input type="number" v-model="network.num"></b-form-input>
                  </b-form-group>
               </b-form-row>
               <b-form-row>
                  <b-button @click="receiveFromNetwork()" class="ml-auto mr-2" title="Simulate network data arriving">&rarr;</b-button>
               </b-form-row>
            </b-card>
         </b-col>
         <b-col sm="6" class="pb-4">
            <b-card>
               <b-form-row>
                  <h4>Local</h4>
               </b-form-row>
               <b-form-row>
                  <b-form-group label="Text">
                     <b-form-input type="text" v-model="cache.user.str"></b-form-input>
                  </b-form-group>
               </b-form-row>
               <b-form-row>
                  <b-form-group label="Number:">
                     <b-form-input type="number" v-model="cache.user.num"></b-form-input>
                  </b-form-group>
               </b-form-row>
               <b-form-row class="right justify-content-right">
                  <b-button @click="sendToNetwork()" title="Simulate saving user data">&larr;</b-button>
               </b-form-row>
            </b-card>
         </b-col>
         <b-col sm="6" class="pb-4">
            <b-card>
               <h4>Conflicts</h4>
               <pre class="inspect">{{cache.conflicts | inspect}}</pre>
            </b-card>
         </b-col>
         <b-col sm="6" class="pb-4">
            <b-card>
               <h4>User changes</h4>
               <pre class="inspect">{{userDiff | inspect}}</pre>
            </b-card>
         </b-col>
      </b-row>
   </b-container>
</template>


<style lang="scss" scoped>
@import '~bootstrap/scss/functions';
@import "../../../assets/scss/asbm-bootstrap.scss";
.inspect {
   background-color: $gray-900;
   border-radius: 1rem;
   display: block;
   padding: 0.7rem;
   min-height: 2.5rem;
}
</style>


<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
import { ChangeHandler } from '@/data/firestore/change';
import { cloneDeep } from 'lodash';
import { findDiff } from '@/data/firestore/diff';

interface TestData {
   str: string;
   num: number;
   obj: { [key: string]: string };
}

@Component({ name: 'ChangeTest' })
export default class extends Vue {
   @Prop() data: any;

   network: TestData = { num: 1, str: 'net', obj: {} };
   userDiff: any = null;

   cache = new ChangeHandler<TestData>();

   receiveFromNetwork() {
      this.cache.acceptNewData(this.network, true);
      this.calcUserDiff();
   }

   sendToNetwork() {
      this.network = cloneDeep(this.cache.user);
      this.cache.conflicts = {};
      this.calcUserDiff();
   }

   calcUserDiff() {
      this.userDiff = findDiff(this.cache.network, this.cache.user);
   }

   @Watch('cache.user', { deep: true })
   userChanged() { this.calcUserDiff(); }

   @Watch('cache.network', { deep: true })
   networkChanged() { this.calcUserDiff(); }
}
</script>
