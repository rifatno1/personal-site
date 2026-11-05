<!--
  MarkdownRederer.vue
  High-performance markdown renderer built on markdown-it:
  - Formatted typography matching Tailwind prose dark/light theme
  - Auto-linkification of bare URLs with target="_blank" and rel="noopener noreferrer"
  - Interactive "Copy" button attached dynamically to code blocks with visual clipboard confirmation
-->
<template>
	<div
		ref="contentContainer"
		v-html="html"
		class="markdown-content prose prose-zinc dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-zinc-900 dark:prose-headings:text-zinc-50 prose-a:font-medium prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline prose-code:rounded-md prose-code:px-1.5 prose-code:py-0.5 prose-code:text-xs sm:prose-code:text-sm prose-code:font-mono prose-code:bg-zinc-100 dark:prose-code:bg-zinc-800/80 prose-code:border prose-code:border-zinc-200/80 dark:prose-code:border-zinc-700/60 prose-code:before:content-none prose-code:after:content-none prose-pre:bg-zinc-950 dark:prose-pre:bg-zinc-900/90 prose-pre:border prose-pre:border-zinc-800/80 prose-pre:rounded-2xl prose-pre:p-4 prose-img:rounded-2xl prose-img:border prose-img:border-zinc-200/80 dark:prose-img:border-zinc-800/80 prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-50/40 dark:prose-blockquote:bg-indigo-950/20 prose-blockquote:p-4 prose-blockquote:rounded-r-xl prose-blockquote:not-italic"
		@click="handleContentClick"
	></div>
</template>

<style>
	.markdown-content pre {
		position: relative;
	}
	.markdown-content pre code {
		border: none !important;
		background: transparent !important;
		padding: 0 !important;
		font-size: 0.825rem;
		line-height: 1.6;
	}
	.code-copy-btn {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		padding: 0.25rem 0.5rem;
		font-size: 0.7rem;
		font-weight: 500;
		border-radius: 0.5rem;
		background-color: rgba(39, 39, 42, 0.8);
		color: #e4e4e7;
		border: 1px solid rgba(82, 82, 91, 0.5);
		cursor: pointer;
		opacity: 0;
		transition: all 0.2s ease;
	}
	.markdown-content pre:hover .code-copy-btn {
		opacity: 1;
	}
	.code-copy-btn:hover {
		background-color: rgba(63, 63, 70, 0.9);
		color: #ffffff;
	}
</style>

<script setup lang="ts">
	import markdownit from 'markdown-it'

	const mdIt = markdownit({
		html: true,
		breaks: true,
		linkify: true,
		typographer: true
	})

	// Rewrites external hyperlinks to open securely in new tabs
	mdIt.renderer.rules.link_open = function (tokens, idx, options, env, self) {
		const hrefIndex = tokens[idx].attrIndex('href')
		if (hrefIndex >= 0) {
			const href = tokens[idx].attrs?.[hrefIndex][1]
			if (href && !href.startsWith('/') && !href.startsWith('#')) {
				const targetIndex = tokens[idx].attrIndex('target')
				if (targetIndex < 0) tokens[idx].attrPush(['target', '_blank'])
				const relIndex = tokens[idx].attrIndex('rel')
				if (relIndex < 0) tokens[idx].attrPush(['rel', 'noopener noreferrer'])
			}
		}

		return self.renderToken(tokens, idx, options)
	}

	const props = defineProps<{ md: string }>()
	const { md } = toRefs(props)
	const html = computed(() => mdIt.render(md.value || ''))
	const contentContainer = ref<HTMLElement | null>(null)

	/**
	 * Mounts a "Copy" button inside every <pre> block for code copying
	 */
	function attachCopyButtons() {
		if (import.meta.server || !contentContainer.value) return
		const preBlocks = contentContainer.value.querySelectorAll('pre')
		preBlocks.forEach(pre => {
			if (pre.querySelector('.code-copy-btn')) return
			const btn = document.createElement('button')
			btn.type = 'button'
			btn.className = 'code-copy-btn'
			btn.textContent = 'Copy'
			btn.setAttribute('aria-label', 'Copy code to clipboard')
			pre.appendChild(btn)
		})
	}

	/**
	 * Event delegation handler for code snippet copy buttons
	 */
	function handleContentClick(e: MouseEvent) {
		const target = e.target as HTMLElement
		if (target && target.classList.contains('code-copy-btn')) {
			const pre = target.closest('pre')
			const code = pre?.querySelector('code')?.textContent || pre?.textContent || ''
			const cleanCode = code.replace(/Copy$/, '').trim()
			try {
				navigator.clipboard.writeText(cleanCode)
				target.textContent = 'Copied!'
				target.style.color = '#34d399'
				setTimeout(() => {
					target.textContent = 'Copy'
					target.style.color = ''
				}, 2000)
			} catch (err) {
				target.textContent = 'Failed'
			}
		}
	}

	onMounted(() => {
		attachCopyButtons()
	})

	watch(html, () => {
		nextTick(attachCopyButtons)
	})
</script>
