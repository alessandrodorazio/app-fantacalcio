<template>
  <div v-if="player" class="mt-8 relative h-full">
    <div class="flex items-center mb-4">
      <img :src="player.image_url" :alt="player.name" class="w-16 mr-4">
      <div>
        <h2 class="text-xl font-bold mb-2">{{ player.name }}</h2>
        <player-roles :roles="player.role_mantra.split('|')" />
      </div>
    </div>
    <div class="grid grid-cols-4 gap-2 mt-4">
    <div class="flex justify-center items-center col-span-4">
      <div class="flex justify-center items-center gap-1 bg-gray-800 rounded-md px-3 py-4 w-full">
        <font-awesome
          v-for="i in 5"
          :key="i"
          :icon="faStar"
          :class="[i <= player.my_valuation ? 'text-yellow-400' : 'text-gray-400', 'cursor-pointer text-2xl']"
          @click="setValuation(i)"
        />
      </div>
    </div>
      <div class="bg-gray-800 p-3 rounded-lg text-center col-span-2">
        <div class="flex justify-around">
          <div>
            <div class="text-2xl font-bold">{{ player.initial_price_mantra }}</div>
            <div class="text-xs text-gray-400">Iniziale</div>
          </div>
          <div>
            <div class="text-2xl font-bold">{{ player.current_price_mantra }}</div>
            <div class="text-xs text-gray-400">Attuale</div>
          </div>
        </div>
      </div>
      <div class="bg-gray-800 p-3 rounded-lg text-center col-span-2" v-if="player.current_price_mantra !== player.initial_price_mantra">
        <div class="flex items-center justify-center">
          <span :class="player.current_price_mantra > player.initial_price_mantra ? 'text-green-500' : 'text-red-500'" class="text-2xl font-bold">
            {{ (player.current_price_mantra > player.initial_price_mantra ? '+' : '-') + Math.abs(Math.round((player.current_price_mantra - player.initial_price_mantra) / player.initial_price_mantra * 100)) }}%
          </span>
        </div>
        <div class="text-xs text-gray-400 mt-1">Trend di costo</div>
      </div>
      <div class="bg-gray-800 p-3 rounded-lg text-center col-span-4">
        <div class="text-2xl font-bold">{{ player.fvm_mantra }}</div>
        <div class="text-xs text-gray-400">FVM Mantra</div>
      </div>
      <div class="bg-gray-800 p-3 rounded-lg text-center col-span-2">
        <div class="flex justify-around">
          <div>
            <div class="text-2xl font-bold">{{ player.mv }}</div>
            <div class="text-xs text-gray-400">MV</div>
          </div>
          <div>
            <div class="text-2xl font-bold">{{ player.fm }}</div>
            <div class="text-xs text-gray-400">FM</div>
          </div>
        </div>
      </div>
      <div class="bg-gray-800 p-3 rounded-lg text-center col-span-2">
        <div class="text-2xl font-bold" :class="{
          'text-red-500': Math.round(player.titolarita * 100) <= 30,
          'text-green-500': Math.round(player.titolarita * 100) > 70
        }">
          {{ Math.round(player.titolarita * 100) }}%
        </div>
        <div class="text-xs text-gray-400">Titolarità</div>
      </div>
      <div class="bg-gray-800 p-3 rounded-lg text-center col-span-2" v-if="player.penalty">
        <div class="text-xl">
          Rigorista
        </div>
      </div>
      <div class="bg-gray-800 p-3 rounded-lg text-center col-span-2" v-if="player.penalty_kick">
        <div class="text-xl">
          Punizioni
        </div>
      </div>
    </div>

    <div class="mt-4 bg-gray-800 p-4 rounded-lg">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <div class="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center">
            <span class="text-white font-bold">AI</span>
          </div>
        </div>
        <div class="ml-3 text-sm">
          <p class="text-gray-300">{{ player.player_summary }}</p>
        </div>
      </div>
    </div>

    <div class="mt-4" v-if="player.bought">
      <div class="relative">
        <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">Costo</span>
        <input
          ref="amountPaidInput"
          v-model="player.amount_paid"
          @input="debounceSetAmountPaid(player.id, $event.target.value)"
          type="number"
          class="w-full pl-8 pr-3 py-2 bg-gray-800  rounded-md text-right text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0"
          tabindex="-1"
        />
      </div>
    </div>

    <div class="flex justify-center gap-2 md:absolute md:bottom-8 md:right-1/2 md:translate-x-1/2 w-full">
      <button @click="toggleBought" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
      tabindex="-1"

      :class="{'bg-green-700': player.bought}"
      >
        Comprato
      </button>
      <button @click="toggleFavourite" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded" :class="{'bg-yellow-600': player.favourite}" tabindex="-1">
        Preferito
      </button>
      <button @click="toggleTaken" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded" :class="{'bg-red-600': player.taken}" tabindex="-1">
        Preso da altri
      </button>
    </div>
  </div>
</template>

<script setup>
import PlayerRoles from './PlayerRoles.vue';
import { faStar} from '@fortawesome/free-solid-svg-icons'
import { onMounted, onUnmounted, ref } from 'vue';

import { usePlayersStore } from '../store/players'
import pkg from 'lodash';
const { debounce } = pkg;
const store = usePlayersStore()
const props = defineProps({
  player: {
    type: Object,
    required: true
  }
});
const amountPaidInput = ref(null);
const setValuation = (value) => store.setValuation(props.player.id, value)
const toggleFavourite = () => store.toggleFavourite(props.player.id)
const toggleTaken = () => store.toggleTaken(props.player.id)
const toggleBought = () => store.toggleBought(props.player.id)

const handleKeyDown = (event) => {
  if (event.key === 'Escape') {
    store.setActivePlayerId(null);
  } else if (event.key === 'p' && props.player && props.player.bought && !event.target.tagName.match(/INPUT|TEXTAREA/)) {
    amountPaidInput.value?.focus();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

const setAmountPaid = (playerId, amount) => {
  store.setAmountPaid(playerId, amount)
}

const debounceSetAmountPaid = debounce((playerId, amount) => {
  setAmountPaid(playerId, amount)
}, 1000)
</script>
