<script setup>
import EffectDemo from './EffectDemo.vue';
const title = '隨機閃爍文字與 Logo';
const summary = '字元以不規則延遲閃現，再穩定成為完整段落。';
</script>
<template>
  <main>
    <h1>{{ title }}</h1>
    <p>{{ summary }}</p>
    <EffectDemo />
  </main>
</template>
