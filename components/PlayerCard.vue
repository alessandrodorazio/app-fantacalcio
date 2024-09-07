<template>
  <div class="rounded-lg shadow-md overflow-hidden transition-transform duration-200 ease-in-out relative focus:outline-none card-pointer"
       :class="[
         isTaken ? 'bg-red-500 border-4 border-red-700 opacity-50' :
         isBought ? 'bg-green-500 border-4 border-green-700' :
         isFavourite ? 'bg-yellow-500 border-4 border-yellow-700' :
         'bg-gray-800 border-2 border-gray-600',
          activePlayerId === player.id ? 'ring-2 md:ring-8 ring-blue-500' : ''
       ]"
       tabindex="0"
       @keydown.f="toggleFavourite"
       @keydown.t="toggleTaken"
       @keydown.b="toggleBought"
       @click="setActivePlayer"
       @focus="setActivePlayer">
    <img :src="player.image_url" :alt="player.name" class="w-full h-auto rounded-t-lg">
    <div class="absolute top-20 md:top-36 left-0 font-medium">
        <div v-for="(trait, index) in playerTraits" :key="index" class="mb-4">
            <div :class="getTraitClass(trait.type)" class="rounded-r-md px-1 py-1 inline">
                <span v-if="trait.type === 'trend'" class="text-sm">{{ trait.value }}%</span>
                <span v-else-if="trait.type === 'titolarita'" class="text-sm">{{ trait.value }}</span>
                <span v-else-if="trait.type === 'fantamedia'" class="text-base">
                <font-awesome :icon="faCheckToSlot" /> {{ trait.value }}

                </span>
                <font-awesome v-else-if="trait.type === 'injured'" :icon="faSuitcaseMedical"  />
            </div>
        </div>
    </div>
    <div class="absolute top-0 left-0 right-0 px-1 md:px-4 pt-1 pb-7 bg-gradient-to-b from-indigo-900 via-indigo-800 to-transparent">
      <div class="flex justify-between items-center">
      <player-roles :roles="player.role_mantra.split('|')" class="max-md:scale-75"/>
        <p class="text-xs md:text-sm font-bold text-center">{{ player.name }}<br> ({{player.team}})</p>
        <div class="p-2 text-center">
          <span class="text-lg md:text-3xl font-bold text-white">{{ player.fvm_mantra }}</span>
        </div>
      </div>
    </div>
    <div class="p-4 !pt-0">
      <div :class="[
        isTaken ? 'bg-red-600 shadow-lg shadow-red-700/50' :
        isBought ? 'bg-green-600 shadow-lg shadow-green-700/50' :
        isFavourite ? 'bg-yellow-600 shadow-lg shadow-yellow-700/50' :
        'bg-gray-700 shadow-gray-700/50 shadow-lg',
        'rounded-lg p-3'
      ]">
        <div class="grid grid-cols-5 gap-2">
          <div class="flex flex-col items-center">
            <font-awesome :icon="faUser" class="text-lg mb-1" />
            <span class="text-sm font-semibold">{{ player.partite_a_voto }}</span>
          </div>
          <div class="flex flex-col items-center">
            <font-awesome :icon="faFutbol" class="text-lg mb-1" />
            <span class="text-sm font-semibold">{{ player.gol }}</span>
          </div>
          <div class="flex flex-col items-center">
            <font-awesome :icon="faArrowRight" class="text-lg mb-1" />
            <span class="text-sm font-semibold">{{ player.assist }}</span>
          </div>
          <div class="flex flex-col items-center">
            <font-awesome :icon="faSquare" class="text-yellow-400 text-lg mb-1" />
            <span class="text-sm font-semibold">{{ player.ammonizioni }}</span>
          </div>
          <div class="flex flex-col items-center">
            <font-awesome :icon="faSquare" class="text-red-500 text-lg mb-1" />
            <span class="text-sm font-semibold">{{ player.espulsioni }}</span>
          </div>
        </div>
      </div>
      <div class="mt-4 flex justify-center">
        <div class="flex justify-center items-center text-lg" :class="[
          isTaken ? 'bg-red-600 shadow-lg shadow-red-700/50' :
          isBought ? 'bg-green-600 shadow-lg shadow-green-700/50' :
          isFavourite ? 'bg-yellow-600 shadow-lg shadow-yellow-700/50' :
          'bg-gray-700 shadow-gray-700/50 shadow-lg',
          'rounded-lg p-3'
        ]">
          <font-awesome
            v-for="i in 5"
            :key="i"
            :icon="faStar"
            :class="[i <= player.my_valuation ? 'text-yellow-400' : 'text-gray-400', 'cursor-pointer']"
            @click="setValuation(i)"
          />
        </div>
        <!--
        <div class="flex justify-center items-center">
          <input
            type="number"
            v-model.lazy="player.buy_threshold"
            @blur="debouncedSetBuyThreshold($event.target.value)"
            class="w-20 p-2 rounded-lg bg-gray-700 text-white"
            placeholder="0"
            tabindex="-1"
          >
        </div>
        -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { faArrowRight, faFutbol, faUser, faSquare, faStar, faSuitcaseMedical, faArrowTrendUp, faArrowTrendDown, faCheckToSlot } from '@fortawesome/free-solid-svg-icons'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { usePlayersStore } from '../store/players'
import PlayerRoles from './PlayerRoles.vue'
import pkg from 'lodash';
const { debounce } = pkg;
const store = usePlayersStore()
const { activePlayerId, meanFmForRole } = storeToRefs(store)

const props = defineProps({
  playerId: {
    type: [String, Number],
    required: true
  }
})

const player = computed(() => store.getPlayerById(props.playerId))

const isFavourite = computed(() => player.value.favourite)
const isTaken = computed(() => player.value.taken)
const isBought = computed(() => player.value.bought)

const playerTraits = computed(() => {
  const traits = []
  traits.push({ type: 'fantamedia', value: player.value.fm })

  if (player.value.is_injured) {
    traits.push({ type: 'injured' })
  }
  const trend = Math.round((player.value.current_price_mantra - player.value.initial_price_mantra) / player.value.initial_price_mantra * 100)
  if (trend !== 0) {
    if (trend > 0) {
      traits.push({ type: 'trend', value: `+${trend}` })
    } else {
      traits.push({ type: 'trend', value: trend })
    }
  }
  if (player.value.titolarita > 0.70) {
    traits.push({ type: 'titolarita', value: 'TIT' })
  } else if (player.value.titolarita < 0.30) {
    traits.push({ type: 'titolarita', value: 'RIS' })
  }
  return traits
})

const getTraitClass = (type) => {
  if (type === 'injured') return 'bg-red-700'
  if (type === 'trend') return parseFloat(playerTraits.value.find(t => t.type === 'trend').value) >= 0 ? 'bg-green-700' : 'bg-red-700'
  if (type === 'titolarita') return player.value.titolarita > 0.70 ? 'bg-green-700' : 'bg-red-700'
  if (type === 'fantamedia') {
    const fm = parseFloat(player.value.fm)
    const meanFm = Math.round(meanFmForRole.value[player.value.role_mantra.split('|')[0]])
    const diff = fm - meanFm
    if (diff > 3) return 'bg-green-900'
    if (diff > 1.5) return 'bg-green-700'
    if (diff > 0) return 'bg-green-600'
    if (diff > -1) return 'bg-yellow-600'
    if (diff > -2) return 'bg-red-500'
    return 'bg-red-700'
  }
  return ''
}

const getTraitIcon = (type) => {
  if (type === 'injured') return faSuitcaseMedical
  return null
}

const getRoleClass = (role) => {
  const baseClass = 'text-base px-2 py-1 rounded-full font-semibold w-8 h-8 grid place-content-center leading-none'
  const roleLower = role.trim().toLowerCase()
  if (['a', 'pc'].includes(roleLower)) return `${baseClass} bg-red-200 text-red-700`
  if (['w', 't'].includes(roleLower)) return `${baseClass} bg-purple-200 text-purple-700`
  if (['c', 'm', 'e'].includes(roleLower)) return `${baseClass} bg-blue-200 text-blue-700`
  if (['ds', 'dd', 'b', 'dc'].includes(roleLower)) return `${baseClass} bg-green-200 text-green-700`
  if (['por'].includes(roleLower)) return `${baseClass} bg-orange-200 text-orange-700`
  return baseClass
}

const formatRole = (role) => {
  return role.trim().charAt(0).toUpperCase() + role.trim().slice(1).toLowerCase()
}

const toggleFavourite = () => store.toggleFavourite(props.playerId)
const toggleTaken = () => store.toggleTaken(props.playerId)
const toggleBought = () => store.toggleBought(props.playerId)
const setValuation = (value) => store.setValuation(props.playerId, value)
const setBuyThreshold = (value) => store.setBuyThreshold(props.playerId, value)

const debouncedSetBuyThreshold = debounce((value) => {
  setBuyThreshold(value ?? 0)
}, 500)

const setActivePlayer = () => {
  store.activePlayerId = props.playerId
}

const handleClickOutside = (event) => {
  if (store.activePlayerId === props.playerId && !event.target.closest('.rounded-lg') && !event.target.closest('#player-details') && !event.target.closest('.player-name-bought-list') && !event.target.closest('#tab-selector')) {
    store.activePlayerId = null
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
