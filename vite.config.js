import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import Markdown from 'vite-plugin-vue-markdown';

export default defineConfig(({ command }) => ({
    plugins: [
        vue({
            include: [/\.vue$/, /\.md$/]
        }),
        Markdown({
            wrapperClasses: 'markdown-body'
        })
    ],

    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            '@data': fileURLToPath(new URL('./data', import.meta.url))
        }
    },

    // base только для билда
    base: command === 'build' ? '/etherium/' : '/',

    build: {
        outDir: 'docs',
        assetsDir: 'assets'
    },

    server: {
        port: 5151,
        open: true
    }
}));