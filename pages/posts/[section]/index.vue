<!--
  pages/posts/[section]/index.vue
  Category Archive page:
  - Header banner displaying category title and article count
  - Paginated list of articles in this section
  - Empty state with redirect to all articles
  - Floating action button for admin article creation
-->
<template>
	<div class="flex flex-col gap-6">
		<!-- Category Header Banner -->
		<div class="glass-card rounded-3xl p-6 sm:p-7 flex flex-col gap-4">
			<div class="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
				<NuxtLink to="/" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 font-medium">
					<span>←</span>
					<span>All Articles</span>
				</NuxtLink>
				<span class="text-zinc-300 dark:text-zinc-700">/</span>
				<span class="text-zinc-800 dark:text-zinc-200 font-medium">Category</span>
			</div>

			<div class="flex items-center justify-between flex-wrap gap-4">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg">
						#
					</div>
					<div>
						<h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
							{{ section }}
						</h1>
						<p class="text-xs text-zinc-500 dark:text-zinc-400">
							Articles, tutorials, and notes in this category
						</p>
					</div>
				</div>

				<span v-if="data?.result" class="px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
					{{ data.result.length }} {{ data.result.length === 1 ? 'article' : 'articles' }}
				</span>
			</div>
		</div>

		<!-- Skeleton Loader -->
		<div v-if="pending" class="flex flex-col gap-4">
			<div v-for="i in 3" :key="i" class="p-6 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white dark:bg-zinc-900 animate-pulse flex flex-col gap-4">
				<div class="flex gap-2">
					<div class="h-5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
					<div class="h-5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
				</div>
				<div class="h-7 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
				<div class="h-16 w-full bg-zinc-100 dark:bg-zinc-800/60 rounded-xl"></div>
			</div>
		</div>

		<!-- Posts List -->
		<div v-else-if="data?.result?.length" class="flex flex-col gap-6">
			<PostView
				v-for="d in data.result"
				:key="d._id"
				:postData="d"
				@update-data="updateData"
				@delete-data="deleteData"
			/>
		</div>

		<!-- Empty State -->
		<div v-else class="text-center py-20 px-4 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 flex flex-col items-center gap-3">
			<p class="text-zinc-800 dark:text-zinc-200 font-semibold">No posts in #{{ section }}</p>
			<p class="text-xs text-zinc-400 dark:text-zinc-500">Check back later or explore other sections in the sidebar.</p>
			<NuxtLink to="/" class="mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white">
				Return to all posts
			</NuxtLink>
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
		layout: 'advanced',
		key: route => route.fullPath
	})

	const route = useRoute()
	const router = useRouter()
	const { isAdmin } = useAuth()
	const refreshSidebar = inject<Ref<boolean>>('refreshSidebar')

	// Normalizes section name with URL decoding
	const section = computed(() => {
		const raw = Array.isArray(route.params.section) ? route.params.section[0] : route.params.section
		return raw ? decodeURIComponent(raw) : ''
	})

	// Current page query
	const page = computed<number>(() => {
		const p = Number(route.query.page)
		if (p <= 0 || !Number.isInteger(p)) return 1
		return p
	})

	// Fetches category articles with dynamic URL getter and string key
	const { data, pending, error, refresh } = await useFetch<{ hasMore: boolean; result: EachPostType[] }>(
		() => `/api/posts?section=${encodeURIComponent(section.value)}&page=${page.value}`,
		{
			key: `posts-section-${section.value}-page-${page.value}`,
			watch: [section, page]
		}
	)

	function updateData(d: EachPostType) {
		if (pending.value || !data.value) return
		const ind = data.value.result.findIndex(el => el._id === d._id)
		if (d.section === section.value) {
			if (ind === -1) data.value.result.unshift(d)
			else data.value.result[ind] = d
		} else if (ind !== -1) {
			data.value.result.splice(ind, 1)
		}
		if (refreshSidebar) refreshSidebar.value = true
	}

	function deleteData(_id: EachPostType['_id']) {
		if (pending.value || !data.value) return
		const ind = data.value.result.findIndex(el => el._id === _id)
		if (ind !== -1) data.value.result.splice(ind, 1)
		if (refreshSidebar) refreshSidebar.value = true
		if (!data.value.result.length) router.push('/')
	}

	watch(
		[section, page],
		() => {
			useHead({
				title: `#${section.value} (Page ${page.value}) — Rifat Mahmud`
			})
		},
		{ immediate: true }
	)
</script>
