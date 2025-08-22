import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import Image from './components/Image.vue';

const app = createApp(App);
app.use(router);
app.component('Image', Image);
app.mount('#app');