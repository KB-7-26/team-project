<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeftIcon, CameraIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { boardApi } from '@/api/boardApi'
import { useApiRequest } from '@/composables/useApiRequest'
import { useToastStore } from '@/stores/toast'
import { useAuthStore } from '@/stores/auth'
const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const ALL_CATEGORIES = ['자유게시판', '공지', '전공', '비전공', '취업']
const CATEGORIES = computed(() => auth.isAdmin ? ALL_CATEGORIES : ALL_CATEGORIES.filter(c => c !== '공지'))

const initialCategory = ALL_CATEGORIES.includes(route.query.category) && (route.query.category !== '공지' || auth.isAdmin) ? route.query.category : '자유게시판'
const category = ref(initialCategory)
const title = ref('')
const content = ref('')
const titleError = ref(false)
const contentError = ref(false)

const { isLoading: isSubmitting, error: submitError, request } = useApiRequest()
const toast = useToastStore()

const images = ref([])
const fileInput = ref(null)

const handleFileChange = (e) => {
  const files = Array.from(e.target.files)
  const remaining = 5 - images.value.length
  files.slice(0, remaining).forEach(file => {
    images.value.push({ file, url: URL.createObjectURL(file) })
  })
  e.target.value = ''
}

const removeImage = (index) => {
  URL.revokeObjectURL(images.value[index].url)
  images.value.splice(index, 1)
}

const submit = async () => {
  titleError.value = !title.value.trim()
  contentError.value = !content.value.trim()
  if (titleError.value || contentError.value || isSubmitting.value) return

  const { ok, data } = await request(
    async () => {
      const post = await boardApi.createPost(title.value.trim(), content.value.trim(), category.value)
      if (images.value.length > 0) {
        const formData = new FormData()
        images.value.forEach(({ file }) => formData.append('images', file))
        await boardApi.uploadPostImages(post.id, formData)
      }
      return post
    },
    { errorMessage: '게시글 등록에 실패했습니다. 다시 시도해주세요.' },
  )
  if (ok) {
    toast.show('게시글이 등록되었습니다.')
    router.push(`/board/${data.id}`)
  }
}
</script>

<template>
  <div class="bg-paper-dots min-h-screen">
    <div class="max-w-4xl mx-auto px-6 py-8">
      <button
        @click="router.push('/board')"
        class="flex items-center gap-1.5 text-sm text-[#8c7e6e] hover:text-ink mb-6 transition-colors cursor-pointer font-medium group"
      >
        <ArrowLeftIcon class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        목록으로
      </button>

      <div class="bg-white border-2 border-ink rounded-2xl shadow-[4px_4px_0_#1c1712] overflow-hidden">
        <div class="h-1.5 bg-[#ffe066]" />
        <div class="p-6">
          <h1 class="font-sketch font-bold text-2xl text-ink mb-7">✏️ 게시글 작성</h1>

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

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-bold text-ink">
                이미지 첨부
                <span class="font-normal text-[#8c7e6e]">(선택, 최대 5장)</span>
              </label>
              <div class="flex gap-2 flex-wrap">
                <div
                  v-if="images.length < 5"
                  @click="fileInput.click()"
                  class="w-20 h-20 border-2 border-dashed border-[#c8bca8] rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-ink hover:bg-[#ffe066]/10 transition-all"
                >
                  <CameraIcon class="w-5 h-5 text-[#8c7e6e]" />
                  <span class="text-[10px] text-[#8c7e6e] font-bold">{{ images.length }}/5</span>
                </div>
                <div
                  v-for="(img, index) in images"
                  :key="index"
                  class="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-ink shadow-[2px_2px_0_#1c1712]"
                >
                  <img :src="img.url" class="w-full h-full object-cover" />
                  <button
                    type="button"
                    @click="removeImage(index)"
                    class="absolute top-1 right-1 bg-ink rounded-full p-0.5 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <XMarkIcon class="w-3 h-3 text-paper" />
                  </button>
                </div>
                <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="handleFileChange" />
              </div>
            </div>

            <p v-if="submitError" class="text-sm text-red-400">{{ submitError }}</p>

            <div class="flex justify-end gap-3 pt-2 border-t-2 border-dashed border-[#e8e0d4]">
              <button
                @click="router.push('/board')"
                class="px-5 py-2.5 border-2 border-[#c8bca8] text-sm font-bold text-[#8c7e6e] rounded-xl hover:border-ink hover:text-ink transition-all cursor-pointer"
              >
                취소
              </button>
              <button
                @click="submit"
                :disabled="isSubmitting"
                class="px-5 py-2.5 bg-[#ffe066] border-2 border-ink text-ink text-sm font-bold rounded-xl shadow-[3px_3px_0_#1c1712] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#1c1712] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {{ isSubmitting ? '등록 중...' : '등록하기' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
