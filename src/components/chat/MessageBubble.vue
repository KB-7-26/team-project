<script setup>
defineProps({
  senderType: String,
  content: String,
  createdAt: String,
  isUnread: Boolean,
  showTime: { type: Boolean, default: true },
  showProfile: { type: Boolean, default: true },
})
</script>

<template>
  <div :class="['flex items-end gap-2', senderType === 'me' ? 'justify-end' : 'justify-start']">
    <!-- 상대방 아바타 -->
    <div v-if="senderType === 'other'" class="w-8 shrink-0">
      <div v-if="showProfile" class="w-8 h-8 rounded-full bg-[#c8bca8] border-2 border-ink overflow-hidden shadow-[1px_1px_0_#1c1712]">
        <img src="https://picsum.photos/seed/user/32/32" class="w-full h-full object-cover" />
      </div>
    </div>

    <!-- 내 메시지: 시간/읽음 왼쪽, 버블 오른쪽 -->
    <template v-if="senderType === 'me'">
      <div v-if="showTime || isUnread" class="flex flex-col items-end justify-end shrink-0">
        <span v-if="isUnread" class="text-[10px] text-[#8c7e6e]">1</span>
        <span v-if="showTime" class="text-[11px] text-[#8c7e6e]">{{ createdAt }}</span>
      </div>
      <p class="max-w-[62%] px-3.5 py-2.5 text-sm leading-relaxed border-2 border-ink bg-[#ffe066] text-ink rounded-2xl rounded-br-sm shadow-[2px_2px_0_#1c1712]">
        {{ content }}
      </p>
    </template>

    <!-- 상대 메시지: 버블 왼쪽, 시간 오른쪽 -->
    <template v-else>
      <p class="max-w-[62%] px-3.5 py-2.5 text-sm leading-relaxed border-2 border-ink bg-[#a8c8e8] text-ink rounded-2xl rounded-bl-sm shadow-[2px_2px_0_#1c1712]">
        {{ content }}
      </p>
      <div v-if="showTime" class="flex flex-col justify-end shrink-0">
        <span class="text-[11px] text-[#8c7e6e]">{{ createdAt }}</span>
      </div>
    </template>
  </div>
</template>
