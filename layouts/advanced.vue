<!--
  layouts/advanced.vue
  Two-column layout with category/post sidebar navigation on the left
  and article content area on the right.
  Provides reactive 'refreshSidebar' and 'sidebarData' dependencies to children.
-->
<template>
	<div class="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
		<Navigation />
		<div class="flex-1 flex w-full relative">
			<Sidebar class="shrink-0 z-30" />
			<main class="grow p-4 sm:p-6 lg:p-8 max-w-4xl min-w-0 mx-auto w-full relative">
				<NuxtPage />
			</main>
		</div>
	</div>
</template>

<script setup lang="ts">
	const { setShowToggleBtn } = useShowToggleBtn()
	// Enables the mobile sidebar toggle button in the header
	setShowToggleBtn(true)

	// Provides reactive bridge allowing child pages/modals to refresh sidebar categories
	provide('refreshSidebar', ref(false))
	provide('sidebarData', ref<EachSectionType[]>([]))
</script>
