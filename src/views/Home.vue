<template>
	<main class="content">
		<Island class="content__toc-btn" @click="onToggleTOC">Оглавление</Island>
		<div class="content__top">
			<Island
				class="content__toc"
				:class="{
					_show: onShowTOC
				}"
			>
				<TOC :items="items" top @select="onCloseTOC"/>
				<div class="content__toc-close" @click="onCloseTOC">+</div>
			</Island>
			<Island v-if="indexHasContent">
				<component :is="indexContent"/>
			</Island>
		</div>
		<div class="content__main">
			<Island class="content__aside">
				<TOC :items="items"/>
			</Island>
			<div class="content__body">
				<Island v-for="(item, i) in items" :key="item.path" class="content__block">
					<div class="category content__category" v-if="item.title" :id="item.path">
						{{ i + 1 }}. {{ item.title }}
					</div>
					<div class="content__list">
						<div v-if="item.hasContent">
							<component :is="item.comp"/>
						</div>
						<template v-for="(child, c) in item.children" :key="child.path">
							<div class="content__group">
								<div class="content__title" :class="{_protected: child.protect}">
									<h1 v-if="child.title" :id="child.path">{{ i + 1 }}.{{ c + 1 }} {{
											child.title
										}}</h1>
								</div>
								<div class="content__text">
									<div
										class="content__wrapper"
										:class="{
										_hidden: isHiddenProtected(child)
									}"
										@click=onShowBlock(child.path)
									>
										<component :is="child.comp"/>
									</div>
									<SpoilerText v-if="isHiddenProtected(child)"/>
								</div>

								<div class="content__children">
									<div class="content__child" v-for="(subchild, s) in child.children"
									     :key="subchild.path">
										<div v-if="s > 0" class="content__separator">✻ ✻ ✻</div>
										<div class="content__title" :class="{_protected: subchild.protect}">
											<h2 v-if="subchild.title" :id="subchild.path">{{ subchild.title }}</h2>

										</div>
										<div class="content__text">
											<div
												class="content__wrapper"
												:class="{
												_hidden: isHiddenProtected(subchild)
											}"
												@click=onShowBlock(subchild.path)
											>
												<component :is="subchild.comp"/>
											</div>
											<SpoilerText v-if="isHiddenProtected(subchild)"/>
										</div>
									</div>
								</div>
							</div>
						</template>
					</div>
				</Island>
			</div>
		</div>
	</main>
</template>

<script setup>
import {computed, ref} from 'vue';
import TOC from "@/components/TOC.vue";
import Island from "@/components/Island.vue";
import SpoilerText from "@/components/SpoilerText.vue";

// Eagerly import all markdown files as Vue components
const mdIndex = import.meta.glob('@data/index.md', {eager: true});
const mdModules = import.meta.glob('@data/**/*.md', {eager: true});
// Raw contents of markdown files to detect emptiness
const mdRawIndex = import.meta.glob('@data/index.md', {as: 'raw', eager: true});
const mdRaw = import.meta.glob('@data/**/*.md', {as: 'raw', eager: true});

const indexContent = computed(() => Object.entries(mdIndex)[0][1].default)
const indexHasContent = computed(() => {
	const raw = Object.entries(mdRawIndex)[0]?.[1] || '';
	return hasMarkdownBody(raw);
})

const showBlocks = ref([]);

const onShowBlock = (path) => {
	console.log('path', path)
	if (showBlocks.value.includes(path)) {
		showBlocks.value = showBlocks.value.filter(p => p !== path);
	} else {
		showBlocks.value.push(path);
	}
}

const isHiddenProtected = (item) => {
	return item.protect && !showBlocks.value.includes(item.path)
}

// Normalize path for ordering (для ключа/сортировки)
function filePathToSortKey(filePath) {
	let p = filePath.replace(/\\/g, '/');
	p = p.replace(/^@?\/?(src\/)?data\//, '');
	p = p.replace(/\/index\.md$/i, '/');
	return p.toLowerCase();
}

// Вспомогательная: получить относительный путь внутри data (без .md)
function toRelNoExt(filePath) {
	let p = filePath.replace(/\\/g, '/');
	p = p.replace(/^@?\/?(src\/)?data\//, '');
	p = p.replace(/\.md$/i, '');
	return p;
}

// Вспомогательная: попытаться извлечь фронтматтер из модуля
function getFrontmatter(mod) {
	return (
		mod?.frontmatter ||
		mod?.attributes ||
		mod?.meta ||
		mod?.matter ||
		mod?.default?.frontmatter ||
		mod?.default?.attributes ||
		null
	);
}

// Удалить фронтматтер и комментарии, чтобы понять есть ли тело markdown
function stripFrontmatter(raw) {
	if (!raw) return ''
	let text = raw.replace(/^\uFEFF?/, '')
	if (text.startsWith('---')) {
		const m = text.match(/^---[\s\S]*?\n---\s*\n?/)
		if (m) {
			text = text.slice(m[0].length)
		}
	}
	// убрать HTML-комментарии
	text = text.replace( /<!--[\s\S]*?-->/g, '')
	return text.trim()
}

function hasMarkdownBody(raw) {
	return stripFrontmatter(raw).length > 0
}

// Узел дерева
function makeDirNode(name, fullPath) {
	return {
		type: 'dir',
		name,              // имя сегмента
		path: fullPath,    // относительный путь папки
		title: null,       // из index.md, если есть
		order: 999999,     // из index.md, если есть
		protect: false,    // из index.md, если есть
		comp: null,        // компонент из index.md
		hasContent: false, // есть ли тело в index.md
		children: [],      // дочерние узлы
		key: filePathToSortKey(fullPath.endsWith('/') ? fullPath : fullPath + '/'),
	};
}

function makeFileNode(name, fullPath, comp, fm) {
	const title = fm?.title ?? name;
	const order = Number.isFinite(+fm?.order) ? +fm.order : 999999;
	return {
		type: 'file',
		name,
		path: fullPath,
		title,
		order,
		protect: !!fm?.protect,
		hidden: !!fm?.hidden,
		comp,
		hasContent: false,
		key: filePathToSortKey(fullPath + '.md'),
	};
}

// Рекурсивно получить/создать папку по пути сегментов
function getOrCreateDir(root, segments, accPath = '') {
	if (segments.length === 0) return root;
	const seg = segments[0];
	const nextPath = accPath ? `${accPath}/${seg}` : seg;

	let child = root.children.find(n => n.type === 'dir' && n.name === seg);
	if (!child) {
		child = makeDirNode(seg, nextPath);
		root.children.push(child);
	}
	return getOrCreateDir(child, segments.slice(1), nextPath);
}

// Сортировка детей: сначала по order, затем по title/name, затем dirs перед files
function sortChildren(node) {
	node.children.sort((a, b) => {
		// dirs вверх
		if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;

		// order (для dir — из index.md, если есть, иначе 999999)
		const ao = Number.isFinite(+a.order) ? +a.order : 999999;
		const bo = Number.isFinite(+b.order) ? +b.order : 999999;
		if (ao !== bo) return ao - bo;

		// заголовок/имя
		const at = (a.title || a.name || '').toLowerCase();
		const bt = (b.title || b.name || '').toLowerCase();
		if (at < bt) return -1;
		if (at > bt) return 1;

		// ключ как стабильный фолбэк
		return (a.key || '').localeCompare(b.key || '');
	});

	// рекурсивно
	for (const child of node.children) {
		if (child.type === 'dir') sortChildren(child);
	}
}

function removeHidden(node) {
	if (node.type === 'dir') {
		if (node.hidden) return false;
		node.children = node.children.filter(child => removeHidden(child));
		return true;
	}
	return !node.hidden;
}

const items = computed(() => {
	// Корневой фиктивный узел
	const root = makeDirNode('', '');

	for (const [absPath, mod] of Object.entries(mdModules)) {
		const rel = toRelNoExt(absPath);     // например: world/technology/index или world/technology/phase-transition
		const segments = rel.split('/').filter(Boolean);
		const isIndex = segments[segments.length - 1].toLowerCase() === 'index';

		if (isIndex) {
			// Узел директории: кладем мета/компонент на директорию
			const dirSegs = segments.slice(0, -1); // путь папки без 'index'
			const dirNode = getOrCreateDir(root, dirSegs);

			dirNode.title = mod.title ?? (dirSegs[dirSegs.length - 1] || 'root');
			dirNode.order = Number.isFinite(+mod.order) ? +mod.order : dirNode.order;
			dirNode.protect = !!mod.protect;
			dirNode.hidden = !!mod.hidden;
			dirNode.comp = mod.default;
			dirNode.hasContent = hasMarkdownBody(mdRaw[absPath] || '');
		} else {
			const fileName = segments[segments.length - 1];
			const parentDirSegs = segments.slice(0, -1);
			const parentDir = getOrCreateDir(root, parentDirSegs);
			const fileNode = makeFileNode(fileName, rel, mod.default, mod);
			fileNode.hasContent = hasMarkdownBody(mdRaw[absPath] || '');
			parentDir.children.push(fileNode);
		}
	}

	// Сортировка дерева
	sortChildren(root);

	// Фильтрация скрытых узлов (директории и файлов)
	root.children = root.children.filter(child => removeHidden(child));

	// Возвращаем детей корня — верхний уровень разделов/страниц
	return root.children;
});

const onShowTOC = ref(false);
const onToggleTOC = () => {
	onShowTOC.value = !onShowTOC.value;
}
const onCloseTOC = () => {
	onShowTOC.value = false;
}

</script>

<style scoped lang="stylus" src="./home.styl"></style>