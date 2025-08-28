import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import Image from './components/Image.vue';
import PoliticMap from "./components/PoliticMap.vue";
import ColorBox from "@/components/ColorBox.vue";

const app = createApp(App);
app.use(router);
app.component('Image', Image);
app.component('PoliticMap', PoliticMap);
app.component('ColorBox', ColorBox);
app.mount('#app');