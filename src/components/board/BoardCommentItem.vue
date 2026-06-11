<script setup>
import { ref } from 'vue'
import { ChatBubbleOvalLeftIcon, PencilSquareIcon, TrashIcon, HeartIcon } from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'
import { formatDate } from '@/utils/formatDate'

const props = defineProps({
  comment: Object,
  isReply: {
    type: Boolean,
    default: false,
  },
  liked: {
    type: Boolean,
    default: false,
  },
  likeCount: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['reply-click', 'update', 'delete', 'like'])

const isEditing = ref(false)
const editContent = ref('')

const startEdit = () => {
  editContent.value = props.comment.content
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  editContent.value = ''
}

const submitEdit = () => {
  if (!editContent.value.trim()) return
  emit('update', props.comment.id, editContent.value.trim())
  isEditing.value = false
}
</script>

<template>
  <div
    class="py-4 px-2"
    :class="[isReply ? 'ml-6 pl-4 border-l-2 border-[#96d4b4]' : 'hover:bg-[#fffef5] rounded-xl']"
  >
    <div class="flex items-center gap-2 mb-1.5">
      <span v-if="isReply" class="text-xs text-[#8c7e6e]">↳</span>
      <span class="text-xs font-bold text-[#2d5a48] bg-[#96d4b4]/30 px-2 py-0.5 rounded-full">{{ comment.displayName }}</span>
      <span class="text-xs text-[#8c7e6e]">{{ formatDate(comment.createdAt) }}</span>
      <div v-if="comment.isOwner" class="flex items-center gap-1.5 ml-auto">
        <button
          @click="startEdit"
          class="flex items-center gap-0.5 text-xs text-[#8c7e6e] hover:text-ink border border-[#c8bca8] hover:border-ink px-2 py-0.5 rounded-lg transition-all cursor-pointer font-medium"
        >
          <PencilSquareIcon class="w-3 h-3" />
          수정
        </button>
        <button
          @click="emit('delete', comment.id)"
          class="flex items-center gap-0.5 text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 px-2 py-0.5 rounded-lg transition-all cursor-pointer font-medium"
        >
          <TrashIcon class="w-3 h-3" />
          삭제
        </button>
      </div>
    </div>

    <div v-if="isEditing" class="flex gap-2 mt-1">
      <input
        v-model="editContent"
        @keyup.enter="submitEdit"
        @keyup.esc="cancelEdit"
        type="text"
        class="flex-1 px-4 py-2 border-2 border-[#c8bca8] focus:border-ink rounded-xl text-sm text-ink outline-none transition-colors"
        autofocus
      />
      <button
        @click="submitEdit"
        class="bg-[#ffe066] border-2 border-ink text-ink text-sm font-bold px-4 py-2 rounded-xl shadow-[2px_2px_0_#1c1712] hover:-translate-y-0.5 transition-all shrink-0 cursor-pointer"
      >
        저장
      </button>
      <button
        @click="cancelEdit"
        class="text-sm text-[#8c7e6e] hover:text-ink px-3 py-2 rounded-xl border-2 border-[#c8bca8] hover:border-ink transition-all cursor-pointer font-bold"
      >
        취소
      </button>
    </div>

    <div v-else class="flex items-center justify-between gap-4">
      <p class="text-sm text-ink leading-relaxed flex-1">{{ comment.content }}</p>
      <div class="flex items-center gap-2 shrink-0">
        <button
          @click="emit('like', comment.id)"
          class="flex items-center gap-1 text-xs font-medium transition-all cursor-pointer px-2 py-1 rounded-lg border"
          :class="liked
            ? 'text-red-400 border-red-200 bg-red-50 hover:bg-red-100'
            : 'text-[#8c7e6e] border-[#e8e0d4] hover:border-red-200 hover:text-red-400 hover:bg-red-50'"
        >
          <component :is="liked ? HeartSolidIcon : HeartIcon" class="w-3.5 h-3.5" />
          {{ likeCount }}
        </button>
        <button
          v-if="!isReply"
          @click="emit('reply-click', comment)"
          class="flex items-center gap-1 text-xs text-[#8c7e6e] hover:text-[#2d5a48] border border-[#e8e0d4] hover:border-[#96d4b4] px-2 py-1 rounded-lg transition-all cursor-pointer font-medium"
        >
          <ChatBubbleOvalLeftIcon class="w-3.5 h-3.5" />
          {{ comment.replies?.length ?? 0 }}
        </button>
      </div>
    </div>
  </div>
</template>
