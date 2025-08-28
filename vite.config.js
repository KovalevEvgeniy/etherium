import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import Markdown from 'vite-plugin-vue-markdown';
import linkAttributes from 'markdown-it-link-attributes'
import attrs from 'markdown-it-attrs'

export default defineConfig(({ command }) => ({
    plugins: [
        vue({
            include: [/\.vue$/, /\.md$/]
        }),
        Markdown({
            wrapperClasses: 'markdown-body',
            markdownItSetup(md) {
                md.use(attrs, {
                    leftDelimiter: '{:',     // поддержка kramdown-стиля "{: ...}"
                    rightDelimiter: '}',
                    allowedAttributes: [
                        'id',
                        'class',
                        'target',
                        'rel'
                    ]
                })
                md.use(linkAttributes, {
                    matcher(href) {
                        return /^https?:\/\//.test(href)
                    },
                    attrs: {
                        target: '_blank',
                        rel: 'noopener'
                    }
                })
            }
        })

    ],

    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            '@data': fileURLToPath(new URL('./data', import.meta.url))
        }
    },

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