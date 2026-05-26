<script setup>
import { onMounted, computed } from 'vue'
import { useCryptoStore } from './stores/crypto'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const store = useCryptoStore()
onMounted(() => store.fetchCoins())

// Прокси для картинок
const imgProxy = (url) => `https://images.weserv.nl/?url=${encodeURIComponent(url)}`

const chartData = computed(() => ({
  labels: store.portfolio.map(i => i.symbol.toUpperCase()),
  datasets: [{
    backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#f97316'],
    data: store.portfolio.map(i => (i.current_price * i.amount)),
    borderWidth: 0,
    hoverOffset: 10
  }]
}))

const chartOptions = { 
  responsive: true, 
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false } // Прячем легенду, чтобы не занимала место
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-10 font-sans">
    <div class="max-w-6xl mx-auto">
      
      <!-- HEADER -->
      <header class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div class="bg-slate-900 p-8 rounded-3xl border border-slate-800 flex flex-col justify-center shadow-2xl">
          <h1 class="text-4xl font-black text-white mb-2 tracking-tighter">
            CRYPTO<span class="text-emerald-500 font-light">.LAB</span>
          </h1>
          <p class="text-slate-500 text-sm italic">Инструмент твоей новой реальности</p>
          <input v-model="store.searchQuery" type="text" placeholder="Поиск монеты (напр. Bitcoin)..." 
                 class="mt-6 bg-slate-800 border-none rounded-2xl px-5 py-3 focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-600"/>
        </div>

        <div class="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-3xl text-slate-950 flex flex-col justify-between relative overflow-hidden shadow-emerald-500/20 shadow-2xl">
          <div class="z-10 text-xs font-black uppercase tracking-[0.2em] opacity-70">Текущий баланс</div>
          <div class="z-10 text-5xl font-black tracking-tighter drop-shadow-sm">
            ${{ Number(store.totalBalance).toLocaleString() }}
          </div>
          <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- ЛЕВАЯ КОЛОНКА (РЫНОК) -->
        <div class="lg:col-span-2 space-y-4">
          <div class="flex justify-between items-center px-2">
            <h2 class="text-lg font-bold text-white uppercase tracking-widest text-sm">Маркет</h2>
            <span v-if="store.isLoading" class="text-xs text-emerald-500 animate-pulse font-mono">Обновление...</span>
          </div>

          <div class="grid gap-3">
            <transition-group name="list">
              <div v-for="coin in store.filteredCoins" :key="coin.id" 
                class="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex items-center justify-between hover:border-emerald-500/30 transition-all">
                <div class="flex items-center gap-4">
                  <img :src="imgProxy(coin.image)" class="w-10 h-10 rounded-full shadow-lg" />
                  <div>
                    <p class="font-bold text-white">{{ coin.name }}</p>
                    <p class="text-[10px] text-slate-500 uppercase font-mono">{{ coin.symbol }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-6">
                  <div class="text-right">
                    <p class="font-mono font-bold text-white">${{ coin.current_price.toLocaleString() }}</p>
                    <p :class="coin.price_change_percentage_24h > 0 ? 'text-emerald-400' : 'text-rose-500'" class="text-[10px] font-bold">
                      {{ coin.price_change_percentage_24h?.toFixed(2) }}%
                    </p>
                  </div>
                  <button @click="store.addToPortfolio(coin)" 
                          class="bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 p-2.5 rounded-xl transition-all active:scale-90 shadow-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path></svg>
                  </button>
                </div>
              </div>
            </transition-group>
          </div>
        </div>

        <!-- ПРАВАЯ КОЛОНКА (АНАЛИТИКА + ПОРТФЕЛЬ) -->
        <div class="space-y-6">
          
          <!-- ГРАФИК -->
          <div class="bg-slate-900 p-6 rounded-3xl border border-slate-800 h-64 relative shadow-2xl">
             <h2 class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Структура активов</h2>
             <div v-if="store.portfolio.length > 0" class="h-40">
                <Doughnut :data="chartData" :options="chartOptions" />
             </div>
             <div v-else class="flex flex-col items-center justify-center h-40 text-slate-700 italic text-xs">
                <p>Нет данных для анализа</p>
             </div>
          </div>

          <!-- ДЕТАЛИЗАЦИЯ ПОРТФЕЛЯ (С УДАЛЕНИЕМ) -->
          <div class="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl">
            <h2 class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Детализация</h2>
            
            <div v-if="store.portfolio.length === 0" class="text-center py-4 text-slate-600 text-sm italic">
              Пусто
            </div>

            <div v-else class="space-y-4">
              <div v-for="item in store.portfolio" :key="item.id" class="group flex justify-between items-center bg-slate-800/30 p-3 rounded-xl hover:bg-slate-800/50 transition-all">
                <div class="flex items-center gap-3">
                  <img :src="imgProxy(item.image)" class="w-6 h-6 rounded-full" />
                  <div>
                    <p class="text-xs font-bold text-white">{{ item.name }}</p>
                    <p class="text-[10px] text-slate-500">x{{ item.amount }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <div class="text-right text-xs font-mono text-emerald-400">
                    ${{ (item.current_price * item.amount).toFixed(2) }}
                  </div>
                  <!-- ВОТ ОНА, КНОПКА УДАЛЕНИЯ -->
                  <button @click="store.removeFromPortfolio(item.id)" 
                          class="text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M216,48H176V40a24,24,0,0,0-24-24H104a24,24,0,0,0-24,24v8H40a8,8,0,0,0,0,16h8V208a24,24,0,0,0,24,24H184a24,24,0,0,0,24-24V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm104,168a8,8,0,0,1-8,8H72a8,8,0,0,1-8-8V64H192Z"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style>
.list-enter-active, .list-leave-active { transition: all 0.4s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateY(10px); }
</style>