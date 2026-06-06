<script setup>
import { CheckCircleIcon, XCircleIcon } from '@heroicons/vue/24/outline'
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-4"
  >
    <div
      v-if="toast.visible"
      class="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-lg text-sm font-medium whitespace-nowrap"
      :class="toast.type === 'success'
        ? 'bg-gray-900 text-white'
        : 'bg-red-500 text-white'"
    >
      <CheckCircleIcon v-if="toast.type === 'success'" class="w-4 h-4 shrink-0" />
      <XCircleIcon v-else class="w-4 h-4 shrink-0" />
      {{ toast.message }}
    </div>
  </Transition>
</template>
