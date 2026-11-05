<!--
  Sidebar/index.vue
  Interactive categories tree sidebar:
  - Real-time client search filter across all categories and article titles
  - Expand/collapse section accordions with "expand all" / "collapse all" utility
  - Section post count badges
  - Active route highlighting
  - Auto-closes mobile drawer on route navigation
  - Injects and synchronizes reactive sidebarData with parent layouts
-->
<template>
	<SidebarContainer>
		<div class="h-full flex flex-col text-sm select-none">
			<!-- Sidebar Top Search & Navigation -->
			<div class="p-3.5 pb-2 flex flex-col gap-2.5 border-b border-zinc-100 dark:border-zinc-800/80">
				<!-- Search Filter -->
				<div class="relative">
					<input
						type="text"
						v-model="searchQuery"
						placeholder="Search in sidebar..."
						class="w-full text-xs rounded-xl pl-8 pr-7 py-2 bg-zinc-100/80 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-1 focus:ring-indigo-500 transition-all"
					/>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
					<button
						v-if="searchQuery"
						@click="searchQuery = ''"
						type="button"
						class="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 rounded cursor-pointer"
					>
						✕
					</button>
				</div>

				<!-- All Posts Quick Link -->
				<NuxtLink
					to="/"
					exact-active-class="bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-semibold border-indigo-200/60 dark:border-indigo-800/60"
					class="sidebar-item flex items-center justify-between px-3 py-2 rounded-xl font-medium text-xs text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60 border border-transparent transition-all"
				>
					<div class="flex items-center gap-2">
						<span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
						<span>All Articles</span>
					</div>
					<span v-if="totalPostsCount" class="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
						{{ totalPostsCount }}
					</span>
				</NuxtLink>
			</div>

			<!-- Categories List -->
			<div class="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
				<div class="flex items-center justify-between px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
					<span>Categories</span>
					<button
						v-if="filteredSections.length"
						@click="toggleAllSections"
						type="button"
						class="text-[10px] lowercase text-zinc-400 hover:text-indigo-500 font-normal cursor-pointer"
					>
						{{ showing.length === filteredSections.length ? 'collapse all' : 'expand all' }}
					</button>
				</div>

				<!-- Loading Skeleton -->
				<div v-if="pending" class="space-y-2 p-2">
					<div v-for="i in 5" :key="i" class="h-6 bg-zinc-100 dark:bg-zinc-800/60 rounded-lg animate-pulse"></div>
				</div>

				<ul v-else-if="filteredSections.length" class="flex flex-col gap-1">
					<li v-for="el in filteredSections" :key="el.section" class="flex flex-col">
						<!-- Section Accordion Header -->
						<button
							@click="() => toggleShowing(el.section)"
							type="button"
							class="sidebar-item w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl font-semibold text-xs text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-all cursor-pointer group"
						>
							<div class="flex items-center gap-2 min-w-0">
								<span class="text-zinc-400 group-hover:text-indigo-500 transition-colors">
									<IconArrowDown v-if="showing.includes(el.section)" class="w-3 h-3" />
									<IconArrowRight v-else class="w-3 h-3" />
								</span>
								<span class="truncate">{{ el.section }}</span>
							</div>

							<span class="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200">
								{{ el.posts.length }}
							</span>
						</button>

						<!-- Sub-tree of Posts -->
						<div
							v-if="showing.includes(el.section)"
							class="ml-3.5 pl-2.5 my-0.5 border-l border-zinc-200/80 dark:border-zinc-800/80 flex flex-col gap-0.5"
						>
							<NuxtLink
								:to="`/posts/${encodeURIComponent(el.section)}`"
								exact-active-class="text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/50 dark:bg-indigo-950/30"
								class="sidebar-item px-2 py-1 rounded-lg text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/40 transition-colors truncate flex items-center gap-1"
							>
								<span>Browse section</span>
								<span>→</span>
							</NuxtLink>

							<NuxtLink
								v-for="e in el.posts"
								:key="e._id"
								:to="`/posts/${encodeURIComponent(el.section)}/${e._id}`"
								exact-active-class="text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/70 dark:bg-indigo-950/50"
								class="sidebar-item px-2 py-1 rounded-lg text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors truncate"
								:title="e.title"
							>
								{{ e.title }}
							</NuxtLink>
						</div>
					</li>
				</ul>

				<!-- Empty State -->
				<div v-else class="px-2 py-8 text-xs text-center text-zinc-400 dark:text-zinc-500 flex flex-col items-center gap-1">
					<span>No categories match your search</span>
				</div>
			</div>
		</div>
	</SidebarContainer>
</template>

<script setup lang="ts">
	const { showSidebar } = useShowSidebar()
	const refreshSidebar = inject<Ref<boolean>>('refreshSidebar')
	const setSidebarData = inject<Ref<EachSectionType[]>>('sidebarData')
	const route = useRoute()

	const searchQuery = ref('')
	const showing = ref<string[]>([])

	// Fetch sections tree data lazily
	const { data, pending, error, refresh } = await useLazyFetch<EachSectionType[]>('/api/posts/sections')

	watchEffect(() => {
		if (error.value) showError(error.value)
	})

	// Total count across all categories
	const totalPostsCount = computed(() => {
		if (!data.value) return 0
		return data.value.reduce((acc, curr) => acc + (curr.posts?.length || 0), 0)
	})

	// Filters sections and their nested articles based on the search input
	const filteredSections = computed(() => {
		if (!data.value) return []
		const q = searchQuery.value.trim().toLowerCase()
		if (!q) return data.value

		return data.value
			.map(sec => {
				const matchSec = sec.section.toLowerCase().includes(q)
				const matchPosts = sec.posts.filter(p => p.title.toLowerCase().includes(q))
				if (matchSec || matchPosts.length) {
					return {
						section: sec.section,
						posts: matchPosts.length ? matchPosts : sec.posts
					}
				}
				return null
			})
			.filter(Boolean) as EachSectionType[]
	})

	// Toggles individual category accordion
	function toggleShowing(section: string) {
		const ind = showing.value.indexOf(section)
		if (ind >= 0) showing.value.splice(ind, 1)
		else showing.value.push(section)
	}

	// Expands or collapses all categories at once
	function toggleAllSections() {
		if (!filteredSections.value.length) return
		if (showing.value.length === filteredSections.value.length) {
			showing.value = []
		} else {
			showing.value = filteredSections.value.map(s => s.section)
		}
	}

	// Auto-closes mobile drawer on route navigation
	watch(
		() => route.fullPath,
		() => {
			showSidebar.value = false
		}
	)

	// Refreshes sidebar whenever an article is created, edited, or deleted
	watch(
		() => refreshSidebar?.value,
		val => {
			if (!val) return
			if (!pending.value) refresh()
			if (refreshSidebar) refreshSidebar.value = false
		}
	)

	// Auto-expands active section and shares sidebar data with layouts
	watch(
		[pending, () => route.params.section],
		() => {
			if (!pending.value && data.value) {
				const rawSection = Array.isArray(route.params.section) ? route.params.section[0] : route.params.section
				const currentSection = rawSection ? decodeURIComponent(rawSection) : ''
				if (currentSection && !showing.value.includes(currentSection)) {
					showing.value.push(currentSection)
				}
				if (setSidebarData) setSidebarData.value = data.value
			}
		},
		{ immediate: true }
	)
</script>
