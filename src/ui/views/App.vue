<template>
   <div id="app">
      <!-- <router-link to="/">Home</router-link> -->
      <!-- <router-view/> -->

      <b-navbar fixed="top" toggleable="sm" type="dark" variant="primary">
         <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
         <b-navbar-brand href="#">ASB Mobile</b-navbar-brand>

         <b-collapse is-nav id="nav_collapse">
            <!-- Left aligned nav items -->
            <b-navbar-nav>
               <b-nav-item @click="tab='welcome'">Welcome</b-nav-item>
               <b-nav-item @click="tab='servers'">Servers</b-nav-item>
               <b-nav-item @click="tab='extractor'">Extractor</b-nav-item>
               <b-nav-item @click="tab='about'">About</b-nav-item>
            </b-navbar-nav>

            <!-- Right aligned nav items -->
            <b-navbar-nav class="ml-auto">
               <b-nav-item @click="tab='settings'">Settings</b-nav-item>
               <b-nav-item @click="tab='tester'">Tester</b-nav-item>
               <!-- <b-nav-item @click="tab='db'">DB</b-nav-item> -->
            </b-navbar-nav>
         </b-collapse>
      </b-navbar>

      <b-container fluid style="margin-top: 4rem" class="p-2 pt-0">
         <b-progress v-show="!store.dataLoaded" :value="100" striped :animated="true" variant="secondary" class="fixed-top" style="height: 0.4rem"></b-progress>

         <welcome v-if="tab=='welcome'" class="w3-container w3-animate-opacity"></welcome>
         <settings v-else-if="tab=='settings'" class="w3-container w3-animate-opacity"></settings>
         <servers v-else-if="store.dataLoaded && tab=='servers'" class="w3-container w3-animate-opacity"></servers>
         <extractor v-else-if="store.dataLoaded && tab=='extractor'" class="w3-container w3-animate-opacity"></extractor>
         <tester v-else-if="store.dataLoaded && tab=='tester'" class="w3-container w3-animate-opacity"></tester>
         <!-- <database v-else-if="store.dataLoaded && tab=='db'" class="w3-container w3-animate-opacity"></database> -->
         <about v-else-if="tab=='about'" class="w3-container w3-animate-opacity"></about>
      </b-container>
   </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import Behaviour from '../behaviour/App';
@Component
export default class extends Behaviour { }
</script>
