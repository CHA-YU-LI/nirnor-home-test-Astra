<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { init } from './demos/pixel-stretch/effect.js';
import { options } from './options.js';
import sourceMarkup from './effect.html?raw';
import './demos/pixel-stretch/effect.scss';

// This HTML is a trusted local source file, never user-submitted content.
const markup = sourceMarkup;
const host = ref(null);
const status = ref('正在啟動效果…');
let effect;
onMounted(() => {
  try {
    effect = init(host.value.querySelector('[data-effect-root]'), options);
    status.value = '可以開始操作';
  } catch (error) {
    status.value = '效果啟動失敗：' + error.message;
  }
});
// Destroy before Vue removes the DOM; this also cleans up during hot reload.
onBeforeUnmount(() => effect?.destroy());
// To update parameters at runtime: effect.update({ duration: 1 });
// update() rebuilds the effect; reset() restores its built-in defaults.
</script>
<template>
  <!-- Vue owns the host; the effect manages only the fixed local HTML inside. -->
  <div ref="host" v-html="markup"></div>
  <p class="package-status" role="status">{{ status }}</p>
</template>
