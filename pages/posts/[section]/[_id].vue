<!--
  pages/posts/[section]/[_id].vue
  Single Article View page:
  - Scroll reading progress bar at top of viewport
  - Breadcrumbs navigation
  - Skeleton loading state
  - Full article view via PostView component
  - Error/Not-found recovery actions
  - Dynamic page title via useHead
  - Admin modal for new articles
-->
<template>
	<div class="flex flex-col gap-6 relative">
		<!-- Scroll Reading Progress Bar -->
		<div class="fixed top-0 left-0 right-0 h-1 bg-indigo-600 z-[100] transition-all duration-100 ease-out origin-left pointer-events-none" :style="{ width: `${scrollProgress}%` }"></div>

		<!-- Breadcrumbs Navigation -->
		<nav class="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap" aria-label="Breadcrumb">
			<NuxtLink to="/" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">All Articles</NuxtLink>
			<span class="text-zinc-300 dark:text-zinc-700">/</span>
			<NuxtLink :to="`/posts/${encodeURIComponent(section)}`" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">#{{ section }}</NuxtLink>
			<span class="text-zinc-300 dark:text-zinc-700">/</span>
			<span class="text-zinc-800 dark:text-zinc-200 truncate font-semibold max-w-[18rem]">{{ data?.title || 'Article' }}</span>
		</nav>

		<!-- Skeleton Loader -->
		<div v-if="pending" class="glass-card p-8 rounded-3xl animate-pulse flex flex-col gap-6">
			<div class="flex gap-2">
				<div class="h-6 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
				<div class="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
			</div>
			<div class="h-10 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-2xl"></div>
			<div class="space-y-3 pt-4">
				<div class="h-4 bg-zinc-100 dark:bg-zinc-800/60 rounded"></div>
				<div class="h-4 bg-zinc-100 dark:bg-zinc-800/60 rounded w-5/6"></div>
				<div class="h-4 bg-zinc-100 dark:bg-zinc-800/60 rounded w-4/6"></div>
			</div>
		</div>

		<!-- Single Article View -->
		<PostView v-else-if="data" :post-data="data" @update-data="updatePostData" @delete-data="deletePostData" :only-one="true" :no-view="true" />

		<!-- Not Found State -->
		<div v-else class="text-center py-20 px-4 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 flex flex-col items-center gap-3">
			<p class="text-zinc-800 dark:text-zinc-200 font-semibold">Article not found</p>
			<p class="text-xs text-zinc-400 dark:text-zinc-500">The article you requested could not be located or may have been deleted.</p>
			<NuxtLink to="/" class="mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white">Return to all articles</NuxtLink>
		</div>

		<!-- Admin Create Modal -->
		<PostCreate
			@update-data="
				() => {
					if (refreshSidebar) refreshSidebar.value = true
				}
			"
			v-if="isAdmin" />
	</div>
</template>

<script setup lang="ts">
	definePageMeta({
		layout: 'advanced',
		key: route => route.fullPath,
		middleware: [
			to => {
				const id = Array.isArray(to.params._id) ? to.params._id[0] : to.params._id
				if (!id || id.length !== 24) return abortNavigation({ statusCode: 404 })
			}
		]
	})

	const { isAdmin } = useAuth()
	const refreshSidebar = inject<Ref<boolean>>('refreshSidebar')
	const sidebarData = inject<Ref<EachSectionType[]>>('sidebarData')
	const route = useRoute()
	const router = useRouter()
	const scrollProgress = ref(0)

	// Normalized MongoDB ObjectId
	const id = computed(() => {
		const raw = Array.isArray(route.params._id) ? route.params._id[0] : route.params._id
		return raw || ''
	})

	// Normalized category name
	const section = computed(() => {
		const raw = Array.isArray(route.params.section) ? route.params.section[0] : route.params.section
		return raw ? decodeURIComponent(raw) : ''
	})

	// Fetches article details by ID and section with explicit string key
	const { data, pending, error, refresh } = await useFetch<EachPostType>(() => `/api/post?_id=${id.value}&section=${encodeURIComponent(section.value)}`, {
		key: `post-${id.value}`
	})

	function updatePostData(d: EachPostType) {
		if (d.section === section.value && d._id === id.value) {
			data.value = d
		} else {
			router.push(`/posts/${encodeURIComponent(d.section)}/${d._id}`)
		}
		if (refreshSidebar) refreshSidebar.value = true
	}

	function deletePostData() {
		if (refreshSidebar) refreshSidebar.value = true
		router.push('/')
	}

	// Tracks reading progress through the document
	function updateScroll() {
		if (import.meta.server) return
		const scrollTop = window.scrollY || document.documentElement.scrollTop
		const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
		scrollProgress.value = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
	}

	onMounted(() => {
		window.addEventListener('scroll', updateScroll, { passive: true })
	})

	onBeforeUnmount(() => {
		window.removeEventListener('scroll', updateScroll)
	})

	useHead({
		title: computed(() => (data.value?.title ? `${data.value.title} — Rifat Mahmud` : 'Article — Rifat Mahmud'))
	})
</script>
