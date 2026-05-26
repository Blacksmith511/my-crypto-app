import { createApp } from 'vue'
import { createPinia } from 'pinia' // 1. Импортируем Pinia
import './style.css'
import App from './App.vue'

const app = createApp(App) // Создаем экземпляр
const pinia = createPinia() // Создаем Pinia

app.use(pinia) // 2. Подключаем Pinia к приложению
app.mount('#app') // 3. Монтируем