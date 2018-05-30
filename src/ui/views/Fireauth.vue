<template>
   <b-container fluid v-if="store.loaded.firestore && store.loaded.auth">
      <header>
         <h3 class="text-center">Firebase Auth</h3>
      </header>

      <section v-if="!store.loggedIn && !authUIVisible">
         <b-btn @click="signIn">Sign In</b-btn>
      </section>

      <section v-if="store.loggedIn">
         <b-media>
            <b-img v-if="store.user.photoURL" slot="aside" :src="store.user.photoURL" alt="User avatar" class="user-img" rounded="circle"></b-img>
            <b-img v-else slot="aside" blank :blank-color="store.userBlankColor" alt="User avatar" class="user-img" rounded></b-img>
            <div class="mt-0">
               <span class="">{{store.user.displayName}}</span>
               <b-btn variant="link" @click="showDisplayNameEdit=true">
                  <b-img :src="require('@/assets/edit.svg')"></b-img>
               </b-btn>
            </div>
            <p>{{store.user.email}}</p>
         </b-media>
         <b-btn @click="signOut">Sign out</b-btn>
      </section>

      <section id="firebaseui-div">
      </section>

      <b-modal id="displayNameEdit" :visible="showDisplayNameEdit" title="Edit display name" @ok.prevent="submitDisplayName" :ok-disabled="!isDisplayNameValid" @shown="newDisplayName=store.user.displayName" centered>
         <b-form @submit.stop.prevent="submitDisplayName">
            <b-form-input type="text" v-model.trim="newDisplayName" :state="isDisplayNameValid"></b-form-input>
            <b-form-invalid-feedback>
               Enter a display name
            </b-form-invalid-feedback>
         </b-form>
      </b-modal>
   </b-container>
   <div v-else></div>
</template>


<style lang="scss" scoped>
.user-img {
   width: 5rem;
   height: 5rem;
   object-fit: contain;
}
</style>


<script lang="ts">
import { Component } from 'vue-property-decorator';
import Behaviour from '../behaviour/Fireauth';
@Component({ name: 'Fireauth' })
export default class extends Behaviour { }
</script>
