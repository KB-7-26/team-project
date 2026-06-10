<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({ chatRoomId: [Number, String] })
const emit = defineEmits(['send'])
const newMessage = ref('')
const textareaRef = ref(null)

// textarea 높이 자동 조절
async function autoResize() {
  await nextTick()
  if (!textareaRef.value) return
  textareaRef.value.style.height = 'auto'
  textareaRef.value.style.height = Math.min(textareaRef.value.scrollHeight, 120) + 'px'
}

// 채팅방 바뀌면 입력란 초기화
watch(() => props.chatRoomId, async () => {
  newMessage.value = ''
  await nextTick()
  if (textareaRef.value) textareaRef.value.style.height = 'auto'
})

function sendMessage() {
  if (!newMessage.value.trim()) return
  emit('send', newMessage.value)
  newMessage.value = ''
  if (textareaRef.value) textareaRef.value.style.height = 'auto'
}

// Shift+Enter → 줄바꿈, Enter → 전송
function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}
</script>

<template>
  <div class="flex gap-2 px-4 py-3 border-t-2 border-ink bg-[#eef7f2] shrink-0">
    <textarea
      ref="textareaRef"
      v-model="newMessage"
      placeholder="메시지를 입력하세요"
      rows="1"
      class="flex-1 px-4 py-2.5 border-2 border-[#c8bca8] rounded-2xl text-sm text-ink placeholder:text-[#c8bca8] outline-none focus:border-ink bg-white transition-colors resize-none overflow-hidden"
      @keydown="handleKeydown"
      @input="autoResize"
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
