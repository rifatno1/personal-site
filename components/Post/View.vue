<!--
  PostView.vue
  Article presentation component used both in feeds (summary preview mode)
  and on individual article pages (full view mode).
  Features:
  - Reading time estimation
  - Relative/formatted post date
  - Pinned and Private badges
  - Like button with real-time count
  - Share link button with clipboard confirmation
  - Admin inline Edit and Delete operations with confirmation
-->
<template>
	<article
		class="glass-card rounded-2xl p-6 sm:p-7 flex flex-col gap-4 relative group"
		:class="{ 'ring-1 ring-amber-500/30 dark:ring-amber-500/20 bg-amber-500/[0.02]': props.postData.pinned }"
	>
		<!-- Post Header Meta -->
		<header class="flex flex-col gap-2.5">
			<div class="flex items-center gap-2 flex-wrap text-xs text-zinc-500 dark:text-zinc-400">
				<!-- Section Tag -->
				<NuxtLink
					:to="`/posts/${encodeURIComponent(props.postData.section)}`"
					class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-300 transition-colors"
				>
					<span class="text-indigo-500 font-semibold">#</span>
					<span>{{ props.postData.section }}</span>
				</NuxtLink>

				<!-- Pinned Badge -->
				<span
					v-if="props.postData.pinned"
					class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60"
				>
					<span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
					Pinned
				</span>

				<!-- Private Badge -->
				<span
					v-if="props.postData.private"
					class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200/80 dark:border-purple-800/60"
				>
					Private
				</span>

				<span class="text-zinc-300 dark:text-zinc-700">•</span>

				<!-- Reading Time -->
				<span class="text-zinc-500 dark:text-zinc-400">{{ readingTime }}</span>

				<span class="text-zinc-300 dark:text-zinc-700">•</span>

				<!-- Date -->
				<time class="text-zinc-500 dark:text-zinc-400">{{ parseDate(props.postData.createdAt) }}</time>
				<span v-if="props.postData.modifiedAt" class="italic text-[11px] text-zinc-400">(edited)</span>
			</div>

			<!-- Title -->
			<h2 class="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-snug">
				<NuxtLink
					v-if="!onlyOne"
					:to="`/posts/${encodeURIComponent(props.postData.section)}/${props.postData._id}`"
					class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
				>
					{{ props.postData.title }}
				</NuxtLink>
				<span v-else>{{ props.postData.title }}</span>
			</h2>
		</header>

		<!-- Content View / Preview -->
		<div
			class="overflow-hidden transition-all duration-300"
			:class="!props.onlyOne ? 'max-h-[24rem] overflow-y-auto pr-1' : ''"
		>
			<MarkdownRederer :md="props.postData.content" />
		</div>

		<!-- Post Footer Actions -->
		<footer class="pt-4 mt-1 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between flex-wrap gap-2.5">
			<div class="flex items-center gap-2">
				<PostLike
					:disabled="props.postData.private ? true : busy"
					:likes="props.postData.likes"
					:_id="props.postData._id"
					@liking="v => (liking = v)"
				/>

				<NuxtLink
					v-if="!noView"
					:to="`/posts/${encodeURIComponent(props.postData.section)}/${props.postData._id}`"
					class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100/80 hover:bg-zinc-200/80 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 transition-colors"
					:class="busy ? 'pointer-events-none opacity-50' : ''"
				>
					<IconEye class="w-3.5 h-3.5" />
					<span>Read More</span>
				</NuxtLink>
			</div>

			<div class="flex items-center gap-1.5">
				<!-- Admin Actions -->
				<template v-if="isAdmin">
					<button
						@click="() => (editing = true)"
						:disabled="busy"
						type="button"
						class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100/80 hover:bg-zinc-200/80 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 transition-colors cursor-pointer"
					>
						<IconEdit class="w-3.5 h-3.5" />
						<span>Edit</span>
					</button>

					<button
						@click="deletePost"
						:disabled="busy"
						type="button"
						class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
					>
						<IconDelete class="w-3.5 h-3.5" />
						<span>Delete</span>
					</button>
				</template>

				<!-- Share Link -->
				<button
					@click="copyLink"
					:disabled="busy"
					type="button"
					class="inline-flex items-center justify-center w-8 h-8 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
					title="Copy article link"
					aria-label="Copy article link"
				>
					<IconShare class="w-3.5 h-3.5" />
				</button>
			</div>
		</footer>

		<!-- Admin Edit Modal -->
		<PostCreateEdit
			v-if="editing"
			type="edit"
			:post-data="props.postData"
			@toggle-create-edit="() => (editing = false)"
			@update-data="d => emit('update-data', d)"
		/>
	</article>
</template>

<script setup lang="ts">
	const props = defineProps<{ postData: EachPostType; onlyOne?: boolean; noView?: boolean }>()
	const emit = defineEmits<{ 'update-data': [EachPostType]; 'delete-data': [string] }>()

	const { isAdmin } = useAuth()
	const editing = ref(false)
	const deleting = ref(false)
	const liking = ref(false)
	const busy = computed(() => editing.value || deleting.value || liking.value)

	// Calculates human-friendly reading time based on 200 words per minute average
	const readingTime = computed(() => {
		const text = props.postData.content || ''
		const words = text.trim().split(/\s+/).filter(Boolean).length
		const minutes = Math.max(1, Math.round(words / 200))
		return `${minutes} min read`
	})

	// Formats creation timestamp to localized date string
	function parseDate(date?: number) {
		if (!date || typeof date !== 'number') return 'Unknown Time'
		try {
			const d = new Date(date)
			return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
		} catch (e) {
			return 'Unknown Time'
		}
	}

	// Deletes post with admin confirmation and user feedback toast
	async function deletePost() {
		if (!globalThis.confirm('Do you really want to delete this post?')) return
		deleting.value = true

		try {
			await $fetch('/api/post', { method: 'DELETE', body: { _id: props.postData._id } })
			setNoti('Post deleted successfully.')
			emit('delete-data', props.postData._id)
		} catch (e: any) {
			setNoti(e?.data?.message || e?.message || 'Failed to delete post.', true)
		} finally {
			deleting.value = false
		}
	}

	// Copies permalink to clipboard with toast notification
	function copyLink() {
		if (import.meta.server) return
		const link = `${window.location.origin}/posts/${encodeURIComponent(props.postData.section)}/${props.postData._id}`
		try {
			navigator.clipboard.writeText(link)
			setNoti('Link copied to clipboard!')
		} catch {
			setNoti(`Copy link: ${link}`)
		}
	}
</script>
