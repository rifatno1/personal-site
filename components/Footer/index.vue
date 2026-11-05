<!--
  Footer/index.vue
  Global application footer with author identity, quick links, and technology badge.
-->
<template>
	<footer class="mt-auto border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md py-6 px-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
		<div class="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
			<div class="flex items-center gap-2">
				<img src="/icons/icon-192.png" alt="Logo" class="w-5 h-5 rounded-md object-cover opacity-80" />
				<span class="font-medium text-zinc-700 dark:text-zinc-300">Rifat Mahmud</span>
				<span class="text-zinc-300 dark:text-zinc-700">•</span>
				<span>Personal Portfolio & Blog</span>
			</div>

			<div class="flex items-center gap-4 text-zinc-500 dark:text-zinc-400">
				<a href="https://github.com/RifatMahmudno-1" target="_blank" rel="noopener noreferrer" class="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
					GitHub
				</a>
				<a href="https://discord.com/users/715938370840166433" target="_blank" rel="noopener noreferrer" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
					Discord
				</a>
				<NuxtLink to="/about" class="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
					About
				</NuxtLink>
				<NuxtLink to="/contact" class="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
					Contact
				</NuxtLink>
			</div>

			<div class="flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
				<span>Designed & crafted with</span>
				<IconHeart class="text-rose-500 w-3.5 h-3.5 inline animate-pulse" />
				<span>in Nuxt 4</span>
			</div>
		</div>
	</footer>
</template>
