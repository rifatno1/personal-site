<!--
  PostCreateEdit.vue
  Comprehensive modal dialog for creating new articles or editing existing ones:
  - Form validation for title, category, pin, private, and markdown content
  - Quick-formatting toolbar (Bold, Italic, Code, Block, Quote, List)
  - Keyboard shortcuts (Ctrl+B, Ctrl+I, Ctrl+L, Tab indentation support)
  - Live preview toggle
  - Integrated Imgur image uploader
  - Safe error handling that preserves user edits
-->
<template>
	<PostDisableScroll>
		<div class="fixed inset-0 top-[var(--nav-height)] w-full h-[var(--main-con-height)] bg-zinc-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
			<PostCreateEditPreview v-if="previewing" @toggle-previewing="() => (previewing = !previewing)" :post-data="postData" />
			<PostUploadImage v-else-if="uploading_image" @toggle-uploading-image="uploading_image = !uploading_image" />

			<form
				v-else
				class="w-full max-h-[92vh] overflow-y-auto max-w-3xl p-6 sm:p-8 bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800/90 rounded-3xl shadow-2xl flex flex-col gap-5 text-zinc-900 dark:text-zinc-100"
				@submit.prevent="submit"
			>
				<!-- Modal Header -->
				<div class="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
					<div class="flex items-center gap-2">
						<span class="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
						<h2 class="text-xl font-bold tracking-tight">
							{{ props.type === 'create' ? 'Create New Article' : 'Edit Article' }}
						</h2>
					</div>
					<button
						type="button"
						class="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
						@click="() => emit('toggle-create-edit')"
						aria-label="Close dialog"
					>
						<IconClose class="w-4 h-4" />
					</button>
				</div>

				<!-- Form Inputs -->
				<div class="flex flex-col gap-4">
					<!-- Title -->
					<div class="flex flex-col gap-1.5">
						<label for="title" class="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Title</label>
						<input
							type="text"
							id="title"
							placeholder="e.g. Building High-Performance Nuxt 4 Applications"
							class="w-full rounded-xl px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
							required
							v-model="postData.title"
							:disabled="sending"
						/>
					</div>

					<!-- Section / Category -->
					<div class="flex flex-col gap-1.5">
						<label for="section" class="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Section / Category</label>
						<input
							type="text"
							id="section"
							placeholder="e.g. Web Development, Tutorials, Projects"
							class="w-full rounded-xl px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
							required
							v-model="postData.section"
							:disabled="sending"
							list="list_section"
						/>
						<datalist v-if="sidebarData?.length" id="list_section">
							<option :value="d" v-for="d in sidebarData.map(el => el.section)">{{ d }}</option>
						</datalist>
					</div>

					<!-- Options: Pin & Private -->
					<div class="flex items-center gap-6 py-1">
						<label class="flex items-center gap-2 cursor-pointer select-none">
							<input
								type="checkbox"
								id="pinned"
								v-model="postData.pinned"
								class="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
							/>
							<span class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Pin to top</span>
						</label>

						<label class="flex items-center gap-2 cursor-pointer select-none">
							<input
								type="checkbox"
								id="private"
								v-model="postData.private"
								class="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
							/>
							<span class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Private article (only visible to admin)</span>
						</label>
					</div>

					<!-- Content with Quick Markdown Toolbar -->
					<div class="flex flex-col gap-2">
						<div class="flex items-center justify-between flex-wrap gap-2">
							<label for="post" class="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Content (Markdown)</label>

							<!-- Formatting Toolbar -->
							<div class="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-lg text-xs">
								<button type="button" @click="insertFormatting('**', '**')" class="px-2 py-0.5 rounded hover:bg-white dark:hover:bg-zinc-700 font-bold" title="Bold (Ctrl+B)">B</button>
								<button type="button" @click="insertFormatting('*', '*')" class="px-2 py-0.5 rounded hover:bg-white dark:hover:bg-zinc-700 italic" title="Italic (Ctrl+I)">I</button>
								<button type="button" @click="insertFormatting('`', '`')" class="px-2 py-0.5 rounded hover:bg-white dark:hover:bg-zinc-700 font-mono" title="Inline Code">&lt;/&gt;</button>
								<button type="button" @click="insertFormatting('\n```ts\n', '\n```\n')" class="px-2 py-0.5 rounded hover:bg-white dark:hover:bg-zinc-700 font-mono text-[10px]" title="Code Block">Block</button>
								<button type="button" @click="insertFormatting('> ', '')" class="px-2 py-0.5 rounded hover:bg-white dark:hover:bg-zinc-700" title="Quote">""</button>
								<button type="button" @click="insertFormatting('- ', '')" class="px-2 py-0.5 rounded hover:bg-white dark:hover:bg-zinc-700" title="List">• List</button>
							</div>
						</div>

						<textarea
							id="post"
							ref="textareaRef"
							class="w-full min-h-[16rem] rounded-2xl p-4 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition leading-relaxed resize-y"
							placeholder="Write your article using Markdown..."
							required
							v-model="postData.content"
							:disabled="sending"
							@keydown="keydownHandler"
						></textarea>
					</div>
				</div>

				<!-- Footer Controls -->
				<div class="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex-wrap gap-3">
					<button
						type="button"
						class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 inline-flex items-center gap-1.5 cursor-pointer"
						:disabled="sending"
						@click="uploading_image = !uploading_image"
					>
						<span>📷</span>
						<span>Upload image via Imgur</span>
					</button>

					<div class="flex items-center gap-2">
						<button
							type="button"
							class="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 transition-colors cursor-pointer"
							:disabled="sending"
							@click="() => (previewing = !previewing)"
						>
							Preview
						</button>
						<button
							type="button"
							class="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
							:disabled="sending"
							@click="() => emit('toggle-create-edit')"
						>
							Cancel
						</button>
						<button
							type="submit"
							class="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 cursor-pointer"
							:disabled="sending"
						>
							{{ sending ? 'Saving...' : props.type === 'create' ? 'Publish Article' : 'Save Changes' }}
						</button>
					</div>
				</div>
			</form>
		</div>
	</PostDisableScroll>
</template>

<script setup lang="ts">
	const emit = defineEmits<{ 'toggle-create-edit': []; 'update-data': [EachPostType] }>()
	const props = defineProps<{ type: 'create' | 'edit'; postData?: EachPostType }>()
	const sidebarData = inject<Ref<EachSectionType[]>>('sidebarData')

	const previewing = ref(false)
	const uploading_image = ref(false)
	const textareaRef = ref<HTMLTextAreaElement | null>(null)

	// State for the article being created or edited
	const postData = ref<EachPostPreviewType>({
		title: props.type === 'edit' ? props.postData!.title : '',
		section: props.type === 'edit' ? props.postData!.section : '',
		content: props.type === 'edit' ? props.postData!.content : '',
		createdAt: props.type === 'edit' ? props.postData!.createdAt : Date.now(),
		modifiedAt: props.type === 'edit' ? Date.now() : undefined,
		private: props.type === 'edit' ? props.postData!.private || false : false,
		pinned: props.type === 'edit' ? props.postData!.pinned || false : false
	})

	const sending = ref(false)

	/**
	 * Inserts markdown prefix and optional suffix around current textarea selection
	 */
	function insertFormatting(prefix: string, suffix: string = '') {
		const ele = textareaRef.value
		if (!ele) return
		const start = ele.selectionStart
		const end = ele.selectionEnd
		const selection = ele.value.substring(start, end)
		postData.value.content = ele.value.substring(0, start) + prefix + selection + suffix + ele.value.substring(end)
		nextTick(() => {
			ele.focus()
			ele.selectionStart = start + prefix.length
			ele.selectionEnd = end + prefix.length
		})
	}

	/**
	 * Submits article create/update request to /api/post with error resilience
	 */
	async function submit() {
		sending.value = true
		try {
			const got = await $fetch('/api/post', {
				method: 'POST',
				responseType: 'json',
				body: {
					title: postData.value.title,
					section: postData.value.section,
					content: postData.value.content,
					private: postData.value.private || undefined,
					pinned: postData.value.pinned || undefined,
					_id: props.postData?._id || undefined
				}
			})
			emit('update-data', got as EachPostType)
			setNoti(props.postData?._id ? 'Article updated successfully!' : 'Article published successfully!')
			emit('toggle-create-edit')
		} catch (e: any) {
			setNoti(e?.data?.message || e?.message || 'Failed to save article.', true)
		} finally {
			sending.value = false
		}
	}

	/**
	 * Handles Tab key indentation and keyboard shortcuts (Ctrl+B, Ctrl+I, Ctrl+L)
	 */
	async function keydownHandler(e: KeyboardEvent) {
		if (e.code === 'Tab') {
			e.preventDefault()
			const ele = e.target as HTMLTextAreaElement
			const start = ele.selectionStart
			const end = ele.selectionEnd
			postData.value.content = ele.value.substring(0, start) + '\t' + ele.value.substring(start, end).split('\n').join('\n\t') + ele.value.substring(end)
			await nextTick()
			ele.selectionStart = ele.selectionEnd = start + 1
		} else if (e.ctrlKey && e.code === 'KeyB') {
			e.preventDefault()
			insertFormatting('**', '**')
		} else if (e.ctrlKey && e.code === 'KeyI') {
			e.preventDefault()
			insertFormatting('*', '*')
		} else if (e.ctrlKey && e.code === 'KeyL') {
			e.preventDefault()
			const ele = e.target as HTMLTextAreaElement
			const start = ele.selectionStart
			const end = ele.selectionEnd
			const content = ele.value.substring(start, end)
			let isUrl = content.startsWith('/') || content.startsWith('#')
			if (!isUrl) {
				try {
					new URL(content)
					isUrl = true
				} catch {
					isUrl = false
				}
			}
			postData.value.content = ele.value.substring(0, start) + (isUrl ? `[](${content})` : `[${content}]()`) + ele.value.substring(end)
			await nextTick()
			if (start !== end && !isUrl) ele.selectionStart = ele.selectionEnd = content.length + start + 3
			else ele.selectionStart = ele.selectionEnd = start + 1
		}
	}
</script>
