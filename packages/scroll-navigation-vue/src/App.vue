<script setup>
import EffectDemo from './EffectDemo.vue';
const title = '慣性捲動、黏附目錄與導覽換色';
const summary = '平滑前往區段；目錄依位置改變大小與底線，深色區域切換導覽顏色。';
</script>
<template>
  <main>
    <h1>{{ title }}</h1>
    <p>{{ summary }}</p>
    <EffectDemo />
  </main>
</template>
