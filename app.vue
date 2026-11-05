<!--
  app.vue
  Root application entry component:
  - PWA manifest and route announcer integration
  - Layout rendering
  - Global footer and toast notification layers
  - Top-level theme initialization and auth synchronization
-->
<template>
	<NuxtPwaManifest />
	<NuxtRouteAnnouncer />
	<div class="min-h-screen flex flex-col">
		<NuxtLayout />
		<Footer />
	</div>
	<Notification />
</template>

<script setup lang="ts">
	useHead({
		title: 'Rifat Mahmud — Developer & Creator'
	})

	const { initTheme } = useTheme()
	const { checkAuth } = useAuth()

	// Initial setup: activate theme preference and verify auth status
	onMounted(async () => {
		initTheme()
		await checkAuth()
	})
</script>
