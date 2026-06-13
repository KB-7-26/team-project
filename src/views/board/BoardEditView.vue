<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import { boardApi } from '@/api/boardApi'
import { useApiRequest } from '@/composables/useApiRequest'
import { useToastStore } from '@/stores/toast'

const route = useRoute()
const router = useRouter()

const CATEGORIES = ['자유게시판', '공지', '전공', '비전공', '취업']

const postId = Number(route.params.id)
const category = ref('자유게시판')
const title = ref('')
const content = ref('')
const titleError = ref(false)
const contentError = ref(false)
const loading = ref(true)

const { isLoading: isSubmitting, error: submitError, request } = useApiRequest()
const toast = useToastStore()

onMounted(async () => {
  try {
    const post = await boardApi.getPostById(postId)
    if (!post.isOwner) {
      router.replace(`/board/${postId}`)
      return
    }
    category.value = post.category ?? '자유게시판'
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
    () => boardApi.updatePost(postId, title.value.trim(), content.value.trim(), category.value),
    {
      errorMessage: '게시글 수정에 실패했습니다. 다시 시도해주세요.',
      on403: () => router.replace(`/board/${postId}`),
    },
  )
  if (ok) {
    toast.show('게시글이 수정되었습니다.')
    router.push(`/board/${postId}`)
  }
}
</script>

<template>
  <div class="bg-paper-dots min-h-screen">
    <div class="max-w-4xl mx-auto px-6 py-8">
      <button
        @click="router.push(`/board/${postId}`)"
        class="flex items-center gap-1.5 text-sm text-[#8c7e6e] hover:text-ink mb-6 transition-colors cursor-pointer font-medium group"
      >
        <ArrowLeftIcon class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        돌아가기
      </button>

      <div v-if="loading" class="text-center py-20 text-sm text-[#8c7e6e]">불러오는 중...</div>

      <div v-else class="bg-white border-2 border-ink rounded-2xl shadow-[4px_4px_0_#1c1712] overflow-hidden">
        <div class="h-1.5 bg-[#96d4b4]" />
        <div class="p-6">
          <h1 class="font-sketch font-bold text-2xl text-ink mb-7">✏️ 게시글 수정</h1>

          <div class="flex flex-col gap-5">
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-bold text-ink">카테고리</label>
              <div class="flex gap-2 flex-wrap">
                <button
                  v-for="cat in CATEGORIES"
                  :key="cat"
                  type="button"
                  @click="category = cat"
                  class="px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer"
                  :class="category === cat
                    ? 'bg-[#2d5a48] text-white border-[#2d5a48] shadow-[2px_2px_0_#1c1712]'
                    : 'bg-white border-[#c8bca8] text-[#8c7e6e] hover:border-[#2d5a48] hover:text-[#2d5a48]'"
                >{{ cat }}</button>
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-bold text-ink">제목</label>
              <input
                v-model="title"
                @input="titleError = false"
                type="text"
                placeholder="제목을 입력하세요"
                class="px-4 py-3 border-2 rounded-xl text-sm text-ink outline-none transition-colors placeholder:text-[#8c7e6e]"
                :class="titleError ? 'border-red-400 focus:border-red-400' : 'border-[#c8bca8] focus:border-ink'"
              />
              <p v-if="titleError" class="text-xs text-red-400 font-medium">제목을 입력해주세요</p>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-bold text-ink">내용</label>
              <textarea
                v-model="content"
                @input="contentError = false"
                placeholder="내용을 입력하세요"
                rows="12"
                class="px-4 py-3 border-2 rounded-xl text-sm text-ink outline-none transition-colors resize-none placeholder:text-[#8c7e6e]"
                :class="contentError ? 'border-red-400 focus:border-red-400' : 'border-[#c8bca8] focus:border-ink'"
              />
              <p v-if="contentError" class="text-xs text-red-400 font-medium">내용을 입력해주세요</p>
            </div>

            <p v-if="submitError" class="text-sm text-red-400">{{ submitError }}</p>

            <div class="flex justify-end gap-3 pt-2 border-t-2 border-dashed border-[#e8e0d4]">
              <button
                @click="router.push(`/board/${postId}`)"
                class="px-5 py-2.5 border-2 border-[#c8bca8] text-sm font-bold text-[#8c7e6e] rounded-xl hover:border-ink hover:text-ink transition-all cursor-pointer"
              >
                취소
              </button>
              <button
                @click="submit"
                :disabled="isSubmitting"
                class="px-5 py-2.5 bg-[#96d4b4] border-2 border-ink text-ink text-sm font-bold rounded-xl shadow-[3px_3px_0_#1c1712] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#1c1712] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {{ isSubmitting ? '수정 중...' : '수정하기' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
