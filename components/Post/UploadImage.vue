<!--
  PostUploadImage.vue
  Imgur Image Uploader modal:
  - Drag-and-drop file upload zone
  - Client-side size (< 2MB) and MIME type validation
  - Real-time image preview
  - Uploads to /api/imgur securely
  - Returns markdown-ready embed code with quick copy button
-->
<template>
	<form class="w-full max-h-[90vh] overflow-y-auto max-w-lg p-6 sm:p-8 bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800/90 rounded-3xl shadow-2xl flex flex-col gap-5 text-zinc-900 dark:text-zinc-100" @submit.prevent="send">
		<!-- Header -->
		<div class="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
			<div class="flex items-center gap-2">
				<span class="text-lg">📷</span>
				<h2 class="font-bold text-lg">Upload Image (Imgur)</h2>
			</div>
			<button type="button" class="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer" @click="() => emit('toggle-uploading-image')" aria-label="Close image uploader">
				<IconClose class="w-4 h-4" />
			</button>
		</div>

		<!-- File selection / Drag and Drop -->
		<div v-if="!link" class="flex flex-col gap-3">
			<div class="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer bg-zinc-50 dark:bg-zinc-900/50" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
				<input ref="fileInputRef" type="file" accept="image/jpeg,image/jpg,image/gif,image/png,image/apng,image/webp" class="hidden" @change="handleImage" :disabled="sending" />

				<div v-if="previewSrc" class="relative group">
					<img :src="previewSrc" alt="Preview" class="max-h-40 rounded-xl object-contain shadow-md" />
					<p class="text-xs text-zinc-500 mt-2">Click to choose a different image</p>
				</div>
				<template v-else>
					<span class="text-3xl">🖼️</span>
					<div>
						<p class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Click to browse or drag & drop</p>
						<p class="text-[11px] text-zinc-400 mt-0.5">JPEG, PNG, GIF, WebP (Max 2MB)</p>
					</div>
				</template>
			</div>
		</div>

		<!-- Upload Result -->
		<div v-else class="flex flex-col gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
			<p class="text-xs font-semibold text-emerald-800 dark:text-emerald-300">✓ Image uploaded successfully!</p>
			<div class="flex items-center gap-2">
				<input type="text" readonly :value="link" class="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono select-all" />
				<button type="button" class="shrink-0 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer" @click="copyLink">Copy</button>
			</div>
			<p class="text-[11px] text-zinc-500">
				Insert markdown:
				<code class="font-mono bg-zinc-200/60 dark:bg-zinc-800 px-1 py-0.5 rounded">![Image description]({{ link }})</code>
			</p>
		</div>

		<!-- Actions -->
		<div class="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
			<button type="button" class="px-4 py-2 rounded-xl text-xs font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer" :disabled="sending" @click="() => emit('toggle-uploading-image')">Close</button>
			<button v-if="!link" type="submit" class="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition disabled:opacity-50 cursor-pointer" :disabled="sending || !imageFile">
				{{ sending ? 'Uploading...' : 'Upload Image' }}
			</button>
		</div>
	</form>
</template>

<script setup lang="ts">
	const emit = defineEmits<{ 'toggle-uploading-image': [] }>()
	const imageTypes = ['image/jpeg', 'image/jpg', 'image/gif', 'image/png', 'image/apng', 'image/webp']
	const imageFile = ref<File | null>(null)
	const previewSrc = ref<string | null>(null)
	const fileInputRef = ref<HTMLInputElement | null>(null)
	const sending = ref(false)
	const link = ref('')

	// Opens the hidden file input dialog
	function triggerFileInput() {
		fileInputRef.value?.click()
	}

	// Validates image MIME type and file size (< 2MB)
	function validateAndSetFile(file: File) {
		if (!imageTypes.includes(file.type)) {
			setNoti('Unsupported file type. Please select a JPEG, PNG, GIF, or WebP image.', true)
			return
		}
		if (file.size > 2 * 1024 * 1024) {
			setNoti('File is larger than 2MB limit.', true)
			return
		}
		imageFile.value = file
		previewSrc.value = URL.createObjectURL(file)
	}

	function handleImage(e: Event) {
		const files = (e.target as HTMLInputElement).files
		if (!files?.length) return
		validateAndSetFile(files[0])
	}

	function handleDrop(e: DragEvent) {
		const files = e.dataTransfer?.files
		if (!files?.length) return
		validateAndSetFile(files[0])
	}

	function copyLink() {
		try {
			navigator.clipboard.writeText(link.value)
			setNoti('Image link copied to clipboard!')
		} catch {
			setNoti(`Copy link: ${link.value}`)
		}
	}

	// Sends multipart form data to server /api/imgur endpoint
	async function send() {
		if (!imageFile.value) {
			setNoti('Please select an image file first.', true)
			return
		}
		sending.value = true
		try {
			const formData = new FormData()
			formData.append('image', imageFile.value)

			const got: { status: string; link?: string } | undefined = await $fetch('/api/imgur', {
				method: 'POST',
				body: formData,
				responseType: 'json'
			})

			if (got?.status === 'success' && got.link) {
				link.value = got.link
				setNoti('Image uploaded to Imgur successfully!')
			} else {
				setNoti(`Upload failed: ${got?.status || 'Unknown error'}`, true)
			}
		} catch (e: any) {
			setNoti('Failed to upload image. Please try again.', true)
		} finally {
			sending.value = false
		}
	}
</script>
