import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue'
import NotFound from '@/views/404.vue'

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
    { path: '/', name: 'home', component: Home },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFound }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior() {
        return { top: 0 };
    }
});

export default router;