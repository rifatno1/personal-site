<!--
  PostLike.vue
  Like counter button with animated heart pop feedback.
  Sends like/unlike requests to /api/post/like and updates counts reactively.
-->
<template>
	<button
		type="button"
		class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer border select-none disabled:cursor-not-allowed group active:scale-95"
		:class="
			liked
				? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200/80 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 shadow-xs'
				: 'bg-zinc-100/80 hover:bg-zinc-200/80 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 border-transparent text-zinc-600 dark:text-zinc-300'
		"
		@click="like"
		:disabled="busy || disabled"
		:title="liked ? 'Unlike this post' : 'Like this post'"
		aria-label="Like post"
	>
		<IconLoading v-if="busy" class="w-3.5 h-3.5" />
		<span v-else :class="{ 'animate-heart-pop': justLiked }">
			<IconHeart v-if="liked" class="w-3.5 h-3.5 text-rose-500 fill-current" />
			<IconHeartEmpty v-else class="w-3.5 h-3.5 group-hover:text-rose-500 transition-colors" />
		</span>
		<span>Like</span>
		<span
			class="px-1.5 py-0.2 rounded-md text-[11px] font-bold"
			:class="liked ? 'bg-rose-100/80 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300' : 'bg-zinc-200/70 dark:bg-zinc-700/70 text-zinc-700 dark:text-zinc-300'"
		>
			{{ likes }}
		</span>
	</button>
</template>

<script setup lang="ts">
	const props = defineProps<{ likes: number; _id: string; disabled?: boolean }>()
	const emit = defineEmits<{ liking: [boolean] }>()
	const likes = ref(props.likes)
	const liked = ref(false)
	const busy = ref(false)
	const justLiked = ref(false)

	// Submits like or unlike action to server
	async function like() {
		try {
			busy.value = true
			const type: 'add' | 'rem' = liked.value ? 'rem' : 'add'
			await $fetch('/api/post/like', { method: 'POST', body: { _id: props._id, type } })
			liked.value = !liked.value
			if (liked.value) {
				likes.value++
				justLiked.value = true
				setTimeout(() => {
					justLiked.value = false
				}, 600)
			} else {
				likes.value--
			}
		} catch (e: any) {
			setNoti(e?.data?.message || 'Unable to update like right now.', true)
		} finally {
			busy.value = false
		}
	}

	watch(busy, () => emit('liking', busy.value))
</script>
