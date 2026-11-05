<!--
  NavigationToggleBtn.vue
  Header brand branding block:
  - Mobile hamburger toggle button (active on screens <= 800px when layout provides sidebar)
  - Author avatar with status indicator and animated hover transitions
  - Site title link to homepage
-->
<template>
	<div class="flex items-center gap-2.5">
		<button
			v-if="showToggleBtn"
			type="button"
			class="hidden max-[800px]:flex items-center justify-center w-8 h-8 rounded-xl text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800 transition-colors cursor-pointer"
			@click="toggleShowSidebar"
			aria-label="Toggle navigation drawer"
		>
			<IconMenu class="w-4 h-4" />
		</button>

		<NuxtLink to="/" class="flex items-center gap-2.5 group">
			<div class="relative">
				<img
					src="/icons/icon-192.png"
					alt="Avatar"
					class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl ring-1 ring-zinc-300/80 dark:ring-zinc-700/80 shadow-xs group-hover:scale-105 group-hover:ring-indigo-500 dark:group-hover:ring-indigo-400 transition-all duration-200 object-cover"
				/>
				<span class="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-950"></span>
			</div>
			<div class="flex flex-col">
				<span class="font-bold text-sm sm:text-base tracking-tight text-zinc-900 dark:text-zinc-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
					Rifat Mahmud
				</span>
			</div>
		</NuxtLink>
	</div>
</template>

<script setup lang="ts">
	const { toggleShowSidebar } = useShowSidebar()
	const { showToggleBtn } = useShowToggleBtn()
</script>
