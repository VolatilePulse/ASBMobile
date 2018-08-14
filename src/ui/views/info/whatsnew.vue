<template>
   <section v-html="versionInfo" class="whatsnew">
   </section>
</template>


<style lang="scss">
.whatsnew {
   margin: 1rem;

   header {
      font-weight: bold;
      font-size: 120%;
      color: theme-color('secondary');
      margin-bottom: 0.5rem;
   }

   section {
      margin-left: 1rem;
      margin-bottom: 2rem;

      h1 {
         font-size: 1rem;
         color: lighten(theme-color('info'), 20%);
      }
   }
}
</style>


<script lang="ts">
import { Component } from 'vue-property-decorator';
import Behaviour from '../../common';

import versionInfo from '../../whatsnew';

@Component({ name: 'WhatsNew' })
export default class extends Behaviour {
   versionInfo = versionInfo;
}
</script>
