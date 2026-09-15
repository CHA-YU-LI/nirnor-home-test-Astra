<script setup>
import EffectDemo from './EffectDemo.vue';
const title = '混沌粒子流形與形態切換';
const summary = '細粒子構成大片流形；跨過 About 分界，平滑變形成另一組吸引子。';
</script>
<template>
  <main>
    <h1>{{ title }}</h1>
    <p>{{ summary }}</p>
    <EffectDemo />
  </main>
</template>
