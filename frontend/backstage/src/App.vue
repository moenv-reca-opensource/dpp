<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'

const route = useRoute()
const isLogin = computed(() => route.name === 'login')
</script>

<template>
  <a class="skip-link" href="#main-content">{{ $t('app.skip') }}</a>
  <RouterView v-if="isLogin" />
  <AppLayout v-else><RouterView /></AppLayout>
</template>
