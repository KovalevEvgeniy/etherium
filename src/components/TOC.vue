<template>
	<nav class="toc" :class="{_top: top}">
		<div v-for="(item, i) in items" :key="item.path" class="toc__block">
			<a
				v-if="item.title"
				:href="`#${item.path}`"
				class="toc__title"
				:class="{ _active: activeCategoryId === item.path }"
				@click="onClick"
			>{{ i + 1 }}. {{ item.title }}</a>

			<div
				v-if="item.children.length > 0 && (activeCategoryId === item.path || top)"
				class="toc__list"
			>
				<template v-for="(child, c) in item.children" :key="item.path">
					<a
						:href="`#${child.path}`"
						:class="{
							toc__item: !!child.children?.length,
							toc__subitem: !child.children?.length,
							_protect: child.protect,
							_active: activeHeadingId?.indexOf(child.path) >= 0,
						}"
						@click="onClick"
					>
						{{ i + 1 }}.{{ c + 1}}. {{ child.title }}
					</a>
					<div
						v-if="child.children?.length > 0 && (activeCategoryId === item.path || top)"
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
							@click="onClick"
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

const emit = defineEmits(['select']);

const props = defineProps({
	items: Array,
	top: {
		type: Boolean,
		default: false,
	}
});

const activeHeadingId = ref(null);  // ближайший h1[id]
const activeCategoryId = ref(null); // ближайший .category[id]
const suppressHashUpdate = ref(true); // подавление обновления хеша во время инициализации

// Стартовые флаги для работы с хешем при загрузке
const initialHash = ref(null);      // хеш, с которым открыли страницу
const startupPending = ref(false);  // идёт стартовая инициализация по хешу
const startupTimer = ref(null);     // таймер повторной попытки старта

let rAF = null;              // для rAF-троттлинга

// Параметры троттлинга: в окне времени выполняем только последний вызов
let scrollThrottleTimer = null;   // таймер для throttle прокрутки
const SCROLL_THROTTLE_MS = 200;   // интервал throttle для scroll

// Единый верхний отступ для расчётов и скролла (в пикселях)
const VIEWPORT_TOP_OFFSET = 150;

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
	const containerTop = VIEWPORT_TOP_OFFSET;

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
		// Если ни один элемент ещё не прошёл верх — активного нет
		return candidateId ?? null;
	};

	const headingId = pickActive(headingIds);
	const categoryId = pickActive(categoryIds);

	console.log('headingId', headingId)
	console.log('categoryId', categoryId)

	if (headingId !== activeHeadingId.value) {
		activeHeadingId.value = headingId;
	}
	// Обновляем URL только когда снята блокировка и завершена стартовая инициализация
	if (!suppressHashUpdate.value && !startupPending.value) {
	if (headingId) {
			updateUrlHash(headingId);
		} else {
			// Активного заголовка нет — очищаем хеш
			updateUrlHash(null);
		}
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
	// throttle: обрабатываем только один вызов в заданном окне, выполняем в конце окна
	if (scrollThrottleTimer) return;
	scrollThrottleTimer = setTimeout(() => {
		scrollThrottleTimer = null;
		requestMeasure();
	}, SCROLL_THROTTLE_MS);
}

function onResize() {
	requestMeasure();
}

// Отслеживаем изменение хеша; во время старта игнорируем, чтобы Safari не сбрасывал хеш
function onHashChange() {
	if (startupPending.value) {
		// Safari может триггерить hashchange очень рано — игнорируем до завершения стартовой инициализации
		return;
	}
	suppressHashUpdate.value = false;
	// Пересчитать активные элементы после смены хеша
	requestMeasure();
}


const initTime = ref(null);

function scrollToElementById(id, { instant = false, offset = VIEWPORT_TOP_OFFSET } = {}) {
	try {
		const el = id ? document.getElementById(id) : null;
		if (!el) return false;

		// Первичная попытка
		try {
			el.scrollIntoView({ behavior: instant ? 'auto' : 'smooth', block: 'start' });
		} catch (e) {
			// no-op
		}

		// Фолбэк для Safari / нестандартных контейнеров прокрутки
		try {
			const rect = el.getBoundingClientRect();
			const absoluteTop = window.pageYOffset + rect.top - (offset || 0);
			const top = Math.max(0, absoluteTop);
			if (instant) {
				window.scrollTo(0, top);
			} else {
				window.scrollTo({ top, behavior: 'smooth' });
			}
		} catch (e) {
			// no-op
		}
		return true;
	} catch (e) {
		return false;
	}
}

// Повторные попытки проскроллить к стартовому хешу, если контент ещё не доступен
function tryStartupScroll() {
	if (!startupPending.value) return;

	const id = initialHash.value;
	if (!id) {
		// Хеша нет — выходим из стартового режима
		startupPending.value = false;
		suppressHashUpdate.value = false;
		return;
	}

	const el = document.getElementById(id);
	if (el) {
		// Надёжный скролл к стартовому элементу с учётом Safari
		scrollToElementById(id, { instant: true, offset: VIEWPORT_TOP_OFFSET });

		// Ждём стабилизации layout, затем один раз меряем и разрешаем обновления хеша
		requestAnimationFrame(() => {
			requestMeasure();
			requestAnimationFrame(() => {
				startupPending.value = false;
				suppressHashUpdate.value = false;
				requestMeasure();
			});
		});
	} else {
		// Элемента ещё нет — пробуем позже
		startupTimer.value = setTimeout(tryStartupScroll, 250);
	}
}

function init() {
	// Ждём, пока в DOM появятся нужные элементы
	const hasContent = getHeadingIds().length > 0 || getCategoryIds().length > 0;
	if (!hasContent) {
		initTime.value = setTimeout(init, 100);
		return;
	}

	// Сохраняем стартовый хеш, если он есть
	initialHash.value = window.location.hash ? decodeURIComponent(window.location.hash.slice(1)) : null;

	if (initialHash.value) {
		// Запускаем стартовую инициализацию с повторными попытками
		startupPending.value = true;
		tryStartupScroll();
		return;
	}

	// Без стартового хеша: вычисляем активные элементы, затем разрешаем обновление URL
	measureActive();
	requestAnimationFrame(() => {
		suppressHashUpdate.value = false;
		requestMeasure();
	});
}

onMounted(async () => {
	window.addEventListener('scroll', onScroll, {passive: true});
	window.addEventListener('hashchange', onHashChange);
	await nextTick();
	init();
	window.addEventListener('resize', onResize);
});

// На изменение items — пересчитать
watch(() => props.items, () => {
	nextTick().then(() => {
		requestMeasure();
		if (startupPending.value) {
			tryStartupScroll();
		}
	});
}, {deep: true});

onBeforeUnmount(() => {
	window.removeEventListener('scroll', onScroll);
	window.removeEventListener('resize', onResize);
	window.removeEventListener('hashchange', onHashChange);
	if (rAF) cancelAnimationFrame(rAF);
	if (scrollThrottleTimer) clearTimeout(scrollThrottleTimer);
	clearTimeout(initTime.value);
	if (startupTimer.value) clearTimeout(startupTimer.value);
});


const onClick = (e) => {
	e.preventDefault();
	const id = e.target.getAttribute('href').slice(1);
	scrollToElementById(id);
	// При явном выборе пользователем завершаем стартовую фазу
	startupPending.value = false;
	suppressHashUpdate.value = false;
	emit('select', id);
};

</script>

<style scoped lang="stylus" src="./toc.styl"></style>