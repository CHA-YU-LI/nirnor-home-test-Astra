<script setup>
import EffectDemo from './EffectDemo.vue';
const title = '分類立方體分階段攤平';
const summary = '旋轉的圖片盒先擺正，再依鉸鏈展開，成為 6 張圖的平面組合。';
</script>
<template>
  <main>
    <h1>{{ title }}</h1>
    <p>{{ summary }}</p>
    <EffectDemo />
  </main>
</template>
