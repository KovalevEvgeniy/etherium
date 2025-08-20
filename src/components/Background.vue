<template>
	<div class="background" :style="parallaxStyle"></div>
</template>

<script setup>
import {ref, computed, onMounted, onBeforeUnmount} from 'vue';

let scrollEl = null;        // целевой элемент скролла (#app)
let useWindowScroll = false; // флаг: используем ли window как источник

const scrollTop = ref(0);
const pageHeight = ref(0);

function updateMetrics() {
	// Пытаемся измерять контент по .app; если нет .app — используем прежние измерения
	const contentEl = document.querySelector('.app');

	console.log('contentEl', contentEl)

	if (useWindowScroll) {
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
	} else if (scrollEl) {
		const viewportH = scrollEl.clientHeight;
		if (contentEl) {
			pageHeight.value = Math.max(0, contentEl.scrollHeight - viewportH);
		} else {
			pageHeight.value = Math.max(0, scrollEl.scrollHeight - viewportH);
		}
	}
}

function updateScrollTop() {
	if (useWindowScroll) {
		const doc = document.scrollingElement || document.documentElement;
		// window.scrollY предпочтительнее, но даём фолбэк
		scrollTop.value = window.scrollY ?? doc.scrollTop ?? document.body.scrollTop ?? 0;
	} else {
		scrollTop.value = scrollEl ? scrollEl.scrollTop : 0;
	}
}

const scrollPercent = computed(() => {
	if (pageHeight.value <= 0) return 0;
	return Math.min(100, Math.max(0, (scrollTop.value / pageHeight.value) * 100));
});

const parallaxStyle = computed(() => {
	return {
		backgroundPosition: `center ${scrollPercent.value}%`,
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
	const appEl = document.getElementById('app');
	// Проверяем, является ли #app реально скроллируемым контейнером
	if (appEl && appEl.scrollHeight > appEl.clientHeight) {
		scrollEl = appEl;
		useWindowScroll = false;
		scrollEl.addEventListener('scroll', onScroll, {passive: true});
	} else {
		// Фолбэк: скроллится документ/окно
		scrollEl = null;
		useWindowScroll = true;
		window.addEventListener('scroll', onScroll, {passive: true});
	}

	init();

	window.addEventListener('resize', onResize);
});

onBeforeUnmount(() => {
	if (useWindowScroll) {
		window.removeEventListener('scroll', onScroll);
	} else if (scrollEl) {
		scrollEl.removeEventListener('scroll', onScroll);
	}
	window.removeEventListener('resize', onResize);

	clearTimeout(initTime.value);
});
</script>

<style>
.background {
	background-color: #2c8ca7;
	background-image: url(/assets/bg.webp);
	background-size: 100% auto;
	background-repeat: no-repeat;
	background-position: center 0%;
	width: 100dvw;
	max-width: 1200px;
	min-width: 800px;
	height: 100dvh;
	position: fixed;
	top: 0;
	left: 50%;
	transform: translateX(-50%);
	/* Для подхода через background-position: */
	will-change: background-position;
	/* Если переключитесь на transform:
	   will-change: transform;
	*/
}
</style>