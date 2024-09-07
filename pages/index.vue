<template>
    <div class="relative">
        <div v-if="showLoader" class="absolute top-0 right-0 md:top-4 md:right-4 z-20">
            <div class="w-5 h-5 border-t-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
        <div v-else class="absolute top-0 right-0 md:top-4 md:right-4 z-20">
            <div class="w-5 h-5 text-green-500">✓</div>
        </div>
        <div v-if="players.length">
            <players-list :players="players" />
        </div>
        <p v-else class="text-center text-xl text-gray-500">Loading players...</p>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PlayersList from '../components/PlayersList.vue'

import { usePlayersStore } from '../store/players'

const players = ref([])
const store = usePlayersStore()
const { showLoader } = storeToRefs(store)

const fetchPlayersData = async () => {
    try {
        const response = await fetch('/api/database')
        if (!response.ok) {
            throw new Error('Network response was not ok')
        }
        players.value = await response.json()
        return players.value
    } catch (error) {
        console.error('Failed to fetch players:', error)
    }
}

onMounted(async () => {
  // Fetch players data and set it in the store
  const players = await fetchPlayersData() // Replace with your actual data fetching method
  store.setPlayers(players)
})
</script>
