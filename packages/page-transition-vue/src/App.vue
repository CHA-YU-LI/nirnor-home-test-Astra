<script setup>
import EffectDemo from './EffectDemo.vue';
const title = '實際換頁與淡出淡入';
const summary = '舊頁先淡出，再淡入新頁；URL 與瀏覽歷史同步改變。';
</script>
<template>
  <main>
    <h1>{{ title }}</h1>
    <p>{{ summary }}</p>
    <EffectDemo />
  </main>
</template>
