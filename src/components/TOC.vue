<template>
	<nav class="toc">
		<div v-for="(item, i) in items" :key="item.path" class="toc__block">
			<a
				v-if="item.title"
				:href="`#${item.path}`"
				class="toc__title"
				:class="{ _active: activeCategoryId === item.path }"
			>{{ i + 1 }}. {{ item.title }}</a>

			<div
				v-if="activeCategoryId === item.path && item.children.length > 0"
				class="toc__list"
			>
				<template v-for="child in item.children" :key="item.path">
					<a
						:href="`#${child.path}`"
						class="toc__item"
						:class="{
							_protect: child.protect,
							_active: activeHeadingId.indexOf(child.path) >= 0,
						}"
					>
						{{ child.title }}
					</a>
					<div
						v-if="activeCategoryId === item.path && child.children?.length > 0"
						class="toc__sublist"
					>
						<a
							v-for="subchild in child.children" :key="item.path"
							:href="`#${subchild.path}`"
							class="toc__subitem"
							:class="{
								_protect: subchild.protect,
								_active: activeHeadingId === subchild.path,
							}"
						>
							- {{ subchild.title }}
						</a>
					</div>
				</template>

			</div>
		</div>
	</nav>
</template>

<script setup>
import {ref, onMounted, onBeforeUnmount, nextTick, watch} from 'vue';

const props = defineProps({
	items: Array,
});

const activeHeadingId = ref(null);  // ближайший h1[id]
const activeCategoryId = ref(null); // ближайший .category[id]

let rAF = null;              // для rAF-троттлинга

function updateUrlHash(id) {
	try {
		const url = new URL(window.location.href);
		url.hash = id ? `#${id}` : '';
		history.replaceState(null, '', url);
	} catch (e) {
		// no-op
	}
}

function getHeadingIds() {
	// Только id, стоящие на заголовках h1
	const nodes = Array.from(document.querySelectorAll('h1[id], h2[id]'));
	return nodes.map(n => n.getAttribute('id')).filter(Boolean);
}

function getCategoryIds() {
	// Только id элементов ближайших категорий
	const nodes = Array.from(document.querySelectorAll('.category[id]'));
	return nodes.map(n => n.getAttribute('id')).filter(Boolean);
}

function measureActive() {
	const headingIds = getHeadingIds();
	const categoryIds = getCategoryIds();

	// Верхняя граница области просмотра
	const containerTop = 100;

	const pickActive = (ids) => {
		let candidateId = null;
		let candidateTop = -Infinity;
		for (const id of ids) {
			const el = document.getElementById(id);
			if (!el) continue;
			const top = el.getBoundingClientRect().top - containerTop;
			if (top <= 0 && top > candidateTop) {
				candidateTop = top;
				candidateId = id;
			}
		}
		// Если ни один элемент ещё не прошёл верх — активным становится самый верхний в документе
		return candidateId ?? (ids.length ? ids[0] : null);
	};

	const headingId = pickActive(headingIds);
	const categoryId = pickActive(categoryIds);

	if (headingId !== activeHeadingId.value) {
		activeHeadingId.value = headingId;
		updateUrlHash(headingId);
	}
	if (categoryId !== activeCategoryId.value) {
		activeCategoryId.value = categoryId;
	}
}

function requestMeasure() {
	if (rAF) return;
	rAF = requestAnimationFrame(() => {
		rAF = null;
		measureActive();
	});
}

function onScroll() {
	requestMeasure();
}

function onResize() {
	requestMeasure();
}

const initTime = ref(null);

function init() {
	measureActive();
	// Повторная попытка только если в DOM пока нет целевых элементов
	const hasContent = getHeadingIds().length > 0 || getCategoryIds().length > 0;
	if (!hasContent) {
		initTime.value = setTimeout(init, 1000);
	}
}

onMounted(async () => {
	window.addEventListener('scroll', onScroll, {passive: true});
	await nextTick();
	init();
	window.addEventListener('resize', onResize);
});

// На изменение items — пересчитать
watch(() => props.items, () => {
	nextTick().then(() => {
		requestMeasure();
	});
}, {deep: true});

onBeforeUnmount(() => {
	window.removeEventListener('scroll', onScroll);
	window.removeEventListener('resize', onResize);
	if (rAF) cancelAnimationFrame(rAF);
	clearTimeout(initTime.value);
});
</script>

<style scoped lang="stylus">
.toc
	width: 100%;
	line-height: 1;

	&__block
		break-inside: avoid;
		-webkit-column-break-inside: avoid;
		page-break-inside: avoid;
		margin-bottom: 4rem;

		&:last-child
			margin-bottom: 0;

	&__list
		display flex
		flex-direction column
		gap 2rem

	&__sublist
		display flex
		flex-direction column
		gap 1rem
		padding-left 2rem

	&__item
	&__subitem
		display: block;
		color #555
		text-decoration: none
		font-weight normal
		font-size 4rem

		&._protect
			color #b11e1e

	&__subitem
		font-size 3.5rem

	&__title
		display block
		color #000
		margin-bottom 1rem
		text-transform uppercase

	&__item
		margin-top 2rem

	&__title
	&__item
	&__subitem
		text-decoration: none
		transition: color 0.2s ease-in-out, margin-left 0.2s ease-in-out

		&:hover
			text-decoration underline

		&._active
			font-weight bold
			color #000

			&._protect
				color #b11e1e

</style>