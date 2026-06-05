<script setup>
defineProps({
  senderType: String,
  content: String,
  createdAt: String,
  isRead: Boolean,
})
</script>

<template>
  <div :class="['flex items-end gap-2', senderType === 'me' ? 'justify-end' : 'justify-start']">
    <!-- 상대방 아바타 -->
    <div v-if="senderType === 'other'" class="w-8 h-8 rounded-full bg-[#c8bca8] border-2 border-ink shrink-0 overflow-hidden shadow-[1px_1px_0_#1c1712]">
      <img src="https://picsum.photos/seed/user/32/32" class="w-full h-full object-cover" />
    </div>

    <div :class="['max-w-[62%] flex flex-col', senderType === 'me' ? 'items-end' : 'items-start']">
      <!-- 읽음 표시 (내 메시지) -->
      <span v-if="senderType === 'me' && isRead" class="text-[10px] text-[#8c7e6e] mb-0.5 font-bold">
        읽음
      </span>
      <!-- 말풍선 -->
      <p
        :class="[
          'px-3.5 py-2.5 text-sm leading-relaxed m-0 border-2 border-ink',
          senderType === 'me'
            ? 'bg-[#ffe066] text-ink rounded-2xl rounded-br-sm shadow-[2px_2px_0_#1c1712]'
            : 'bg-white text-ink rounded-2xl rounded-bl-sm shadow-[2px_2px_0_#1c1712]',
        ]"
      >
        {{ content }}
      </p>
      <span class="text-[11px] text-[#8c7e6e] mt-1">{{ createdAt }}</span>
    </div>
  </div>
</template>
