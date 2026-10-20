<template>
  <div class="bg" aria-hidden="true">
    <div class="bg__blob bg__blob--a" />
    <div class="bg__blob bg__blob--b" />
    <div class="bg__blob bg__blob--c" />
    <canvas ref="canvas" class="bg__canvas" />
    <div class="bg__grain" />
  </div>
</template>

<script setup>
// Fondo animado del login: auroras de color que se mueven despacio + una red de
// puntos conectados (como una "constelacion" de aprendices) que reacciona al mouse.
import { onBeforeUnmount, onMounted, ref } from "vue";

const canvas = ref(null);
let raf = 0;
let ctx, w, h, dpr, particles = [];
const mouse = { x: -9999, y: -9999 };
const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  w = canvas.value.clientWidth;
  h = canvas.value.clientHeight;
  canvas.value.width = w * dpr;
  canvas.value.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const n = Math.min(90, Math.floor((w * h) / 16000));
  particles = Array.from({ length: n }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r: Math.random() * 1.6 + 0.7,
    gold: Math.random() < 0.12,
  }));
}

function frame() {
  ctx.clearRect(0, 0, w, h);
  const LINK = 130;
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > w) p.vx *= -1;
    if (p.y < 0 || p.y > h) p.vy *= -1;
    // el mouse atrae suavemente los puntos cercanos
    const dx = mouse.x - p.x, dy = mouse.y - p.y;
    const d2 = dx * dx + dy * dy;
    if (d2 < 22000) {
      p.x += dx * 0.004;
      p.y += dy * 0.004;
    }
  }
  for (let i = 0; i < particles.length; i++) {
    const a = particles[i];
    for (let j = i + 1; j < particles.length; j++) {
      const b = particles[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < LINK) {
        ctx.strokeStyle = `rgba(123,228,149,${(1 - d / LINK) * 0.28})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }
  for (const p of particles) {
    ctx.fillStyle = p.gold ? "rgba(233,185,73,0.95)" : "rgba(190,245,208,0.85)";
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  if (!reduce) raf = requestAnimationFrame(frame);
}

const onMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
const onLeave = () => { mouse.x = mouse.y = -9999; };

onMounted(() => {
  ctx = canvas.value.getContext("2d");
  resize();
  frame();
  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseleave", onLeave);
});
onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
  window.removeEventListener("resize", resize);
  window.removeEventListener("mousemove", onMove);
  window.removeEventListener("mouseleave", onLeave);
});
</script>

<style scoped lang="scss">
.bg { position: fixed; inset: 0; overflow: hidden; background: #08140f; z-index: 0; }
.bg__canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
.bg__blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.55; will-change: transform; }
.bg__blob--a { width: 46vmax; height: 46vmax; left: -12vmax; top: -14vmax; background: #1f9d55; animation: driftA 22s ease-in-out infinite alternate; }
.bg__blob--b { width: 38vmax; height: 38vmax; right: -10vmax; bottom: -14vmax; background: #14634a; animation: driftB 26s ease-in-out infinite alternate; }
.bg__blob--c { width: 22vmax; height: 22vmax; right: 18vmax; top: 6vmax; background: #e9b949; opacity: 0.22; animation: driftC 30s ease-in-out infinite alternate; }
.bg__grain { position: absolute; inset: 0; background: radial-gradient(ellipse at center, transparent 40%, rgba(4, 12, 8, 0.65) 100%); }
@keyframes driftA { to { transform: translate(14vmax, 10vmax) scale(1.15); } }
@keyframes driftB { to { transform: translate(-16vmax, -8vmax) scale(1.2); } }
@keyframes driftC { to { transform: translate(-10vmax, 14vmax) scale(0.8); } }
@media (prefers-reduced-motion: reduce) { .bg__blob { animation: none; } }
</style>
