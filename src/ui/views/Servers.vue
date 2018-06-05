<template>
   <b-container fluid>
      <b-form-group label="Server:" class="col-md-6 m-0 p-0">
         <!-- Copy button -->
         <template slot="description">
            <div v-show="!store.isServerEditable">
               Pre-defined server.
               <b-link variant="link" @click="copyServer">Make a copy</b-link> to modify it.
            </div>
         </template>

         <!-- Servers list dropdown -->
         <b-input-group v-if="store.server">
            <b-form-select :value="store.server._id" @change="onServerChange">
               <template slot="first">
                  <option :value="newServerId">--new server--</option>
               </template>
               <option v-for="server in store.userServersCache.content" :key="server._id" :value="server._id">{{server.name}}</option>

               <optgroup label="Pre-Defined">
                  <option v-for="server in preDefinedServers" :key="server._id" :value="server._id">{{server.name}} </option>
               </optgroup>

               <optgroup v-if="store.devMode" label="Test Servers">
                  <option v-for="server in testServers" :key="server._id" :value="server._id">{{server.name}} </option>
               </optgroup>
            </b-form-select>

            <div class="pl-2"></div>

            <b-button v-if="store.isServerEditable" variant="link" v-b-modal.editNameModal>
               <b-img :src="require('@/assets/edit.svg')"></b-img>
            </b-button>

            <b-button class="pl-2 pr-0" v-if="store.isServerEditable" variant="link" v-b-modal.deleteModal>
               <b-img :src="require('@/assets/delete.svg')"></b-img>
            </b-button>
         </b-input-group>
      </b-form-group>

      <!-- Modal used for editing server name -->
      <b-modal id="editNameModal" ref="editNameModal" title="Edit server name" @ok.prevent="editNameSubmit" centered @shown="editNameShown">
         <b-form @submit.stop.prevent="editNameSubmit">
            <b-form-input id="editNameInput" type="text" v-model.trim="editName" :state="isEditNameValid"></b-form-input>
            <b-form-invalid-feedback>
               Enter a server name
            </b-form-invalid-feedback>
         </b-form>
      </b-modal>

      <!-- Model used to confirm deleting a server -->
      <b-modal id="deleteModal" ref="deleteModal" title="Delete server?" @ok.prevent="deleteServer" centered>
         <p>If you delete this server all creatures on it will also be deleted.</p>
         <p>Are you sure?</p>
      </b-modal>

      <div v-if="store.server">
         <b-form-group label="Options:">
            <b-form-checkbox type="checkbox" v-model="store.server.singlePlayer" :disabled="!store.server || !store.isServerEditable">Single Player</b-form-checkbox>
            <b-form-checkbox type="checkbox" v-model="store.server.classicFlyers" :disabled="true">Classic Flyers</b-form-checkbox>
         </b-form-group>

         <b-form-group label="Multipliers:" class="pt-0">
            <div class="mx-2">
               <b-row>
                  <b-col class="col-1 m-0 p-0"></b-col>
                  <b-col class="text-center py-2" v-b-tooltip title="Tame add">TaM</b-col>
                  <b-col class="text-center py-2" v-b-tooltip title="Tame affinity">TmM</b-col>
                  <b-col class="text-center py-2" v-b-tooltip title="Tame multiplier per level">IdM</b-col>
                  <b-col class="text-center py-2" v-b-tooltip title="Wild multiplier per level">IwM</b-col>
               </b-row>
               <b-row v-for="stat in statIndices" :key="stat">
                  <b-col class="col-1 m-0 p-0 mr-2 align-self-center text-center">
                     <b-img :src="store.statImages[stat]" style="max-width: 2rem;"></b-img>
                  </b-col>
                  <b-col v-for="param in paramIndices" class="px-1" :key="stat+','+param">
                     <b-form-input type="number" class="text-center px-1 mx-0 text-primary" :placeholder="formatMult(stat,param)" @change="setMult(stat,param,$event)" :value="userValue(stat,param)" :disabled="!store.server || !store.isServerEditable">
                     </b-form-input>
                  </b-col>
               </b-row>
            </div>
         </b-form-group>
      </div>
   </b-container>
</template>

<style scoped>
input:focus::placeholder {
  color: transparent;
}
</style>


<script lang="ts">
import { Component } from 'vue-property-decorator';
import Behaviour from './servers_code';
@Component({ name: 'Servers' })
export default class extends Behaviour { }
</script>
