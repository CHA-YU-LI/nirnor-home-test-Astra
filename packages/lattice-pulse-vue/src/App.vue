<script setup>
import EffectDemo from './EffectDemo.vue';
const title = '點陣立方體膨脹循環';
const summary = '規則三維點陣緩慢旋轉，每隔一段時間在緊密與巨大尺度間切換。';
</script>
<template>
  <main>
    <h1>{{ title }}</h1>
    <p>{{ summary }}</p>
    <EffectDemo />
  </main>
</template>
