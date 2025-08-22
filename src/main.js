import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import Image from './components/Image.vue';
import PoliticMap from "./components/PoliticMap.vue";

const app = createApp(App);
app.use(router);
app.component('Image', Image);
app.component('PoliticMap', PoliticMap);
app.mount('#app');