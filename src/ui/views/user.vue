<template>
   <b-container fluid>
      <header>
         <h3 class="text-center">Firebase Auth</h3>
      </header>

      <section v-if="!store.loggedIn && !authUIVisible">
         <b-btn @click="signIn">Sign In</b-btn>
      </section>

      <section v-if="store.loggedIn">
         <b-media>
            <b-img v-if="store.userInfo && store.userInfo.photoURL" slot="aside" :src="store.userInfo.photoURL" alt="User avatar" class="user-img" rounded="circle"></b-img>
            <b-img v-else slot="aside" blank blank-color="grey" alt="Blank user avatar" class="user-img" rounded="circle"></b-img>
            <div class="mt-0">
               <span class="">{{store.userInfo && store.userInfo.displayName || '-'}}</span>
               <b-btn variant="link" @click="showDisplayNameEdit=true">
                  <b-img :src="require('@/assets/edit.svg')"></b-img>
               </b-btn>
            </div>
            <p>{{store.authUser.email}}</p>
         </b-media>
         <b-btn @click="signOut">Sign out</b-btn>
      </section>

      <section id="firebaseui-div">
      </section>

      <b-modal id="displayNameEdit" v-model="showDisplayNameEdit" title="Edit display name" centered @ok.prevent="submitDisplayName" :ok-disabled="!isDisplayNameValid" @shown="newDisplayName=store.userInfo && store.userInfo.displayName || ''">
         <b-form @submit.stop.prevent="submitDisplayName">
            <b-form-input type="text" v-model.trim="newDisplayName" :state="isDisplayNameValid"></b-form-input>
            <b-form-invalid-feedback>
               Enter a display name
            </b-form-invalid-feedback>
         </b-form>
      </b-modal>
   </b-container>
</template>


<style lang="scss" scoped>
.user-img {
   width: 5rem;
   height: 5rem;
   object-fit: contain;
}
</style>


<script lang="ts">
export { default as default } from './user_code';
</script>
