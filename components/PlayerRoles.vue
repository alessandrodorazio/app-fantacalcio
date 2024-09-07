<template>
  <div class="flex flex-wrap gap-2">
    <span v-for="role in roles" :key="role"
          :class="getRoleClass(role)">
      {{ formatRole(role) }}
    </span>
  </div>
</template>

<script setup>
const props = defineProps({
  roles: {
    type: Array,
    required: true
  }
})

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
</script>
