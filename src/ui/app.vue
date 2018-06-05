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
               <b-nav-item-dropdown text="Info" variant="info">
                  <b-nav-item to="/info/about">About</b-nav-item>
                  <b-nav-item to="/info/welcome">Welcome</b-nav-item>
                  <b-nav-item to="/info/whatsnew">What's New</b-nav-item>
               </b-nav-item-dropdown>

               <b-nav-item to="/libraries">Libraries</b-nav-item>

               <b-nav-item to="/settings">Settings</b-nav-item>

               <!-- <b-nav-item @click="tab='servers'" :disabled="!store.dataLoaded">Servers</b-nav-item> -->
               <!-- <b-nav-item @click="tab='extractor'" :disabled="!store.dataLoaded">Extractor</b-nav-item> -->
               <!-- <b-nav-item @click="tab='library'" :disabled="!store.dataLoaded">Library</b-nav-item> -->
               <!-- <b-nav-item @click="tab='firestore'" :disabled="!store.dataLoaded">fs</b-nav-item> -->
               <!-- <b-nav-item @click="tab='fireauth'" :disabled="!store.dataLoaded">auth</b-nav-item> -->
            </b-navbar-nav>

            <!-- Right aligned nav items -->
            <b-navbar-nav class="ml-auto">
               <transition name="fade">
                  <b-nav-item to="/user" v-if="!store.user">Sign In</b-nav-item>
                  <b-nav-item to="/user" v-else class="p-0 hdr-user-img-nav">
                     <b-img :src="store.user.photoURL" class="p-0 hdr-user-img" rounded="circle"></b-img>
                  </b-nav-item>
               </transition>
               <b-nav-item-dropdown text="Dev" boundary="window">
                  <b-nav-item to="/dev/tester">Tester</b-nav-item>
                  <b-nav-item to="/dev/firestore">Data explorer</b-nav-item>
               </b-nav-item-dropdown>
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

         <div class="tabcont">
            <transition name="slidefade" class="tabcont">
               <!-- <transition-group name="slidefade" tag="div" class="tabcont"> -->
               <router-view></router-view>
               <!-- <welcome v-show="tab=='welcome'" key="welcome"></welcome> -->
               <!-- <settings v-show="tab=='settings'" key="settings"></settings> -->
               <!-- <servers v-show="tab=='servers'" key="servers"></servers> -->
               <!-- <extractor v-show="tab=='extractor'" key="extractor"></extractor> -->
               <!-- <library v-show="tab=='library'" key="library"></library> -->
               <!-- <tester v-show="tab=='tester'" key="tester"></tester> -->
               <!-- <firestore v-show="tab=='firestore'" key="firestore"></firestore> -->
               <!-- <fireauth v-show="tab=='fireauth'" key="fireauth"></fireauth> -->
               <!-- <about v-show="tab=='about'" key="about"></about> -->
               <!-- </transition-group> -->
               <div v-if="false" class="spinner-holder">
                  <spinner size="4rem" background="#49649C" style="display:block"></spinner>
               </div>
            </transition>
         </div>
      </b-container>
   </div>
</template>


<style lang="scss">
@import '~bootstrap/scss/functions';//, '~bootstrap/scss/variables';
@import "../assets/scss/asbm-bootstrap";

.hdr-user-img {
  max-height: 37px;
  max-width: 37px;
  object-fit: contain;
}

.hdr-user-img-nav a {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  vertical-align: middle;
  height: 100%;
}

.navbar-nav .dropdown-menu {
  background-color: darken(theme-color('primary'), 5%);
  padding-left: 0.5rem;
}

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
import Spinner from '@/ui/components/Spinner.vue';
import Behaviour from './app_code';
@Component({ name: 'App', components: { spinner: Spinner } })
export default class extends Behaviour { }
</script>
