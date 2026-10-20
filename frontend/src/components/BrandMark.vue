<template>
  <svg :width="size" :height="size" viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <path d="M32 12 10 24l22 12 22-12L32 12Z" fill="#7be495" />
    <path d="M18 33v9c0 3 6 8 14 8s14-5 14-8v-9l-14 7.6L18 33Z" fill="#e9c46a" />
    <path d="M54 24v14" stroke="#7be495" stroke-width="3" stroke-linecap="round" />
  </svg>
</template>

<script setup>
defineProps({ size: { type: Number, default: 24 } });
</script>
