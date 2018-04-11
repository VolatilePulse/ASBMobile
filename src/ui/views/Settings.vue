<template>
   <b-container fluid>
      <div class="pb-3">Database format: {{settings.dbVersion}}</div>
      <!--b-form>
         <b-form-group label="Dummy text field:" label-for="dummyText" description="(editable, saved)">
            <b-input id="dummyText" type="text" v-model.trim="settings.dummyText" @input="markDirty"></b-input>
         </b-form-group>
         <b-form-group label="Dummy number field:" label-for="dummyNumber" description="(editable, saved)">
            <b-input id="dummyNumber" type="number" v-model.number="settings.dummyNumber" @input="markDirty"></b-input>
         </b-form-group>
      </b-form-->

      <b-row>
         <b-col sm="3">Libraries
         </b-col>
         <b-col>
            <b-row class="px-3">
               <b-col class="pt-2">Name</b-col>
               <b-col class="pt-2">ID</b-col>
               <b-col class="px-0" cols="4"></b-col>
            </b-row>
            <b-container fluid style="border: 1px dashed #aaa;min-height: 3rem">
               <b-row v-for="id in Object.keys(settings.libraryNames)" :key="id">
                  <b-col class="pt-2" :class="{'text-secondary font-weight-bold':id == settings.selectedLibrary}">{{settings.libraryNames[id]}}</b-col>
                  <b-col class="pt-2">{{id}}</b-col>
                  <b-col class="px-0" cols="4">
                     <b-button-group>
                        <b-button variant="link" @click="selectLibrary(id)" alt="Select" :disabled="id == settings.selectedLibrary">
                           <b-img style="height:22px" :src="require('@/assets/hand.svg')"></b-img>
                        </b-button>
                        <b-button variant="link" @click="renameLibrary(id)" alt="Rename">
                           <b-img style="height:22px" :src="require('@/assets/edit.svg')"></b-img>
                        </b-button>
                        <b-button variant="link" @click="deleteLibrary(id)" alt="Delete">
                           <b-img style="height:22px" :src="require('@/assets/delete.svg')" class="mr-0"></b-img>
                        </b-button>
                     </b-button-group>
                  </b-col>
               </b-row>
            </b-container>
            <b-row class="pt-2">
               <b-col>
                  <b-input v-model.trim="newLibraryName" placeholder="New library name"></b-input>
               </b-col>
               <b-col cols="auto">
                  <b-button @click="createLibrary">Create</b-button>
               </b-col>
            </b-row>
         </b-col>
      </b-row>
      <b-form-group label="Current Library:" label-for="selLib" description="(readonly)" class="pt-3">
         <b-input id="selLib" type="text" v-model.trim="settings.selectedLibrary" readonly @input="markDirty"></b-input>
      </b-form-group>

      <!-- Model used to confirm deleting a library -->
      <b-modal id="deleteLibraryModal" ref="deleteLibraryModal" title="Delete library?" @ok.prevent="deleteLibraryConfirmed" centered>
         <p>If you delete this library all creatures and servers within it will also be deleted.</p>
         <p>Are you sure?</p>
      </b-modal>

      <!-- Modal used for editing library name -->
      <b-modal id="renameLibraryModal" ref="renameLibraryModal" title="Edit library name" @ok.prevent="renameLibrarySubmit" centered>
         <b-form @submit.stop.prevent="renameLibrarySubmit">
            <b-form-input id="renameLibraryInput" type="text" v-model.trim="renameLibraryName" :state="renameLibraryNameValidity"></b-form-input>
            <b-form-invalid-feedback>
               Enter a library name
            </b-form-invalid-feedback>
         </b-form>
      </b-modal>

   </b-container>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import Behaviour from '../behaviour/Settings';
@Component
export default class extends Behaviour { }
</script>
