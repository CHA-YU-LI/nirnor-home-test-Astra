<script setup>
import EffectDemo from './EffectDemo.vue';
const title = '影像邊緣拉伸揭露';
const summary = '從左向右還原圖片，尚未揭露的區域延展當前掃描列的顏色。';
</script>
<template>
  <main>
    <h1>{{ title }}</h1>
    <p>{{ summary }}</p>
    <EffectDemo />
  </main>
</template>
