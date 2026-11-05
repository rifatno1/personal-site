<!--
  Navigation/index.vue
  Sticky glassmorphism header navigation:
  - Responsive brand logo and mobile drawer toggle
  - Navigation links: Home, About, Contact (or Messages for Admin)
  - Admin mode status badge
  - Theme mode toggle button
  - Sign in / Sign out controls with state synchronization
-->
<template>
	<header class="sticky top-0 z-50 h-[var(--nav-height)] bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 px-4 sm:px-6 lg:px-8 transition-colors duration-200 flex items-center justify-between">
		<NavigationToggleBtn />

		<div class="flex items-center gap-1 sm:gap-2">
			<NuxtLink
				to="/"
				exact-active-class="bg-zinc-100 text-zinc-950 dark:bg-zinc-800/90 dark:text-white font-semibold shadow-xs"
				class="nav-link flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50 transition-all duration-150"
			>
				<IconHome class="w-4 h-4" />
				<span class="max-[420px]:hidden">Home</span>
			</NuxtLink>

			<NuxtLink
				to="/about"
				exact-active-class="bg-zinc-100 text-zinc-950 dark:bg-zinc-800/90 dark:text-white font-semibold shadow-xs"
				class="nav-link flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50 transition-all duration-150"
			>
				<IconAbout class="w-4 h-4" />
				<span class="max-[420px]:hidden">About</span>
			</NuxtLink>

			<NuxtLink
				to="/contact"
				v-if="!isAdmin"
				exact-active-class="bg-zinc-100 text-zinc-950 dark:bg-zinc-800/90 dark:text-white font-semibold shadow-xs"
				class="nav-link flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50 transition-all duration-150"
			>
				<IconContact class="w-4 h-4" />
				<span class="max-[420px]:hidden">Contact</span>
			</NuxtLink>

			<NuxtLink
				to="/contacted"
				v-else
				exact-active-class="bg-zinc-100 text-zinc-950 dark:bg-zinc-800/90 dark:text-white font-semibold shadow-xs"
				class="nav-link flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50 transition-all duration-150"
			>
				<IconContact class="w-4 h-4" />
				<span class="max-[420px]:hidden">Messages</span>
			</NuxtLink>

			<!-- Admin Indicator Badge -->
			<div
				v-if="isAdmin"
				class="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/60"
			>
				<span class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
				Admin
			</div>

			<div class="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1"></div>

			<ThemeToggle />

			<NuxtLink
				to="/login"
				v-if="!isAdmin"
				exact-active-class="bg-zinc-100 text-zinc-950 dark:bg-zinc-800/90 dark:text-white font-semibold shadow-xs"
				class="nav-link flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50 transition-all duration-150"
				title="Admin Sign In"
			>
				<IconLogin class="w-4 h-4" />
				<span class="max-[550px]:hidden">Sign In</span>
			</NuxtLink>

			<button
				v-else
				@click="handleLogout"
				type="button"
				class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
				title="Sign Out"
			>
				<IconLogout class="w-4 h-4" />
				<span class="max-[550px]:hidden">Logout</span>
			</button>
		</div>
	</header>
</template>

<script setup lang="ts">
	const { isAdmin, checkAuth, logout } = useAuth()

	// Initial auth validation on component mount
	onMounted(async () => {
		await checkAuth()
	})

	function handleLogout() {
		logout()
	}
</script>
