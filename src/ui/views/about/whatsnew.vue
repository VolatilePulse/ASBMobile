<template>
   <section v-html="versionInfo" class="whatsnew">
   </section>
</template>


<script lang="ts">
import { Component } from 'vue-property-decorator';
import Behaviour from '../../behaviour/Common';

import versionInfo from '../../whatsnew';

@Component({ name: 'WhatsNew' })
export default class extends Behaviour {
   versionInfo = versionInfo;
}
</script>


<style lang="scss">
@import '~bootstrap/scss/functions';//, '~bootstrap/scss/variables';
@import "../../../assets/scss/asbm-bootstrap";

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
