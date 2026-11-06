<!--
  SidebarContainer.vue
  Responsive container for the sidebar:
  - Sticky left column on desktop (width clamped and resizable)
  - Full-height drawer overlay with backdrop blur on mobile screens (<800px)
  - Closes when clicking the backdrop
-->
<template>
	<aside class="h-[var(--main-con-height)] top-[var(--nav-height)] sticky flex max-[800px]:fixed max-[800px]:inset-0 max-[800px]:top-[var(--nav-height)] max-[800px]:z-40 max-[800px]:w-full max-[800px]:bg-zinc-950/60 max-[800px]:backdrop-blur-sm transition-all duration-300" :class="!showSidebar ? 'max-[800px]:hidden' : ''" @click="clicked" ref="nav" aria-label="Article navigation sidebar">
		<div class="min-w-[15rem] w-[17rem] max-w-[85dvw] h-full bg-white dark:bg-[#0c0c0e] border-r border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col transition-all overflow-hidden" :style="resizedWidth ? `width:${resizedWidth}` : ''">
			<slot />
		</div>
		<SidebarResizeBar class="max-[800px]:hidden" :set-new-width="(v: string) => (resizedWidth = v)" />
	</aside>
</template>

<script setup lang="ts">
	const { showSidebar, toggleShowSidebar } = useShowSidebar()
	const nav = ref<HTMLElement | null>(null)
	const resizedWidth = ref('')

	// Closes the drawer if the user clicks the darkened backdrop outside the drawer
	function clicked(e: MouseEvent) {
		if (e.target === nav.value) toggleShowSidebar()
	}
</script>
