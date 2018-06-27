<template>
   <b-container fluid>
      <h3>Messages</h3>
      <b-button @click="addMessage">Simple Message</b-button>
      <b-button @click="addMEssageWithError">Message with error</b-button>
      <h3>Errors</h3>
      <b-button @click="raiseSyncException">Normal exception</b-button>
      <b-button @click="raiseAsyncException">Async exception</b-button>
      <h3>Properties</h3>
      <b-checkbox v-model="showBroken">Show broken</b-checkbox>
      <span v-if="showBroken">{{broken}}</span>
   </b-container>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import Common from '@/ui/common';

@Component
export default class DevError extends Common {
   showBroken = false;

   created() {
      throw new Error('This message should be display when the page is show. Something blew up in \'created\'');
   }

   async mounted() {
      throw new Error('This message should be display when the page is show. Something async blew up in \'mounted\'');
   }

   addMessage() {
      this.store.addDismissableMessage('info', 'I\'m a message');
   }

   addMEssageWithError() {
      this.store.addDismissableMessage('info', 'I\'m a message with an error object', new Error('Some error message'));
   }

   raiseSyncException() {
      throw new Error('I\'m an exception');
   }

   async raiseAsyncException() {
      throw new Error('I\'m an async exception');
   }

   get broken() { throw new Error('broken getter'); }
}
</script>
