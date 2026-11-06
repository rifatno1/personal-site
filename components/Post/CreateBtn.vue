<!--
  PostCreateBtn.vue
  Floating Action Button (FAB) anchored to the bottom right for authorized administrators
  to trigger article creation from anywhere on the page.
-->
<template>
	<button type="button" class="fixed bottom-8 right-8 z-40 flex items-center gap-2.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 sm:px-5 py-3 rounded-full shadow-lg shadow-indigo-600/30 hover:shadow-xl hover:shadow-indigo-600/40 transition-all duration-200 hover:scale-105 group font-semibold text-sm cursor-pointer" @click="() => emit('toggle-creating')" title="Create new article" aria-label="Create new article">
		<IconCreatePost class="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
		<span>New Article</span>
	</button>
</template>

<script setup lang="ts">
	const emit = defineEmits<{ 'toggle-creating': [] }>()
</script>
