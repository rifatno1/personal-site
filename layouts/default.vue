<!--
  layouts/default.vue
  Standard single-column layout for standalone pages without the sidebar
  (e.g., About, Contact, Sign In, Registration, Messages Inbox).
-->
<template>
	<div class="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
		<Navigation />
		<main class="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 relative">
			<NuxtPage />
		</main>
	</div>
</template>

<script setup lang="ts">
	const { setShowToggleBtn } = useShowToggleBtn()
	// Disable sidebar toggle button in the header for default layout
	setShowToggleBtn(false)
</script>
