<script setup>
defineProps({
  senderType: String,
  content: String,
  createdAt: String,
})
</script>

<template>
  <div :class="['flex items-end gap-2', senderType === 'me' ? 'justify-end' : 'justify-start']">
    <div v-if="senderType === 'other'" class="w-8 h-8 rounded-full bg-border shrink-0 overflow-hidden">
      <img src="https://picsum.photos/seed/user/32/32" class="w-full h-full object-cover" />
    </div>

    <div :class="['max-w-[60%] flex flex-col', senderType === 'me' ? 'items-end' : 'items-start']">
      <p
        :class="[
          'px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed m-0',
          senderType === 'me'
            ? 'bg-primary text-white rounded-br-[4px]'
            : 'bg-white text-text-main border border-border rounded-bl-[4px]',
        ]"
      >
        {{ content }}
      </p>
      <span class="text-[11px] text-text-sub mt-1">{{ createdAt }}</span>
    </div>
  </div>
</template>
