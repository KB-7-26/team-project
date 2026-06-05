<script setup>
import { ref } from 'vue'
import { ChatBubbleOvalLeftIcon, PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { formatDate } from '@/utils/formatDate'

const props = defineProps({
  comment: Object,
  isReply: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['reply-click', 'update', 'delete'])

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
    :class="[isReply ? 'ml-6 pl-4 border-l-2 border-border' : 'hover:bg-primary/5 rounded-xl']"
  >
    <div class="flex items-center gap-2 mb-1.5">
      <span v-if="isReply" class="text-xs text-text-sub">↳</span>
      <span class="text-xs font-medium text-primary">{{ comment.displayName }}</span>
      <span class="text-xs text-text-sub">{{ formatDate(comment.createdAt) }}</span>
      <div v-if="comment.isOwner" class="flex items-center gap-1.5 ml-auto">
        <button
          @click="startEdit"
          class="flex items-center gap-0.5 text-xs text-text-sub hover:text-text-main transition-colors cursor-pointer"
        >
          <PencilSquareIcon class="w-3.5 h-3.5" />
          수정
        </button>
        <button
          @click="emit('delete', comment.id)"
          class="flex items-center gap-0.5 text-xs text-red-400 hover:text-red-600 transition-colors cursor-pointer"
        >
          <TrashIcon class="w-3.5 h-3.5" />
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
        class="flex-1 px-4 py-2 border border-border rounded-xl text-sm text-text-main outline-none focus:border-primary transition-colors"
        autofocus
      />
      <button
        @click="submitEdit"
        class="bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shrink-0 cursor-pointer"
      >
        저장
      </button>
      <button
        @click="cancelEdit"
        class="text-sm text-text-sub hover:text-text-main px-3 py-2 rounded-xl border border-border transition-colors cursor-pointer"
      >
        취소
      </button>
    </div>

    <div v-else class="flex items-center justify-between gap-4">
      <p class="text-sm text-text-main leading-relaxed flex-1">{{ comment.content }}</p>
      <button
        v-if="!isReply"
        @click="emit('reply-click', comment)"
        class="flex items-center gap-1 text-xs text-text-sub hover:text-primary transition-colors shrink-0 cursor-pointer"
      >
        <ChatBubbleOvalLeftIcon class="w-4 h-4" />
        {{ comment.replies?.length ?? 0 }}
      </button>
    </div>
  </div>
</template>
