<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import { boardApi } from '@/api/boardApi'

const router = useRouter()

const title = ref('')
const content = ref('')
const isAnonymous = ref(false)
const titleError = ref(false)
const contentError = ref(false)
const isSubmitting = ref(false)

const submit = async () => {
  titleError.value = !title.value.trim()
  contentError.value = !content.value.trim()
  if (titleError.value || contentError.value) return

  try {
    isSubmitting.value = true
    const post = await boardApi.createPost(title.value.trim(), content.value.trim(), isAnonymous.value)
    router.push(`/board/${post.id}`)
  } catch (e) {
    if (e.response?.status === 401) {
      router.push('/login')
    } else {
      alert('게시글 등록에 실패했습니다. 다시 시도해주세요.')
    }
  } finally {
    isSubmitting.value = false
  }
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

      <div class="flex items-center gap-2">
        <input id="isAnonymous" v-model="isAnonymous" type="checkbox" class="w-4 h-4 accent-primary cursor-pointer" />
        <label for="isAnonymous" class="text-sm text-text-main cursor-pointer">익명으로 작성</label>
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
          :disabled="isSubmitting"
          class="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isSubmitting ? '등록 중...' : '등록' }}
        </button>
      </div>
    </div>
  </div>
</template>
