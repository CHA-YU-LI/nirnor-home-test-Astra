<script setup>
import EffectDemo from './EffectDemo.vue';
const title = '組合：首頁連續動態';
const summary = '文字進場、粒子變形、方塊公轉與分類展開，依同一條捲動路徑連續呈現。';
</script>
<template>
  <main>
    <h1>{{ title }}</h1>
    <p>{{ summary }}</p>
    <EffectDemo />
  </main>
</template>
