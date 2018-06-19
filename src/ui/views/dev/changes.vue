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
                     <b-form-input type="text" v-net-data:str></b-form-input>
                  </b-form-group>
               </b-form-row>
               <b-form-row>
                  <b-form-group label="Number:">
                     <b-form-input type="number" v-net-data:num></b-form-input>
                  </b-form-group>
               </b-form-row>
               <b-form-row class="right justify-content-right">
                  <b-button @click="sendToNetwork()" :disabled="cache.hasConflicts" title="Simulate saving user data">&larr;</b-button>
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
.inspect {
   background-color: $gray-900;
   border-radius: 1rem;
   display: block;
   padding: 0.7rem;
   min-height: 2.5rem;
}

input.net-data {
   transition: background-color 0.5s, border-color 0.5s;
   background-color: antiquewhite;
}

input.net-data:disabled {
   background-color: rgb(157, 148, 136);
}

input.net-data.changed {
   background-color: rgb(157, 216, 157);
   border-color: rgb(63, 230, 77);
}

input.net-data.conflict {
   border-color: red;
   background-color: rgb(235, 65, 52);
   color: var(--light);
}
</style>


<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
import { ChangeHandler } from '@/data/firestore/change';
import { cloneDeep } from 'lodash';
import { findDiff, applyDiff } from '@/data/firestore/diff';

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
      this.cache.acceptNewData(this.network);
      this.calcUserDiff();
   }

   sendToNetwork() {
      this.network = cloneDeep(this.cache.user);
      this.receiveFromNetwork();
   }

   calcUserDiff() {
      const changes = findDiff(this.cache.network, this.cache.user);
      this.userDiff = applyDiff({}, changes, '<deleted>');
   }

   @Watch('cache.user', { deep: true })
   userChanged() { this.calcUserDiff(); }

   @Watch('cache.network', { deep: true })
   networkChanged() { this.calcUserDiff(); }
}
</script>
