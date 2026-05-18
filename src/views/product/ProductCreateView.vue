<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { CameraIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { productApi } from '@/api/productApi'

const router = useRouter()

// { file: File, url: string } 형태로 관리
const images = ref([])
const fileInput = ref(null)
const isSubmitting = ref(false)
const errorMessage = ref('')

const productForm = ref({
  title: '',
  category: '',
  condition: '',
  price: '',
  description: ''
})

const categories = ['노트북', '모니터', '키보드', '마우스', '헤드폰', '태블릿', '스마트폰', '기타전자제품', '도서', '의류', '생활용품', '기타']
const conditions = ['새상품', '중고']

const priceDisplay = computed({
  get() {
    if (!productForm.value.price) return ''
    return Number(productForm.value.price).toLocaleString('ko-KR')
  },
  set(val) {
    productForm.value.price = val.replace(/[^0-9]/g, '')
  }
})

function handleFileChange(event) {
  const files = Array.from(event.target.files)
  files.forEach((file) => {
    if (images.value.length >= 10) return
    images.value.push({ file, url: URL.createObjectURL(file) })
  })
  event.target.value = ''
}

function removeImage(index) {
  URL.revokeObjectURL(images.value[index].url)
  images.value.splice(index, 1)
}

function addPrice(amount) {
  const current = Number(productForm.value.price) || 0
  productForm.value.price = String(current + amount)
}

async function submitForm() {
  if (!productForm.value.title.trim()) {
    errorMessage.value = '제목을 입력해주세요'
    return
  }
  if (!productForm.value.category) {
    errorMessage.value = '카테고리를 선택해주세요'
    return
  }
  if (!productForm.value.condition) {
    errorMessage.value = '상태를 선택해주세요'
    return
  }
  if (!productForm.value.price) {
    errorMessage.value = '가격을 입력해주세요'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    // 1단계: 상품 기본 정보 등록
    const { data: createRes } = await productApi.createProduct({
      title: productForm.value.title,
      category: productForm.value.category,
      condition: productForm.value.condition,
      price: Number(productForm.value.price),
      description: productForm.value.description,
    })

    const productId = createRes.data.id

    // 2단계: 이미지 업로드 (이미지가 있을 경우)
    if (images.value.length > 0) {
      const formData = new FormData()
      images.value.forEach(({ file }) => {
        formData.append('images', file)
      })
      await productApi.uploadImages(productId, formData)
    }

    router.push(`/products/${productId}`)
  } catch (err) {
    errorMessage.value = err.response?.data?.message || '상품 등록에 실패했습니다'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-sub-bg">
    <!-- 페이지 헤더 -->
    <div class="bg-yellow-50 px-4 py-10">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-2xl font-bold text-text-main">상품 등록</h1>
        <p class="text-sm text-text-sub mt-1">판매하실 상품 정보를 입력해주세요</p>
      </div>
    </div>

    <div class="max-w-2xl mx-auto px-4 py-6">
      <div class="flex flex-col gap-4">
        <!-- 섹션 1: 상품 사진 -->
        <div class="bg-white border border-border rounded-2xl p-6">
          <h2 class="text-base font-semibold text-text-main mb-4">상품 사진</h2>
          <div class="flex gap-3 flex-wrap">
            <div
              v-if="images.length < 10"
              @click="fileInput.click()"
              class="w-24 h-24 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary"
            >
              <CameraIcon class="w-6 h-6 text-text-sub" />
              <span class="text-xs text-text-sub">사진 추가</span>
              <span class="text-xs text-text-sub">{{ images.length }}/10</span>
            </div>
            <div v-for="(img, index) in images" :key="index" class="relative w-24 h-24 rounded-xl overflow-hidden">
              <img :src="img.url" class="w-full h-full object-cover" />
              <button @click="removeImage(index)" class="absolute top-1 right-1 bg-black/60 rounded-full p-0.5">
                <XMarkIcon class="w-3 h-3 text-white" />
              </button>
              <span
                v-if="index === 0"
                class="absolute bottom-0 left-0 right-0 text-center text-xs text-white bg-black/50 py-0.5"
              >대표</span>
            </div>
            <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="handleFileChange" />
          </div>
          <p class="text-xs text-text-sub mt-3">* 첫 번째 사진이 대표 사진으로 설정됩니다. (최대 10장)</p>
        </div>

        <!-- 섹션 2: 제목 -->
        <div class="bg-white border border-border rounded-2xl p-6">
          <h2 class="text-base font-semibold text-text-main mb-4">제목</h2>
          <input
            v-model="productForm.title"
            type="text"
            placeholder="상품 제목을 입력해주세요"
            class="w-full border border-border rounded-xl px-4 py-3 text-sm text-text-main placeholder:text-text-sub focus:outline-none focus:border-primary"
          />
        </div>

        <!-- 섹션 3: 카테고리 + 상태 -->
        <div class="bg-white border border-border rounded-2xl p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 class="text-base font-semibold text-text-main mb-4">카테고리</h2>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="cat in categories"
                  :key="cat"
                  @click="productForm.category = cat"
                  :class="[
                    'px-3 py-1.5 rounded-lg text-sm border transition-colors',
                    productForm.category === cat
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-text-main border-border hover:border-primary'
                  ]"
                >
                  {{ cat }}
                </button>
              </div>
            </div>
            <div>
              <h2 class="text-base font-semibold text-text-main mb-4">상태</h2>
              <div class="flex gap-2">
                <button
                  v-for="cond in conditions"
                  :key="cond"
                  @click="productForm.condition = cond"
                  :class="[
                    'px-4 py-1.5 rounded-lg text-sm border transition-colors',
                    productForm.condition === cond
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-text-main border-border hover:border-primary'
                  ]"
                >
                  {{ cond }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 섹션 4: 가격 -->
        <div class="bg-white border border-border rounded-2xl p-6">
          <h2 class="text-base font-semibold text-text-main mb-4">가격</h2>
          <div class="flex items-center border border-border rounded-xl px-4 py-3 focus-within:border-primary">
            <input
              v-model="priceDisplay"
              type="text"
              inputmode="numeric"
              placeholder="가격을 입력해주세요"
              class="flex-1 text-sm text-text-main placeholder:text-text-sub focus:outline-none"
            />
            <span class="text-sm text-text-sub ml-2">원</span>
          </div>
          <div class="flex gap-2 mt-3">
            <button
              v-for="amount in [1000, 5000, 100000, 500000]"
              :key="amount"
              @click="addPrice(amount)"
              class="flex-1 py-1.5 text-xs border border-border rounded-lg text-text-main hover:border-primary hover:text-primary"
            >
              +{{ amount.toLocaleString('ko-KR') }}
            </button>
          </div>
        </div>

        <!-- 섹션 5: 설명 -->
        <div class="bg-white border border-border rounded-2xl p-6">
          <h2 class="text-base font-semibold text-text-main mb-4">설명</h2>
          <textarea
            v-model="productForm.description"
            placeholder="상품 설명을 입력해주세요&#10;&#10;· 상품 상태&#10;· 구매 시기&#10;· 하자 유무 등을 자세히 적어주세요"
            rows="7"
            class="w-full border border-border rounded-xl px-4 py-3 text-sm text-text-main placeholder:text-text-sub focus:outline-none focus:border-primary resize-none"
          />
          <p class="text-xs text-text-sub mt-2">* 상품과 관련 없는 내용이나 허위 정보는 제재 대상입니다.</p>
        </div>

        <!-- 에러 메시지 -->
        <p v-if="errorMessage" class="text-sm text-red-500 text-center -mt-2">{{ errorMessage }}</p>

        <!-- 버튼 영역 -->
        <div class="grid grid-cols-2 gap-4 pb-6">
          <button
            type="button"
            :disabled="isSubmitting"
            class="py-4 rounded-xl border border-border text-text-main font-semibold hover:bg-gray-50 disabled:opacity-50"
            @click="router.back()"
          >취소</button>
          <button
            type="button"
            :disabled="isSubmitting"
            class="py-4 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover disabled:opacity-50"
            @click="submitForm"
          >{{ isSubmitting ? '등록 중...' : '등록하기' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
