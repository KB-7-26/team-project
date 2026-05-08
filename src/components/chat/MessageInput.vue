<script setup>
import { ref } from 'vue'

const emit = defineEmits(['send'])
const newMessage = ref('')

function sendMessage() {
  if (!newMessage.value.trim()) return
  emit('send', newMessage.value)
  newMessage.value = ''
}
</script>

<template>
  <div class="flex gap-2 px-4 py-3 border-t border-border bg-white shrink-0">
    <input
      v-model="newMessage"
      type="text"
      placeholder="메시지를 입력하세요"
      class="flex-1 px-3.5 py-2.5 border border-border rounded-3xl text-sm outline-none focus:border-primary"
      @keyup.enter="sendMessage"
    />
    <button
      class="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-3xl text-sm font-semibold cursor-pointer transition-colors"
      @click="sendMessage"
    >
      전송
    </button>
  </div>
</template>
