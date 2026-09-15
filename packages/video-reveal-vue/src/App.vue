<script setup>
import EffectDemo from './EffectDemo.vue';
const title = '影片封面點擊播放';
const summary = '封面上的圓形播放鍵消失，影片與原生控制列接手。';
</script>
<template>
  <main>
    <h1>{{ title }}</h1>
    <p>{{ summary }}</p>
    <EffectDemo />
  </main>
</template>
