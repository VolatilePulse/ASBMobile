<template>
   <div style="overflow-x:hidden;min-width:326px">

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
            </b-navbar-nav>

            <!-- Right aligned nav items -->
            <b-navbar-nav class="ml-auto">
               <transition name="fade">
                  <b-nav-item to="/user" v-if="!store.authUser">Sign In</b-nav-item>
                  <b-nav-item to="/user" v-else class="p-0 hdr-user-img-nav">
                     <b-img v-if="store.userInfo && store.userInfo.photoURL" :src="store.userInfo.photoURL" class="p-0 hdr-user-img" rounded="circle"></b-img>
                     <b-img v-else blank :blank-color="store.colorForUser()" class="p-0 hdr-user-img" rounded="circle"></b-img>
                  </b-nav-item>
               </transition>
               <b-nav-item-dropdown v-if="store.localSettings.devMode" text="Dev" right>
                  <b-nav-item to="/dev/tester">Tester</b-nav-item>
                  <b-nav-item to="/dev/console">Console</b-nav-item>
                  <b-nav-item to="/dev/firestore">Data explorer</b-nav-item>
               </b-nav-item-dropdown>
            </b-navbar-nav>
         </b-collapse>
      </b-navbar>

      <b-container fluid style="margin-top: 4rem" class="p-0">
         <b-progress v-show="!store.loaded.data" :value="100" striped :animated="true" variant="secondary" class="fixed-top" style="height: 0.4rem"></b-progress>

         <!-- TODO: Replace: Temporary indicators for pending changes ready to be saved -->
         <div class="statusbadge" style="margin-top: -0.8rem">
            <b-badge v-if="store.changesPending.settings" variant="info" class="mx-1 my-0">Pending Settings Save</b-badge>
            <b-badge v-if="store.changesPending.servers" variant="secondary" class="mx-1 my-0">Pending Server Save</b-badge>
         </div>

         <!-- The update available notice -->
         <b-alert :show="store.updateAvailable" dismissible variant="info">Update available! Reload to activate.</b-alert>

         <!-- Loading errors - TODO: clean this up? -->
         <b-alert v-for="err in store.loadErrors" :key="err" :show="true" variant="danger">
            <b>Load error:</b>
            <pre class="text-dark" style="white-space:pre-wrap;word-wrap:break-word">{{err}}</pre>
         </b-alert>

         <!-- General messages -->
         <b-alert v-for="({variant,message},idx) in store.messages" :key="idx" :show="true" dismissible :variant="variant" @dismissed="store.removeDismissableMessage(idx)">
            <span class="text-dark" style="white-space:normal;word-wrap:break-word">{{message}}</span>
         </b-alert>

         <!-- The alert on data load failure -->
         <b-alert variant="danger" :show="!!store.dataLoadError">
            <strong>Failed to load the Ark database!</strong>
            <div>Most of this application will be disabled until access to the database is restored.</div>
         </b-alert>

         <div class="tabcont">
            <transition name="slidefade">
               <div v-if="store.routerAwaitingLoad" class="spinner-holder">
                  <spinner size="4rem" background="#49649C" style="display:block"></spinner>
               </div>
               <router-view v-else></router-view>
            </transition>
         </div>
      </b-container>
   </div>
</template>


<style lang="scss">
.hdr-user-img {
  height: 37px;
  width: 37px;
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
