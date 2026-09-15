<script setup>
import EffectDemo from './EffectDemo.vue';
const title = '服務手風琴與直向媒體帶';
const summary = '選擇服務後展開說明，左側媒體垂直滑到對應項目並調整位置。';
</script>
<template>
  <main>
    <h1>{{ title }}</h1>
    <p>{{ summary }}</p>
    <EffectDemo />
  </main>
</template>
