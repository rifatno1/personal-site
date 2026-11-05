<!--
  pages/posts/index.vue
  Canonical redirect: Navigating directly to /posts redirects seamlessly to /
-->
<script setup lang="ts">
	definePageMeta({
		middleware: [
			() => {
				return navigateTo('/')
			}
		]
	})
</script>
