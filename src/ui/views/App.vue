<template>
   <div id="app" style="overflow-x:hidden">
      <!-- <router-link to="/">Home</router-link> -->
      <!-- <router-view/> -->

      <b-navbar fixed="top" toggleable="sm" type="dark" variant="primary">
         <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
         <b-navbar-brand href="#" class="py-0 mr-1" style="margin-top:-0.2rem">
            <b-img :src="require('@/assets/asbm-inline.svg')" alt="ASB Mobile" style="max-height:1.6rem"></b-img>
         </b-navbar-brand>

         <b-collapse is-nav id="nav_collapse">
            <!-- Left aligned nav items -->
            <b-navbar-nav>
               <b-nav-item @click="tab='about'">About</b-nav-item>
               <b-nav-item @click="tab='welcome'">Welcome</b-nav-item>
               <b-nav-item @click="tab='servers'" :disabled="!store.dataLoaded">Servers</b-nav-item>
               <b-nav-item @click="tab='extractor'" :disabled="!store.dataLoaded">Extractor</b-nav-item>
               <b-nav-item @click="tab='library'" :disabled="!store.dataLoaded">Library</b-nav-item>
               <b-nav-item @click="tab='firestore'" :disabled="!store.dataLoaded">fs</b-nav-item>
               <b-nav-item @click="tab='fireauth'" :disabled="!store.dataLoaded">auth</b-nav-item>
            </b-navbar-nav>

            <!-- Right aligned nav items -->
            <b-navbar-nav class="ml-auto">
               <b-nav-item @click="tab='settings'">Settings</b-nav-item>
               <b-nav-item @click="tab='tester'" :disabled="!store.dataLoaded">Tester</b-nav-item>
            </b-navbar-nav>
         </b-collapse>
      </b-navbar>

      <b-container fluid style="margin-top: 4rem" class="p-0">
         <b-progress v-show="!store.dataLoaded && !store.dataLoadError" :value="100" striped :animated="true" variant="secondary" class="fixed-top" style="height: 0.4rem"></b-progress>

         <!-- TODO: Replace: Temporary indicators for pending changes ready to be saved -->
         <div class="statusbadge" style="margin-top: -0.8rem">
            <b-badge v-if="store.changesPending.settings" variant="info" class="mx-1 my-0">Pending Settings Save</b-badge>
            <b-badge v-if="store.changesPending.servers" variant="secondary" class="mx-1 my-0">Pending Server Save</b-badge>
         </div>

         <!-- The update available notice -->
         <b-alert :show="store.updateAvailable" dismissible variant="info">Update available! Reload to activate.</b-alert>

         <!-- The alert on data load failure -->
         <b-alert variant="danger" :show="!!store.dataLoadError">
            <strong>Failed to load the Ark database!</strong>
            <div>Most of this application will be disabled until access to the database is restored.</div>
         </b-alert>

         <transition name="fade">
            <transition-group v-if="store.dataLoaded && store.libraryReady && store.settingsReady && store.loaded.auth" name="slidefade" tag="div" class="tabcont">
               <welcome v-show="tab=='welcome'" key="welcome"></welcome>
               <settings v-show="tab=='settings'" key="settings"></settings>
               <servers v-show="tab=='servers'" key="servers"></servers>
               <extractor v-show="tab=='extractor'" key="extractor"></extractor>
               <library v-show="tab=='library'" key="library"></library>
               <tester v-show="tab=='tester'" key="tester"></tester>
               <firestore v-show="tab=='firestore'" key="firestore"></firestore>
               <fireauth v-show="tab=='fireauth'" key="fireauth"></fireauth>
               <about v-show="tab=='about'" key="about"></about>
            </transition-group>
            <div v-else class="spinner-holder">
               <spinner size="4rem" background="#49649C" style="display:block"></spinner>
            </div>
         </transition>
      </b-container>
   </div>
</template>


<style scoped>
.statusbadge {
  z-index: 500;
  position: fixed;
  right: 0.3rem;
}

.tabcont > * {
  position: absolute;
}

.spinner-holder {
  margin-top: 8rem;
  left: 50%;
  right: 50%;
  margin-left: -3rem;
  margin-right: -3rem;
  display: block;
  position: absolute;
}

.slidefade-enter-active,
.slidefade-leave-active {
  transition: transform 0.5s ease, opacity 0.5s ease;
}

.slidefade-enter {
  transform: translateX(-2rem);
  opacity: 0;
}

.slidefade-leave-to {
  transform: translateX(2rem);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>



<script lang="ts">
import { Component } from 'vue-property-decorator';
import Behaviour from '../behaviour/App';
import Spinner from '@/ui/components/Spinner.vue';
@Component({ name: 'App', components: { spinner: Spinner } })
export default class extends Behaviour { }
</script>
