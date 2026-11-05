<!--
  pages/index.vue
  Homepage and Main Feed:
  - Hero header with bio and quick category tags
  - Real-time client-side filter input
  - Paginated feed of articles with responsive card views
  - Empty state with filter reset action
  - Floating action button for admin article creation
-->
<template>
	<div class="flex flex-col gap-6">
		<!-- Hero Section -->
		<section class="glass-card rounded-3xl p-6 sm:p-8 flex flex-col gap-4 relative overflow-hidden">
			<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div class="flex items-center gap-3.5">
					<img
						src="/images/profile_logo.png"
						alt="Rifat Mahmud"
						class="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/30 shadow-md shrink-0"
					/>
					<div>
						<div class="flex items-center gap-2">
							<h1 class="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
								Rifat Mahmud
							</h1>
							<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/40">
								<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
								Active
							</span>
						</div>
						<p class="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
							Full Stack Web Developer & Open-Source Creator
						</p>
					</div>
				</div>

				<div class="flex items-center gap-2">
					<NuxtLink
						to="/about"
						class="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-300 transition-colors"
					>
						About Me
					</NuxtLink>
					<NuxtLink
						to="/contact"
						class="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors"
					>
						Get in Touch
					</NuxtLink>
				</div>
			</div>

			<!-- Search & Category Filters -->
			<div class="pt-2 flex flex-col gap-3">
				<!-- Search Bar -->
				<div class="relative">
					<input
						type="text"
						v-model="clientFilter"
						placeholder="Filter articles on this page by keyword..."
						class="w-full text-xs sm:text-sm rounded-xl pl-9 pr-8 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
					/>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
					<button
						v-if="clientFilter"
						@click="clientFilter = ''"
						type="button"
						class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs p-1"
					>
						✕
					</button>
				</div>

				<!-- Quick Category Pills -->
				<div v-if="sidebarData?.length" class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
					<NuxtLink
						to="/"
						class="px-3 py-1 rounded-full font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/60 shrink-0"
					>
						All Articles
					</NuxtLink>
					<NuxtLink
						v-for="s in sidebarData"
						:key="s.section"
						:to="`/posts/${encodeURIComponent(s.section)}`"
						class="px-3 py-1 rounded-full font-medium bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 shrink-0 transition-colors"
					>
						#{{ s.section }} ({{ s.posts.length }})
					</NuxtLink>
				</div>
			</div>
		</section>

		<!-- Loading State Skeletons -->
		<div v-if="pending" class="flex flex-col gap-4">
			<div v-for="i in 3" :key="i" class="p-6 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white dark:bg-zinc-900 animate-pulse flex flex-col gap-4">
				<div class="flex gap-2">
					<div class="h-5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
					<div class="h-5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
				</div>
				<div class="h-7 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
				<div class="h-20 w-full bg-zinc-100 dark:bg-zinc-800/60 rounded-xl"></div>
			</div>
		</div>

		<!-- Posts List -->
		<div v-else-if="filteredPosts.length" class="flex flex-col gap-6">
			<PostView
				v-for="d in filteredPosts"
				:key="d._id"
				:postData="d"
				@update-data="updateData"
				@delete-data="deleteData"
			/>
		</div>

		<!-- Empty State -->
		<div v-else class="text-center py-20 px-4 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 flex flex-col items-center gap-3">
			<div class="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 text-xl">
				📝
			</div>
			<div class="flex flex-col gap-1">
				<p class="text-zinc-800 dark:text-zinc-200 font-semibold">No posts found</p>
				<p class="text-xs text-zinc-400 dark:text-zinc-500">
					{{ clientFilter ? `No articles matching "${clientFilter}". Try another keyword.` : 'Check back later for new articles and technical write-ups.' }}
				</p>
			</div>
			<button
				v-if="clientFilter"
				@click="clientFilter = ''"
				type="button"
				class="mt-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
			>
				Clear Filter
			</button>
		</div>

		<!-- Pagination -->
		<div class="flex items-center justify-between pt-3" v-if="!pending && (page > 1 || data?.hasMore)">
			<button
				:disabled="page <= 1"
				@click="() => router.push({ query: { page: page - 1 === 1 ? undefined : page - 1 } })"
				class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition shadow-xs cursor-pointer"
			>
				← Previous Page
			</button>

			<span class="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">Page {{ page }}</span>

			<button
				:disabled="!data?.hasMore"
				@click="() => router.push({ query: { page: page + 1 } })"
				class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition shadow-xs cursor-pointer"
			>
				Next Page →
			</button>
		</div>
	</div>

	<!-- Admin Post Creation -->
	<PostCreate @update-data="updateData" v-if="isAdmin" />
</template>

<script setup lang="ts">
	definePageMeta({
		layout: 'advanced'
	})

	const route = useRoute()
	const router = useRouter()
	const { isAdmin } = useAuth()
	const refreshSidebar = inject<Ref<boolean>>('refreshSidebar')
	const sidebarData = inject<Ref<EachSectionType[]>>('sidebarData')
	const clientFilter = ref('')

	// Current page derived safely from route query
	const page = computed<number>(() => {
		const p = Number(route.query.page)
		if (p <= 0 || !Number.isInteger(p)) return 1
		return p
	})

	// Fetches paginated feed of articles with dynamic URL getter and string key
	const { data, pending, error, refresh } = await useFetch<{ hasMore: boolean; result: EachPostType[] }>(
		() => `/api/posts?page=${page.value}`,
		{
			key: `posts-page-${page.value}`,
			watch: [page]
		}
	)

	watchEffect(() => {
		if (error.value) showError(error.value)
	})

	// Filters posts on the current page by title, section, or content
	const filteredPosts = computed(() => {
		if (!data.value?.result) return []
		const q = clientFilter.value.trim().toLowerCase()
		if (!q) return data.value.result
		return data.value.result.filter(p =>
			p.title.toLowerCase().includes(q) ||
			p.section.toLowerCase().includes(q) ||
			p.content.toLowerCase().includes(q)
		)
	})

	// Optimistically updates local posts state when an article is modified or created
	function updateData(d: EachPostType) {
		if (pending.value || !data.value) return
		const ind = data.value.result.findIndex(el => el._id === d._id)
		if (ind === -1) data.value.result.unshift(d)
		else data.value.result[ind] = d
		if (refreshSidebar) refreshSidebar.value = true
	}

	// Removes deleted post from active feed
	function deleteData(_id: EachPostType['_id']) {
		if (pending.value || !data.value) return
		const ind = data.value.result.findIndex(el => el._id === _id)
		if (ind !== -1) data.value.result.splice(ind, 1)
		if (refreshSidebar) refreshSidebar.value = true
	}

	onMounted(() => {
		const p = Number(route.query.page)
		if (p <= 1 || !Number.isInteger(p)) {
			const q = { ...route.query }
			delete q.page
			router.replace({ path: route.path, query: q, hash: route.hash })
		}
	})

	watch(
		page,
		() => {
			useHead({
				title: page.value > 1 ? `Articles - Page ${page.value} — Rifat Mahmud` : 'Rifat Mahmud — Developer & Creator'
			})
		},
		{ immediate: true }
	)
</script>
