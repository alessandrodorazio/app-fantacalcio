<template>
  <div class="w-full md:w-1/4 bg-gray-900 text-white p-4 px-8 md:sticky top-0 md:h-screen overflow-y-auto">
    <div class="relative md:mt-8">
      <input
        v-model="searchQuery"
        @input="store.setSearchQuery"
        @keydown.meta.k.prevent="focusSearch"
        placeholder="Cerca giocatori"
        class="w-full pl-10 pr-4 py-2 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-800 text-white"
        ref="searchInput"
      />
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <span class="text-sm text-gray-400 bg-gray-700 rounded-md px-2 py-1">Cmd + K</span>
      </div>
    </div>
    <div class="flex flex-wrap gap-4 mt-2 justify-center bg-gray-800 py-4 rounded-md">
      <button
        v-for="role in roles"
        :key="role.code"
        @click="toggleRole(role.code)"
        :class="[
          'text-base px-2 py-1 rounded-full font-semibold w-10 h-10 grid place-content-center leading-none',
          getRoleClass(role.code),
          selectedRoles.includes(role.code) ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-white' : ''
        ]"
        tabindex="-1"
      >
        {{ formatRole(role.code) }}
      </button>
    </div>
    <div class="mt-2">
      <select
        v-model="selectedTeam"
        @change="store.setSelectedTeam($event.target.value)"
        class="w-full p-2 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-800 text-white"
      >
        <option value="">Select Team</option>
        <option v-for="team in teams" :key="team" :value="team">{{ team }}</option>
      </select>
    </div>
    <div class="overflow-y-scroll max-h-[700px] mt-2">
      <template v-for="(role, index) in roles" :key="role.code">
        <div v-if="getPlayersByRole(role.code).length > 0" class="bg-gray-800 mb-1 rounded-md">
          <div @click="toggleRoleExpand(role.code)" class="flex justify-between items-center pt-3 pb-3 px-4 cursor-pointer">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <span :class="[
                'text-base px-2 py-1 rounded-full font-semibold w-8 h-8 grid place-content-center leading-none',
                getRoleClass(role.code)
              ]">
                {{ formatRole(role.code) }}
              </span>
            </h3>
            <span class="text-sm text-gray-400 gap-2 flex">
              <span class="min-w-[30px]">{{ getPlayersByRole(role.code).length }}<font-awesome :icon="faUser" class="ml-1" /> </span>
              <span class="min-w-[30px]">{{ getTotalSpentByRole(role.code) }}<font-awesome :icon="faCoins" class="ml-1" /> </span>
            </span>
          </div>
          <div v-show="!isRoleCollapsed(role.code)">
            <div v-for="player in getPlayersByRole(role.code)" :key="player.id" class="py-2 px-4 border-b border-gray-900">
              <div class="flex gap-4 items-center">
                <div class="flex items-center gap-2">
                  <span v-for="otherRole in player.role_mantra.split('|')" :key="otherRole" :class="[
                    'text-xs w-5 h-5 grid place-content-center rounded-full font-semibold',
                    getRoleClass(otherRole)
                  ]">
                    {{ formatRole(otherRole) }}
                  </span>
                </div>
                <span class="text-base flex-grow player-name-bought-list hover:underline hover:cursor-pointer" @click="setActivePlayerId(player.id)">{{player.name}} ({{player.team}})</span>
                <div>{{player.amount_paid}}</div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
    <div class="absolute bottom-0 left-0 p-2 bg-gray-800 rounded-tr-md text-xs text-gray-400">
      <span class="inline-block px-2 py-1 bg-gray-700 rounded mr-1">[b]ought</span>
      <span class="inline-block px-2 py-1 bg-gray-700 rounded mr-1">[f]avourite</span>
      <span class="inline-block px-2 py-1 bg-gray-700 rounded mr-1">[t]aken</span>
      <span class="inline-block px-2 py-1 bg-gray-700 rounded">[p]rice</span>
    </div>

    <div class="absolute bottom-0 right-0 ml-4 z-30 p-2 bg-gray-800 rounded-tl-md text-3xl text-gray-400">
      <span class=" px-2 py-1 ">{{ remainingCredits }}<span class="text-lg">/{{ budget }}</span></span>
    </div>
    </div>
</template>

<script setup>
import { faUser, faCoins } from '@fortawesome/free-solid-svg-icons'
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { usePlayersStore } from '../store/players'
import pkg from 'lodash';
const { debounce } = pkg;

const store = usePlayersStore()
const { searchQuery, selectedRoles, boughtPlayers, remainingCredits, budget, activePlayerId, selectedTeam, teams } = storeToRefs(store)

const searchInput = ref(null)
const collapsedRoles = ref(['pc', 'a', 't', 'w', 'c', 'm', 'e', 'ds', 'dd', 'b', 'dc', 'por'])

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
  searchInput.value.focus()
  // select the text
  searchInput.value.select()
}

const toggleRole = (role) => {
  if(selectedRoles.value.length > 0 && selectedRoles.value.includes(role)) {
    selectedRoles.value = selectedRoles.value.filter(r => r !== role)
    return
  }
  selectedRoles.value = [role]
}

const setAmountPaid = (playerId, amount) => {
  store.setAmountPaid(playerId, amount)
}

const debounceSetAmountPaid = debounce((playerId, amount) => {
  setAmountPaid(playerId, amount)
}, 1000)

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

const getPlayersByRole = (role) => {
  return boughtPlayers.value.filter(player => player.role_mantra.split('|')[0] === role)
}

const getTotalSpentByRole = (role) => {
  return getPlayersByRole(role).reduce((total, player) => total + (player.amount_paid || 0), 0)
}

const setActivePlayerId = (playerId) => {
  return store.setActivePlayerId(playerId)
}

const getOtherRoles = (player, currentRole) => {
  return player.role_mantra.split('|').filter(role => role !== currentRole)
}

const toggleRoleExpand = (role) => {
  if (collapsedRoles.value.includes(role)) {
    collapsedRoles.value = collapsedRoles.value.filter(r => r !== role)
  } else {
    collapsedRoles.value.push(role)
  }
}

const isRoleCollapsed = (role) => {
  return collapsedRoles.value.includes(role)
}

onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if (e.metaKey && e.key === 'k') {
      e.preventDefault()
      focusSearch()
    }
  })
})

</script>
