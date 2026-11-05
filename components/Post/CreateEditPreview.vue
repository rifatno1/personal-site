<!--
  PostCreateEditPreview.vue
  Renders live markdown preview of an article before publishing or saving edits.
-->
<template>
	<div class="w-full max-h-[90vh] overflow-y-auto max-w-3xl p-6 sm:p-8 bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800/90 rounded-3xl shadow-2xl flex flex-col gap-5 text-zinc-900 dark:text-zinc-100">
		<div class="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
			<div class="flex items-center gap-2">
				<span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40">
					Live Preview
				</span>
				<span class="text-xs text-zinc-400 font-mono">#{{ props.postData.section || 'uncategorized' }}</span>
			</div>
			<button
				type="button"
				class="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
				@click="emit('toggle-previewing')"
				aria-label="Close preview"
			>
				<IconClose class="w-4 h-4" />
			</button>
		</div>

		<div>
			<h2 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{{ props.postData.title || 'Untitled Post' }}</h2>
			<div class="flex gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">
				<span>{{ props.postData.private ? 'Private' : 'Public' }}</span>
				<span v-if="props.postData.pinned">• Pinned</span>
				<span>• {{ parseDate(props.postData.createdAt) }}</span>
			</div>
		</div>

		<div class="p-5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800/70 max-h-[25rem] overflow-y-auto">
			<MarkdownRederer :md="props.postData.content || '*No content provided*'" />
		</div>

		<div class="flex justify-end pt-3 border-t border-zinc-100 dark:border-zinc-800">
			<button
				type="button"
				class="px-5 py-2.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm transition cursor-pointer"
				@click="emit('toggle-previewing')"
			>
				Back to Editor
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
	const emit = defineEmits<{ 'toggle-previewing': [] }>()
	const props = defineProps<{
		postData: EachPostPreviewType
	}>()

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
</script>
