<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { CameraIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { productApi, categoryApi } from '@/api/productApi'

const router = useRouter()

const images = ref([])
const fileInput = ref(null)
const isSubmitting = ref(false)
const errorMessage = ref('')
const categories = ref([])

const productForm = ref({
  title: '',
  categoryId: null,
  productCondition: '',
  price: '',
  isFree: false,
  location: '',
  description: '',
})

const conditions = [
  { label: '새상품', value: 'NEW' },
  { label: '중고', value: 'USED' },
]

onMounted(async () => {
  try {
    const res = await categoryApi.getCategories()
    console.log('카테고리 전체응답:', res)
    console.log('카테고리 data:', res.data)
    categories.value = Array.isArray(res.data) ? res.data : (res.data?.data ?? [])
  } catch (e) {
    console.error('카테고리 로드 실패:', e)
  }
})

const priceDisplay = computed({
  get() {
    if (productForm.value.isFree) return '0'
    if (!productForm.value.price) return ''
    return Number(productForm.value.price).toLocaleString('ko-KR')
  },
  set(val) {
    productForm.value.price = val.replace(/[^0-9]/g, '')
  },
})

function toggleFree() {
  productForm.value.isFree = !productForm.value.isFree
  if (productForm.value.isFree) productForm.value.price = '0'
}

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
  if (productForm.value.isFree) return
  const current = Number(productForm.value.price) || 0
  productForm.value.price = String(current + amount)
}

async function submitForm() {
  if (!productForm.value.title.trim()) {
    errorMessage.value = '제목을 입력해주세요'
    return
  }
  if (!productForm.value.categoryId) {
    errorMessage.value = '카테고리를 선택해주세요'
    return
  }
  if (!productForm.value.productCondition) {
    errorMessage.value = '상태를 선택해주세요'
    return
  }
  if (!productForm.value.isFree && !productForm.value.price) {
    errorMessage.value = '가격을 입력해주세요'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const { data: createRes } = await productApi.createProduct({
      title: productForm.value.title,
      categoryId: productForm.value.categoryId,
      productCondition: productForm.value.productCondition,
      price: productForm.value.isFree ? 0 : Number(productForm.value.price),
      isFree: productForm.value.isFree,
      location: productForm.value.location,
      description: productForm.value.description,
    })

    const productId = createRes.id

    if (images.value.length > 0) {
      const formData = new FormData()
      images.value.forEach(({ file }) => {
        formData.append('images', file)
      })
      await productApi.uploadImages(productId, formData)
    }

    router.push(`/products/${productId}`)
  } catch (err) {
    console.error('등록 실패 상세:', err)
    console.error('응답 데이터:', err.response?.data)
    console.error('상태 코드:', err.response?.status)
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
                  :key="cat.id"
                  @click="productForm.categoryId = cat.id"
                  :class="[
                    'px-3 py-1.5 rounded-lg text-sm border transition-colors',
                    productForm.categoryId === cat.id
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-text-main border-border hover:border-primary'
                  ]"
                >
                  {{ cat.name }}
                </button>
              </div>
            </div>
            <div>
              <h2 class="text-base font-semibold text-text-main mb-4">상태</h2>
              <div class="flex gap-2">
                <button
                  v-for="cond in conditions"
                  :key="cond.value"
                  @click="productForm.productCondition = cond.value"
                  :class="[
                    'px-4 py-1.5 rounded-lg text-sm border transition-colors',
                    productForm.productCondition === cond.value
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-text-main border-border hover:border-primary'
                  ]"
                >
                  {{ cond.label }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 섹션 4: 가격 -->
        <div class="bg-white border border-border rounded-2xl p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-semibold text-text-main">가격</h2>
            <button
              type="button"
              @click="toggleFree"
              :class="[
                'px-3 py-1 rounded-lg text-xs border transition-colors',
                productForm.isFree
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-text-main border-border hover:border-primary'
              ]"
            >무료나눔</button>
          </div>
          <div class="flex items-center border border-border rounded-xl px-4 py-3 focus-within:border-primary"
            :class="productForm.isFree ? 'bg-gray-50' : ''">
            <input
              v-model="priceDisplay"
              type="text"
              inputmode="numeric"
              placeholder="가격을 입력해주세요"
              :disabled="productForm.isFree"
              class="flex-1 text-sm text-text-main placeholder:text-text-sub focus:outline-none disabled:text-text-sub bg-transparent"
            />
            <span class="text-sm text-text-sub ml-2">원</span>
          </div>
          <div class="flex gap-2 mt-3">
            <button
              v-for="amount in [1000, 5000, 100000, 500000]"
              :key="amount"
              @click="addPrice(amount)"
              :disabled="productForm.isFree"
              class="flex-1 py-1.5 text-xs border border-border rounded-lg text-text-main hover:border-primary hover:text-primary disabled:opacity-40"
            >
              +{{ amount.toLocaleString('ko-KR') }}
            </button>
          </div>
        </div>

        <!-- 섹션 4-1: 거래 위치 -->
        <div class="bg-white border border-border rounded-2xl p-6">
          <h2 class="text-base font-semibold text-text-main mb-4">거래 위치</h2>
          <input
            v-model="productForm.location"
            type="text"
            placeholder="예) 서울 강남구, 학교 정문 앞"
            class="w-full border border-border rounded-xl px-4 py-3 text-sm text-text-main placeholder:text-text-sub focus:outline-none focus:border-primary"
          />
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
