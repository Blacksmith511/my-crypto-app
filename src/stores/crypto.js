import { defineStore } from 'pinia'
import axios from 'axios'

export const useCryptoStore = defineStore('crypto', {
  state: () => ({
    coins: [],
    // Загружаем портфель из localStorage при старте
    portfolio: JSON.parse(localStorage.getItem('myPortfolio')) || [],
    searchQuery: '',
    isLoading: false
  }),
  actions: {
    async fetchCoins() {
      this.isLoading = true
      try {
        const res = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
          params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: 100,
            page: 1
          }
        })
        this.coins = res.data
      } catch (e) { 
        console.error("Лимит API! Попробуй позже.") 
      } finally { this.isLoading = false }
    },
    addToPortfolio(coin) {
      const exist = this.portfolio.find(item => item.id === coin.id)
      if (exist) {
        exist.amount++
      } else {
        this.portfolio.push({ 
          id: coin.id, 
          name: coin.name, 
          symbol: coin.symbol, 
          current_price: coin.current_price, 
          image: coin.image, // Картинка должна подтягиваться здесь
          amount: 1 
        })
      }
      this.saveToLocal()
    },
    removeFromPortfolio(id) {
      this.portfolio = this.portfolio.filter(item => item.id !== id)
      this.saveToLocal()
    },
    saveToLocal() {
      localStorage.setItem('myPortfolio', JSON.stringify(this.portfolio))
    }
  },
  getters: {
    filteredCoins: (state) => {
      return state.coins.filter(coin => 
        coin.name.toLowerCase().includes(state.searchQuery.toLowerCase())
      ).slice(0, 8)
    },
    totalBalance: (state) => {
      return state.portfolio.reduce((acc, item) => acc + (item.current_price * item.amount), 0).toFixed(2)
    }
  }
})