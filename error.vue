<!--
  error.vue
  Global error boundary:
  - Custom visual illustrations and recovery flows for:
    * Offline mode (device lost connection)
    * 401 Unauthorized (restricted admin routes)
    * 404 Page Not Found
    * 500 Unexpected server errors
  - Clear error recovery buttons
-->
<template>
	<NuxtPwaManifest />
	<NuxtRouteAnnouncer />
	<div class="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
		<Navigation />

		<main class="flex-1 flex items-center justify-center p-6 text-center">
			<div class="max-w-md w-full glass-card rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col items-center gap-6">
				<!-- Offline / No Internet -->
				<template v-if="netError">
					<div class="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-center text-3xl">📡</div>
					<div class="flex flex-col gap-1.5">
						<h1 class="text-2xl font-bold tracking-tight">Offline Mode</h1>
						<p class="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">You are currently offline. Please check your internet connection.</p>
					</div>
					<div class="flex items-center gap-3 pt-2">
						<button @click="goHome" class="px-4 py-2.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition cursor-pointer">Go Home</button>
						<button @click="reload" class="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition cursor-pointer">Retry</button>
					</div>
				</template>

				<!-- 401 Unauthorized -->
				<template v-else-if="error.statusCode === 401">
					<div class="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-center text-3xl">🔒</div>
					<div class="flex flex-col gap-1.5">
						<span class="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Restricted Route</span>
						<h1 class="text-2xl font-bold tracking-tight">Admin Access Required</h1>
						<p class="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">You must sign in with an authorized account to access this page.</p>
					</div>
					<div class="flex items-center gap-3 pt-2">
						<button @click="goHome" class="px-4 py-2.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition cursor-pointer">Go Home</button>
						<NuxtLink to="/login" class="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition cursor-pointer">Sign In</NuxtLink>
					</div>
				</template>

				<!-- 404 Not Found -->
				<template v-else-if="error.statusCode === 404">
					<div class="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-center text-3xl">🔍</div>
					<div class="flex flex-col gap-1.5">
						<span class="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Error 404</span>
						<h1 class="text-2xl font-bold tracking-tight">Page Not Found</h1>
						<p class="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">The article or page you were looking for doesn't exist or has moved.</p>
					</div>
					<div class="flex items-center gap-3 pt-2">
						<button @click="goHome" class="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition cursor-pointer">Return to Home</button>
					</div>
				</template>

				<!-- Generic 500 Server Error -->
				<template v-else>
					<div class="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-900/60 flex items-center justify-center text-3xl">⚡</div>
					<div class="flex flex-col gap-1.5">
						<span class="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Error {{ error.statusCode || 500 }}</span>
						<h1 class="text-2xl font-bold tracking-tight">Something Went Wrong</h1>
						<p class="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">{{ error.message || 'An unexpected server error occurred.' }}</p>
					</div>
					<div class="flex items-center gap-3 pt-2">
						<button @click="goHome" class="px-4 py-2.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition cursor-pointer">Go Home</button>
						<button @click="reload" class="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition cursor-pointer">Reload Page</button>
					</div>
				</template>
			</div>
		</main>

		<Footer />
		<Notification />
	</div>
</template>

<script setup lang="ts">
	import type { NuxtError } from '#app'

	const { setShowToggleBtn } = useShowToggleBtn()
	setShowToggleBtn(false)

	const { error } = defineProps<{ error: NuxtError }>()
	const router = useRouter()

	function goHome() {
		clearError({ redirect: '/' })
	}

	function reload() {
		router.go(0)
	}

	const netError = computed<boolean>(() => {
		if (import.meta.server || !globalThis.navigator) return false
		return !globalThis.navigator.onLine
	})

	useHead({
		title: computed(() => (netError.value ? 'No Internet' : error.statusCode === 404 ? 'Page Not Found' : error.statusCode === 401 ? 'Restricted' : 'Error'))
	})
</script>
