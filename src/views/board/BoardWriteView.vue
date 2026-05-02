<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'

const router = useRouter()

const title = ref('')
const content = ref('')
const titleError = ref(false)
const contentError = ref(false)

const submit = () => {
  titleError.value = !title.value.trim()
  contentError.value = !content.value.trim()
  if (titleError.value || contentError.value) return

  // 백엔드 연결 시 POST /api/board 호출
  router.push('/board')
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 py-8">
    <button
      @click="router.back()"
      class="flex items-center gap-1.5 text-sm text-text-sub hover:text-text-main mb-6 transition-colors cursor-pointer"
    >
      <ArrowLeftIcon class="w-4 h-4" />
      목록으로
    </button>

    <h1 class="text-2xl font-extrabold text-text-main mb-8">게시글 작성</h1>

    <div class="flex flex-col gap-5">
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-semibold text-text-main">제목</label>
        <input
          v-model="title"
          @input="titleError = false"
          type="text"
          placeholder="제목을 입력하세요"
          class="px-4 py-3 border rounded-xl text-sm text-text-main outline-none transition-colors"
          :class="titleError ? 'border-red-400 focus:border-red-400' : 'border-border focus:border-primary'"
        />
        <p v-if="titleError" class="text-xs text-red-400">제목을 입력해주세요</p>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-semibold text-text-main">내용</label>
        <textarea
          v-model="content"
          @input="contentError = false"
          placeholder="내용을 입력하세요"
          rows="12"
          class="px-4 py-3 border rounded-xl text-sm text-text-main outline-none transition-colors resize-none"
          :class="contentError ? 'border-red-400 focus:border-red-400' : 'border-border focus:border-primary'"
        />
        <p v-if="contentError" class="text-xs text-red-400">내용을 입력해주세요</p>
      </div>

      <div class="flex justify-end gap-3">
        <button
          @click="router.back()"
          class="px-5 py-2.5 border border-border text-sm font-semibold text-text-main rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
        >
          취소
        </button>
        <button
          @click="submit"
          class="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
        >
          등록
        </button>
      </div>
    </div>
  </div>
</template>
