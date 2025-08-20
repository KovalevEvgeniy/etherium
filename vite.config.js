import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import Markdown from 'vite-plugin-vue-markdown';


export default defineConfig({
    plugins: [
        vue({
            include: [/\.vue$/, /\.md$/] // обрабатываем и .vue, и .md
        }),
        Markdown({
            // Здесь можно подключать плагины markdown-it
            // Пример:
            // markdownItSetup(md) {
            //   md.use(require('markdown-it-anchor'));
            // }
            wrapperClasses: 'markdown-body'
        })
    ],

    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            '@data': fileURLToPath(new URL('./data', import.meta.url))
        }
    },
    server: {
        port: 5151,
        open: true
    }
});