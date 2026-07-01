<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CameraIcon, ExclamationTriangleIcon, PencilSquareIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { productApi, categoryApi } from '@/api/productApi'
import { conditions, useProductForm } from '@/composables/useProductForm'

const route = useRoute()
const router = useRouter()

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

const { images, deletedImageIds, fileInput, priceDisplay, toggleFree, addPrice, handleFileChange, removeImage } = useProductForm(productForm)

function selectCondition(value) {
  productForm.value.productCondition = value
  productForm.value.isFree = false
  if (productForm.value.price === '0') productForm.value.price = ''
}

onMounted(async () => {
  const catRes = await categoryApi.getCategories()
  categories.value = Array.isArray(catRes.data) ? catRes.data : []

  const { data } = await productApi.getProduct(route.params.id)
  productForm.value = {
    title: data.title,
    categoryId: data.categoryId,
    productCondition: data.productCondition,
    price: data.price,
    isFree: data.isFree,
    location: data.location,
    description: data.description,
  }
  images.value = (data.images || [])
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((img) => ({ id: img.id, url: img.imageUrl, isExisting: true }))
})

const submitForm = async () => {
  if (isSubmitting.value) return
  errorMessage.value = ''
  if (!productForm.value.title.trim()) {
    errorMessage.value = '제목을 입력해주세요.'
    return
  }
  if (!productForm.value.categoryId) {
    errorMessage.value = '카테고리를 선택해주세요.'
    return
  }
  if (!productForm.value.isFree && !productForm.value.price) {
    errorMessage.value = '가격을 입력해주세요.'
    return
  }
  isSubmitting.value = true
  try {
    const id = route.params.id

    await productApi.updateProduct(id, {
      title: productForm.value.title,
      categoryId: productForm.value.categoryId,
      productCondition: productForm.value.productCondition,
      price: productForm.value.isFree ? 0 : Number(productForm.value.price),
      isFree: productForm.value.isFree,
      location: productForm.value.location,
      description: productForm.value.description,
    })

    await Promise.all(
      deletedImageIds.value.map((imageId) => productApi.deleteImage(id, imageId))
    )

    const newFiles = images.value.filter((img) => !img.isExisting).map((img) => img.file)
    if (newFiles.length > 0) {
      const formData = new FormData()
      newFiles.forEach((file) => formData.append('images', file))
      await productApi.uploadImages(id, formData)
    }

    router.replace(`/products/${id}`)
  } catch (e) {
    errorMessage.value = '수정에 실패했습니다. 다시 시도해주세요.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-paper-dots">

    <!-- 페이지 헤더 -->
    <div class="max-w-2xl mx-auto px-4 md:px-6 pt-10 pb-6">
      <span class="inline-flex items-center gap-1.5 -rotate-1 mb-4 px-3 py-0.5 text-sm text-[#8c7e6e] border-2 border-[#c8bca8] rounded-md">
        <PencilSquareIcon class="w-4 h-4" />
        상품 수정
      </span>
      <h1 class="font-bold text-3xl text-ink leading-tight">판매 물품 수정</h1>
      <p class="text-sm text-[#8c7e6e] mt-1">수정할 상품 정보를 입력해주세요</p>
    </div>

    <div class="max-w-2xl mx-auto px-4 md:px-6 pb-10">
      <div class="flex flex-col gap-5">

        <!-- 섹션 1: 상품 사진 -->
        <div class="form-card bg-white border-2 border-ink rounded-2xl p-6 shadow-[4px_4px_0_#1c1712]">
          <h2 class="sec-title font-bold text-[17px] text-ink mb-5">상품 사진</h2>
          <div class="flex gap-3 flex-wrap">
            <div
              v-if="images.length < 10"
              @click="fileInput.click()"
              class="img-add-btn w-24 h-24 border-2 border-dashed border-[#c8bca8] rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-ink hover:bg-[#ffe066]/10 transition-all"
            >
              <CameraIcon class="w-6 h-6 text-[#8c7e6e]" />
              <span class="text-xs text-[#8c7e6e] font-bold">사진 추가</span>
              <span class="text-xs text-[#c8bca8]">{{ images.length }}/10</span>
            </div>
            <div
              v-for="(img, index) in images"
              :key="index"
              class="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-ink shadow-[2px_2px_0_#1c1712]"
            >
              <img :src="img.url" class="w-full h-full object-cover" />
              <button
                @click="removeImage(index)"
                class="absolute top-1 right-1 bg-ink rounded-full p-0.5 hover:scale-110 transition-transform"
              >
                <XMarkIcon class="w-3 h-3 text-paper" />
              </button>
              <span
                v-if="index === 0"
                class="absolute bottom-0 left-0 right-0 text-center text-xs font-bold text-paper bg-ink/80 py-0.5"
              >대표</span>
            </div>
            <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="handleFileChange" />
          </div>
          <p class="text-xs text-[#8c7e6e] mt-3">* 첫 번째 사진이 대표 사진으로 설정됩니다. (최대 10장)</p>
        </div>

        <!-- 섹션 2: 제목 -->
        <div class="form-card bg-white border-2 border-ink rounded-2xl p-6 shadow-[4px_4px_0_#1c1712]">
          <h2 class="sec-title font-bold text-[17px] text-ink mb-5">제목</h2>
          <input
            v-model="productForm.title"
            type="text"
            placeholder="상품 제목을 입력해주세요"
            class="form-input w-full border-2 border-[#c8bca8] rounded-xl px-4 py-3 text-sm text-ink placeholder:text-[#c8bca8] focus:outline-none focus:border-ink transition-colors bg-paper/40"
          />
        </div>

        <!-- 섹션 3: 카테고리 -->
        <div class="form-card bg-white border-2 border-ink rounded-2xl p-6 shadow-[4px_4px_0_#1c1712]">
          <h2 class="sec-title font-bold text-[17px] text-ink mb-5">카테고리</h2>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="cat in categories"
              :key="cat.id"
              @click="productForm.categoryId = cat.id"
              :class="[
                'chip-btn px-3.5 py-1.5 rounded-lg text-sm font-bold border-2 transition-all',
                productForm.categoryId === cat.id
                  ? 'bg-[#ffe066] text-ink border-ink shadow-[2px_2px_0_#1c1712]'
                  : 'bg-white text-[#8c7e6e] border-[#c8bca8] hover:border-ink hover:text-ink',
              ]"
            >
              {{ cat.name }}
            </button>
          </div>
        </div>

        <!-- 섹션 4: 상태 -->
        <div class="form-card bg-white border-2 border-ink rounded-2xl p-6 shadow-[4px_4px_0_#1c1712]">
          <h2 class="sec-title font-bold text-[17px] text-ink mb-5">상태</h2>
          <div class="flex gap-3 flex-wrap">
            <button
              v-for="cond in conditions"
              :key="cond.value"
              @click="selectCondition(cond.value)"
              :class="[
                'chip-btn px-5 py-2 rounded-lg text-sm font-bold border-2 transition-all',
                productForm.productCondition === cond.value
                  ? 'bg-[#ffe066] text-ink border-ink shadow-[2px_2px_0_#1c1712]'
                  : 'bg-white text-[#8c7e6e] border-[#c8bca8] hover:border-ink hover:text-ink',
              ]"
            >
              {{ cond.label }}
            </button>
          </div>
        </div>

        <!-- 섹션 5: 가격 -->
        <div class="form-card bg-white border-2 border-ink rounded-2xl p-6 shadow-[4px_4px_0_#1c1712]">
          <div class="flex items-center justify-between mb-5">
            <h2 class="sec-title font-bold text-[17px] text-ink">가격</h2>
            <button
              type="button"
              @click="toggleFree"
              :class="[
                'chip-btn px-3.5 py-1 rounded-lg text-xs font-bold border-2 transition-all',
                productForm.isFree
                  ? 'bg-[#96d4b4] text-ink border-ink shadow-[2px_2px_0_#1c1712]'
                  : 'bg-white text-[#8c7e6e] border-[#c8bca8] hover:border-ink hover:text-ink',
              ]"
            >무료나눔</button>
          </div>
          <div
            class="flex items-center border-2 rounded-xl px-4 py-3 transition-colors"
            :class="productForm.isFree ? 'bg-paper/60 border-[#c8bca8]' : 'border-[#c8bca8] focus-within:border-ink bg-paper/40'"
          >
            <input
              v-model="priceDisplay"
              type="text"
              inputmode="numeric"
              placeholder="가격을 입력해주세요"
              :disabled="productForm.isFree"
              class="flex-1 text-sm text-ink placeholder:text-[#c8bca8] focus:outline-none disabled:text-[#c8bca8] bg-transparent"
            />
            <span class="text-sm font-bold text-[#8c7e6e] ml-2">원</span>
          </div>
          <div class="flex gap-2 mt-3">
            <button
              v-for="amount in [1000, 5000, 100000, 500000]"
              :key="amount"
              @click="addPrice(amount)"
              :disabled="productForm.isFree"
              class="quick-btn flex-1 py-1.5 text-xs font-bold border-2 border-[#c8bca8] rounded-lg text-[#8c7e6e] hover:border-ink hover:text-ink hover:bg-[#ffe066]/30 disabled:opacity-30 transition-all"
            >
              +{{ amount.toLocaleString('ko-KR') }}
            </button>
          </div>
        </div>

        <!-- 섹션 6: 거래 위치 -->
        <div class="form-card bg-white border-2 border-ink rounded-2xl p-6 shadow-[4px_4px_0_#1c1712]">
          <h2 class="sec-title font-bold text-[17px] text-ink mb-5">거래 위치</h2>
          <input
            v-model="productForm.location"
            type="text"
            placeholder="예) 서울 강남구, 학교 정문 앞"
            class="form-input w-full border-2 border-[#c8bca8] rounded-xl px-4 py-3 text-sm text-ink placeholder:text-[#c8bca8] focus:outline-none focus:border-ink transition-colors bg-paper/40"
          />
        </div>

        <!-- 섹션 7: 설명 -->
        <div class="form-card bg-white border-2 border-ink rounded-2xl p-6 shadow-[4px_4px_0_#1c1712]">
          <h2 class="sec-title font-bold text-[17px] text-ink mb-5">설명</h2>
          <textarea
            v-model="productForm.description"
            placeholder="상품 설명을 입력해주세요&#10;&#10;· 상품 상태&#10;· 구매 시기&#10;· 하자 유무 등을 자세히 적어주세요"
            rows="7"
            class="form-input w-full border-2 border-[#c8bca8] rounded-xl px-4 py-3 text-sm text-ink placeholder:text-[#c8bca8] focus:outline-none focus:border-ink transition-colors resize-none bg-paper/40"
          />
          <p class="text-xs text-[#8c7e6e] mt-2">* 상품과 관련 없는 내용이나 허위 정보는 제재 대상입니다.</p>
        </div>

        <!-- 에러 메시지 -->
        <p v-if="errorMessage" class="text-sm text-red-500 font-bold text-center -mt-2 border-2 border-red-300 bg-red-50 rounded-xl py-2 px-4 flex items-center justify-center gap-1.5">
          <ExclamationTriangleIcon class="w-4 h-4" />
          {{ errorMessage }}
        </p>

        <!-- 버튼 영역 -->
        <div class="grid grid-cols-2 gap-4 pb-4">
          <button
            type="button"
            :disabled="isSubmitting"
            class="action-btn py-4 rounded-xl border-2 border-ink bg-white text-ink font-bold shadow-[3px_3px_0_#1c1712] hover:shadow-[4px_4px_0_#1c1712] disabled:opacity-50 transition-all"
            @click="router.back()"
          >취소</button>
          <button
            type="button"
            :disabled="isSubmitting"
            class="action-btn py-4 rounded-xl border-2 border-ink bg-[#ffe066] text-ink font-bold shadow-[3px_3px_0_#1c1712] hover:shadow-[4px_4px_0_#1c1712] disabled:opacity-50 transition-all"
            @click="submitForm"
          >{{ isSubmitting ? '수정 중...' : '수정하기 ✓' }}</button>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.sec-title {
  position: relative;
  display: inline-block;
}
.sec-title::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  right: 0;
  height: 3px;
  background: #ffe066;
  border-radius: 2px;
}

.chip-btn:hover { transform: translate(-1px, -1px); }
.chip-btn:active { transform: translate(1px, 1px); box-shadow: none !important; }

.action-btn:hover { transform: translate(-1px, -1px); }
.action-btn:active { transform: translate(2px, 2px); box-shadow: none !important; }

.img-add-btn:active { transform: scale(0.96); }
</style>
