<template>
	<main class="content">
		<div class="content__top">
			<Island>
				<component :is="indexContent"/>
			</Island>
		</div>
		<div class="content__main">
			<Island class="content__aside">
				<TOC :items="items"/>
			</Island>
			<div class="content__body">
				<div v-for="(item, i) in items" :key="item.path" class="content__block">
					<div class="content__list">
						<template v-for="(child, c) in item.children" :key="child.path">
							<Island>
								<div class="content__category" v-if="item.title" :id="item.path">
									{{ i + 1 }}. {{item.title}}
								</div>
								<div class="content__title">
									<h1 v-if="child.title" :id="child.path">{{ child.title }}</h1>
									<div v-if="child.protect" class="content__protected">
										(Protected)
									</div>
								</div>
								<component :is="child.comp"/>

								<div class="content__list">
									<template v-for="subchild in child.children" :key="subchild.path">
										<h2 v-if="subchild.title" :id="subchild.path">{{ subchild.title }}</h2>
										<component :is="subchild.comp"/>
									</template>
								</div>
							</Island>
						</template>
					</div>
				</div>
			</div>
		</div>
	</main>
</template>

<script setup>
import {computed} from 'vue';
import TOC from "@/components/TOC.vue";
import Island from "@/components/Island.vue";

// Eagerly import all markdown files as Vue components
const mdIndex = import.meta.glob('@data/index.md', {eager: true});
const mdModules = import.meta.glob('@data/**/*.md', {eager: true});

const indexContent = computed(() => Object.entries(mdIndex)[0][1].default)

console.log('mdIndex', indexContent.value)

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
		} else {
			const fileName = segments[segments.length - 1];
			const parentDirSegs = segments.slice(0, -1);
			const parentDir = getOrCreateDir(root, parentDirSegs);
			const fileNode = makeFileNode(fileName, rel, mod.default, mod);
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

</script>


<style scoped lang="stylus">
.all-content :deep(h1),
.all-content :deep(h2),
.all-content :deep(h3)
	scroll-margin-top: 80px;

.content
	display: flex;
	flex-direction: column;
	gap: 4rem;
	line-height 1.5

	&__main
		display flex
		align-items flex-start
		gap 4rem

	&__body
		display flex
		flex-direction column
		gap 8rem

	&__aside
		width 300px
		flex-shrink 0
		padding-right 2rem
		position sticky
		top 2rem
		bottom 2rem
		max-height calc(100dvh - 4rem)
		overflow-y auto

	&__block
		display: flex;
		flex-direction: column;
		gap: 2rem;

	&__separator
		font-size 10rem
		margin 4rem auto
		text-align center
		color #999

	table
		width 100%

	&__list
		display flex
		flex-direction column
		gap 8rem

	&__category
		font-size 3rem
		margin-top -3rem
		padding-bottom 0.5rem
		border-bottom 1px solid #ccc
		color #777

	&__title
		border-bottom: 1px solid #ccc;
		margin-bottom: 1em;
		display flex;
		justify-content center
		align-items center
		gap 1rem

	&__protected
		color #b11e1e
		font-size 3rem
		margin-top 1.5rem

</style>