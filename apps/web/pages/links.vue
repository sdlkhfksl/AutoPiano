<template>
  <div class="links-page">
    <section class="links-card">
      <header>
        <h1>友链 & 伙伴</h1>
        <p>与我们共鸣的站点，欢迎你也加入。</p>
      </header>
      <ul>
        <li v-for="link in links" :key="link.url">
          <a :href="link.url" target="_blank" rel="noopener">
            <span class="title">{{ link.title }}</span>
            <span class="desc">{{ link.desc }}</span>
          </a>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Links } from '@autopiano/config'

const links = Links
</script>

<style scoped>
.links-page {
  display: flex;
  justify-content: center;
  padding: clamp(1rem, 4vw, 3rem);
}

.links-card {
  width: min(720px, 100%);
  background: rgba(15, 23, 42, 0.92);
  color: rgba(226, 232, 240, 0.92);
  border-radius: 16px;
  padding: clamp(1.5rem, 4vw, 2.5rem);
  box-shadow: 0 25px 60px -35px rgba(15, 23, 42, 0.85);
}

header h1 {
  margin: 0;
  font-size: 1.4rem;
}

header p {
  margin: 0.25rem 0 1.5rem;
  color: rgba(226, 232, 240, 0.7);
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.75rem;
}

li a {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  background: rgba(248, 250, 252, 0.06);
  padding: 0.85rem 1rem;
  border-radius: 12px;
  color: inherit;
  text-decoration: none;
  transition: background 0.2s ease, transform 0.2s ease;
}

li a:hover {
  background: rgba(248, 250, 252, 0.12);
  transform: translateY(-1px);
}

.title {
  font-weight: 600;
}

.desc {
  font-size: 0.9rem;
  color: rgba(226, 232, 240, 0.75);
}
</style>
