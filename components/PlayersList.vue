<template>
  <div class="flex md:gap-4 flex-col md:flex-row">
    <div class="md:hidden sticky top-0 z-10" id="tab-selector">
    <div class="flex border-b border-gray-700 bg-gray-900">
      <button @click="activeTab = 'sidebar'" :class="['flex-1 py-3 px-4 text-center text-sm font-medium transition-colors duration-200', activeTab === 'sidebar' ? 'border-b-2 border-indigo-500 text-indigo-400' : 'text-gray-400 hover:text-gray-300']">Sidebar</button>
      <button @click="activeTab = 'players'" :class="['flex-1 py-3 px-4 text-center text-sm font-medium transition-colors duration-200', activeTab === 'players' ? 'border-b-2 border-indigo-500 text-indigo-400' : 'text-gray-400 hover:text-gray-300']">Players</button>
      <button @click="activeTab = 'details'" :class="['flex-1 py-3 px-4 text-center text-sm font-medium transition-colors duration-200', activeTab === 'details' ? 'border-b-2 border-indigo-500 text-indigo-400' : 'text-gray-400 hover:text-gray-300']">Details</button>
    </div>
    </div>

    <left-sidebar :class="['md:block', { 'hidden': activeTab !== 'sidebar' }]" />

    <div :class="['w-full md:w-1/2 p-2 mx-auto max-h-screen overflow-y-scroll ', { 'hidden md:block': activeTab !== 'players' }]">
      <div class="flex flex-col md:flex-row items-center justify-between mb-4 space-x-2 md:mt-10">
        <div class="inline-flex rounded-md shadow-sm bg-gray-800 p-1" role="group">
          <button
            @click="toggleBoughtFilter"
            :class="[
              'text-sm px-2 py-1 rounded-l-md font-semibold',
              store.showBought ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300',
              store.showBought ? 'z-10' : '',
              'relative inline-flex items-center justify-center focus:z-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white'
            ]"
            tabindex="-1"
          >
            Miei
          </button>
          <button
            @click="toggleFavouriteFilter"
            :class="[
              'text-sm px-2 py-1 font-semibold -ml-px',
              store.showFavourite ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-300',
              store.showFavourite ? 'z-10' : '',
              'relative inline-flex items-center justify-center focus:z-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white'
            ]"
            tabindex="-1"
          >
            Preferiti
          </button>
          <button
            @click="toggleTakenFilter"
            :class="[
              'text-sm px-2 py-1 font-semibold -ml-px',
              store.showTaken ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300',
              store.showTaken ? 'z-10' : '',
              'relative inline-flex items-center justify-center focus:z-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white'
            ]"
            tabindex="-1"
          >
            Presi
          </button>
          <button
            @click="toggleAvailableFilter"
            :class="[
              'text-sm px-2 py-1 font-semibold -ml-px',
              store.showAvailable ? 'bg-gray-500 text-white' : 'bg-gray-700 text-gray-300',
              store.showAvailable ? 'z-10' : '',
              'relative inline-flex items-center justify-center focus:z-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white'
            ]"
            tabindex="-1"
          >
            Liberi
          </button>
          <button
            @click="resetPlayerStatusFilters"
            class="text-sm px-2 py-1 rounded-r-md font-semibold -ml-px bg-gray-700 text-gray-300 hover:bg-gray-600 relative inline-flex items-center justify-center focus:z-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white"
            tabindex="-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        <select
          v-model="store.orderBy"
          @change="store.setOrderBy(store.orderBy)"
          class="bg-gray-800 text-white border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm py-1 px-2"
          tabindex="-1"
        >
          <option value="fvm_mantra">Valore medio</option>
          <option value="fantamedia">Fantamedia</option>
          <option value="titolarita">Titolarità</option>
          <option value="trend">Trend</option>
          <option value="my_valuation">Valutazione personale</option>
          <option value="algo_ai">Algo AI</option>
        </select>
      </div>

      <div v-if="filteredPlayers.length" class="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-8 px-4 py-2">
        <PlayerCard v-for="player in filteredPlayers" :key="player.id" :playerId="player.id" />
      </div>
      <div v-else-if="players.length === 0" class="text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Loading players...</h3>
      </div>
      <div v-else class="text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No players found</h3>
        <p class="mt-1 text-sm text-gray-500">Try adjusting your search query or role filters.</p>
      </div>
    </div>
    <div id="player-details" :class="['w-full md:w-1/4 p-4 bg-gray-900 text-white px-8 sticky top-0 h-screen overflow-y-auto', { 'hidden md:block': activeTab !== 'details' }]">
      <active-player-details :player="activePlayer" v-if="activePlayer" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { usePlayersStore } from '../store/players'
import PlayerCard from './PlayerCard.vue'
import ActivePlayerDetails from './ActivePlayerDetails.vue'
import LeftSidebar from './LeftSidebar.vue'


const store = usePlayersStore()
const { players, searchQuery, selectedRoles, filteredPlayers, boughtPlayers, activePlayerId } = storeToRefs(store)

const searchInput = ref(null)
const activeTab = ref('players')

const activePlayer = computed(() => {
  return players.value.find(player => player.id === activePlayerId.value)
})

const roles = [
  { code: 'pc', name: 'Punta' },
  { code: 'a', name: 'Attaccante' },
  { code: 't', name: 'Trequartista' },
  { code: 'w', name: 'Ala' },
  { code: 'c', name: 'Centrocampista centrale' },
  { code: 'm', name: 'Mediano' },
  { code: 'e', name: 'Esterno' },
  { code: 'ds', name: 'Difensore sinistro' },
  { code: 'dd', name: 'Difensore destro' },
  { code: 'b', name: 'Braccetto' },
  { code: 'dc', name: 'Difensore centrale' },
  { code: 'por', name: 'Portiere' },
]

const focusSearch = () => {
  if (searchInput.value) {
    searchInput.value.focus()
  }
}

const toggleRole = (role) => {
  if(selectedRoles.value.length > 0 && selectedRoles.value.includes(role)) {
    selectedRoles.value = selectedRoles.value.filter(r => r !== role)
    return
  }
  selectedRoles.value = [role]
}


const toggleBoughtFilter = () => {
  store.toggleBoughtFilter()
}
const toggleFavouriteFilter = () => {
  store.toggleFavouriteFilter()
}

const toggleTakenFilter = () => {
  store.toggleTakenFilter()
}

const toggleAvailableFilter = () => {
  store.toggleAvailableFilter()
}
const resetPlayerStatusFilters = () => {
  store.resetPlayerStatusFilters()
}

const getRoleClass = (role) => {
  const roleLower = role.toLowerCase()
  if (['a', 'pc'].includes(roleLower)) return 'bg-red-200 text-red-700'
  if (['w', 't'].includes(roleLower)) return 'bg-purple-200 text-purple-700'
  if (['c', 'm', 'e'].includes(roleLower)) return 'bg-blue-200 text-blue-700'
  if (['ds', 'dd', 'b', 'dc'].includes(roleLower)) return 'bg-green-200 text-green-700'
  if (['por'].includes(roleLower)) return 'bg-orange-200 text-orange-700'
  return ''
}

const formatRole = (role) => {
  return role.trim().charAt(0).toUpperCase() + role.trim().slice(1).toLowerCase()
}

const isFilterActive = computed(() => {
  return searchQuery.value !== '' ||
         selectedRoles.value.length > 0 ||
         store.showBought ||
         store.showFavourite ||
         store.showTaken ||
         store.showAvailable ||
         store.orderBy !== 'fvm_mantra'
})


/*
onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if (e.metaKey && e.key === 'k') {
      e.preventDefault()
      focusSearch()
    }
  })
})
*/
</script>
