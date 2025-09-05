<template>
	<div class="background" :style="parallaxStyle"></div>
</template>

<script setup>
import {ref, computed, onMounted, onBeforeUnmount} from 'vue';

const scrollTop = ref(0);
const pageHeight = ref(0);

function updateMetrics() {
	// Пытаемся измерять контент по .app; если нет .app — используем прежние измерения
	const contentEl = document.querySelector('.app');
	const viewportH = window.innerHeight;
	if (contentEl) {
		pageHeight.value = Math.max(0, contentEl.scrollHeight - viewportH);
	} else {
		const doc = document.scrollingElement || document.documentElement;
		pageHeight.value = Math.max(
			doc.scrollHeight,
			doc.clientHeight
		) - viewportH;
	}
}

function updateScrollTop() {
	const doc = document.scrollingElement || document.documentElement;
	scrollTop.value = window.scrollY ?? doc.scrollTop ?? document.body.scrollTop ?? 0;
}

const scrollPercent = computed(() => {
	if (pageHeight.value <= 0) return 0;
	return Math.min(100, Math.max(0, (scrollTop.value / pageHeight.value) * 100));
});

const parallaxStyle = computed(() => {
	const blur = Math.min(scrollPercent.value / 20, 3)
	return {
		backgroundPosition: `center ${scrollPercent.value}%`,
		filter: `blur(${blur}px)`
	};
});

function onScroll() {
	updateScrollTop();
}

function onResize() {
	updateMetrics();
}

const initTime = ref(null)
const init = () => {
	updateMetrics();
	updateScrollTop();
	if (pageHeight.value === 0) {
		initTime.value = setTimeout(init, 1000);
	}
}
onMounted(() => {
	window.addEventListener('scroll', onScroll, {passive: true});
	init();
	window.addEventListener('resize', onResize);
});

onBeforeUnmount(() => {
	window.removeEventListener('scroll', onScroll);
	window.removeEventListener('resize', onResize);

	clearTimeout(initTime.value);
});
</script>

<style lang="stylus" scoped>
.background
	background-color: #2c8ca7;
	background-image: url(/assets/bg.webp);
	background-size: 100% auto;
	background-repeat: no-repeat;
	background-position: center 0%;
	width: 100dvw;
	max-width: 1920px;
	min-width: 800px;
	height: 100dvh;
	position: fixed;
	top: 0;
	left: 50%;
	transform: translateX(-50%);
	will-change: background-position;
	transition background-position .175s linear;
</style>