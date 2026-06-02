<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import { boardApi } from '@/api/boardApi'
import { useApiRequest } from '@/composables/useApiRequest'

const route = useRoute()
const router = useRouter()

const postId = Number(route.params.id)
const title = ref('')
const content = ref('')
const titleError = ref(false)
const contentError = ref(false)
const loading = ref(true)

const { isLoading: isSubmitting, error: submitError, request } = useApiRequest()

onMounted(async () => {
  try {
    const post = await boardApi.getPostById(postId)
    if (!post.isOwner) {
      router.replace(`/board/${postId}`)
      return
    }
    title.value = post.title
    content.value = post.content
  } catch {
    router.replace('/board')
  } finally {
    loading.value = false
  }
})

const submit = async () => {
  titleError.value = !title.value.trim()
  contentError.value = !content.value.trim()
  if (titleError.value || contentError.value || isSubmitting.value) return

  const { ok } = await request(
    () => boardApi.updatePost(postId, title.value.trim(), content.value.trim()),
    {
      errorMessage: '게시글 수정에 실패했습니다. 다시 시도해주세요.',
      on403: () => router.replace(`/board/${postId}`),
    },
  )
  if (ok) router.push(`/board/${postId}`)
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 py-8">
    <button
      @click="router.push(`/board/${postId}`)"
      class="flex items-center gap-1.5 text-sm text-text-sub hover:text-text-main mb-6 transition-colors cursor-pointer"
    >
      <ArrowLeftIcon class="w-4 h-4" />
      돌아가기
    </button>

    <div v-if="loading" class="text-center py-20 text-sm text-text-sub">불러오는 중...</div>

    <template v-else>
      <h1 class="text-2xl font-extrabold text-text-main mb-8">게시글 수정</h1>

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

        <p v-if="submitError" class="text-sm text-red-400">{{ submitError }}</p>

        <div class="flex justify-end gap-3">
          <button
            @click="router.push(`/board/${postId}`)"
            class="px-5 py-2.5 border border-border text-sm font-semibold text-text-main rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
          >
            취소
          </button>
          <button
            @click="submit"
            :disabled="isSubmitting"
            class="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? '수정 중...' : '수정' }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
