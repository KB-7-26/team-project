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
  <div class="flex gap-2 px-4 py-3 border-t-2 border-ink bg-[#eef7f2] shrink-0">
    <input
      v-model="newMessage"
      type="text"
      placeholder="메시지를 입력하세요"
      class="flex-1 px-4 py-2.5 border-2 border-[#c8bca8] rounded-2xl text-sm text-ink placeholder:text-[#c8bca8] outline-none focus:border-ink bg-white transition-colors"
      @keyup.enter="sendMessage"
    />
    <button
      :disabled="!newMessage.trim()"
      :class="[
        'send-btn px-5 py-2.5 border-2 rounded-2xl text-sm font-bold transition-all',
        newMessage.trim()
          ? 'bg-[#ffe066] border-ink text-ink cursor-pointer shadow-[2px_2px_0_#1c1712]'
          : 'bg-[#c8bca8] border-[#c8bca8] text-white cursor-not-allowed shadow-none',
      ]"
      @click="sendMessage"
    >
      전송
    </button>
  </div>
</template>

<style scoped>
.send-btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 #1c1712;
}
.send-btn:active {
  transform: translate(2px, 2px);
  box-shadow: none;
}
</style>
