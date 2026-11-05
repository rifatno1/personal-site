<!--
  ThemeToggle.vue
  3-way theme toggle button: Auto (system) -> Light -> Dark.
  Features animated icons for each state and tooltip indications.
-->
<template>
	<button
		type="button"
		class="relative flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white bg-zinc-100/80 hover:bg-zinc-200/70 dark:bg-zinc-900/80 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800 transition-all duration-200 shadow-xs cursor-pointer group"
		@click="toggleTheme"
		:title="`Theme: ${theme} (Click to switch)`"
		aria-label="Toggle color theme"
	>
		<IconMonitor v-if="theme === 'auto'" class="w-3.5 h-3.5 text-indigo-500 group-hover:scale-110 transition-transform" />
		<IconSun v-else-if="theme === 'light'" class="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
		<IconMoon v-else class="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
		<span class="capitalize text-xs font-semibold hidden sm:inline">{{ theme }}</span>
	</button>
</template>

<script setup lang="ts">
	const { theme, toggleTheme, initTheme } = useTheme()

	onMounted(() => {
		initTheme()
	})
</script>
