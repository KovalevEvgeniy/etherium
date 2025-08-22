import { createRouter, createWebHistory } from 'vue-router';
const mdModules = import.meta.glob('@data/**/*.md');

function filePathToRoutePath(filePath) {
    let p = filePath.replace(/\\/g, '/');

    // Снимаем возможные префиксы
    p = p.replace(/^@?\/?(src\/)?data\//, ''); // убираем src/data/ или data/
    p = p.replace(/\.md$/, '');                // убираем расширение .md

    // Нормализуем index
    if (p === 'index') p = '';
    p = p.replace(/\/index$/, '');

    // Убираем все ведущие слэши, затем добавляем один
    p = p.replace(/^\/+/, '');
    return '/' + p;
}


const mdRoutes = Object.entries(mdModules).map(([path, loader]) => ({
    path: filePathToRoutePath(path.replace(/\\/g, '/')),
    component: loader
}));


const routes = [
    // {
    //     path: '/',
    //     name: 'home',
    //     component: import('@/views/Layout.vue'),
    //     children: mdRoutes,
    // },
    { path: '/', name: 'all-content', component: import('@/views/AllContent.vue') },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: import('@/views/404.vue') }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior() {
        return { top: 0 };
    }
});

console.log('[Router] Routes:', router.getRoutes().map(r => r.path));

export default router;