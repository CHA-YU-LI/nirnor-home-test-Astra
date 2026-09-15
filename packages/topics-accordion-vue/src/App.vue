<script setup>
import EffectDemo from './EffectDemo.vue';
const title = '消息列高度展開';
const summary = '點擊消息列，內文沿高度展開；指示箭頭同步改變方向。';
</script>
<template>
  <main>
    <h1>{{ title }}</h1>
    <p>{{ summary }}</p>
    <EffectDemo />
  </main>
</template>
