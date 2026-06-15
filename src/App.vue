<script setup>
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { RouterView } from 'vue-router'
import { useRoute } from 'vue-router'
import { Client } from '@stomp/stompjs'
import TopNavBar from './components/common/TopNavBar.vue'
import BottomNavBar from './components/common/BottomNavBar.vue'
import ToastNotification from './components/common/ToastNotification.vue'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { auth } from '@/firebase'

const route = useRoute()
const authStore = useAuthStore()
const chatStore = useChatStore()
const showNav = computed(() => !route.meta.hideNav)
const contentClass = computed(() => {
  if (route.meta.hideNav) return ''
  if (route.meta.hideNavMobile) return 'md:pt-15'
  return 'pt-15 pb-16 md:pb-0'
})

let notificationClient = null

async function connectNotification() {
  if (!authStore.isVerified || !authStore.user?.id) return
  // 기존 연결 먼저 끊기
  if (notificationClient) {
    notificationClient.deactivate()
    notificationClient = null
  }
  const token = await auth.currentUser?.getIdToken()
  if (!token) return

  const client = new Client({
    brokerURL: 'ws://localhost:8080/ws',
    reconnectDelay: 5000,
    connectHeaders: { Authorization: `Bearer ${token}` },
    onConnect: () => {
      // 알림 구독 (네비바 뱃지)
      client.subscribe(`/topic/notification/${authStore.user.id}`, () => {
        chatStore.fetchUnreadCount()
      })
      // 별점 요청 구독 - 어디 있든 받을 수 있게 전역 구독
      client.subscribe(`/topic/review/${authStore.user.id}`, (frame) => {
        const payload = JSON.parse(frame.body)
        // payload가 객체면 {transactionId, chatRoomId}, 숫자면 transactionId만
        if (typeof payload === 'object') {
          chatStore.setPendingReview(payload.transactionId, payload.chatRoomId)
        } else {
          chatStore.setPendingReview(payload, null)
        }
      })
    },
  })
  client.activate()
  notificationClient = client
}

function disconnectNotification() {
  notificationClient?.deactivate()
  notificationClient = null
}

// 로그인 상태 바뀔 때 연결/해제
watch(() => authStore.isVerified, (verified) => {
  if (verified) connectNotification()
  else disconnectNotification()
})

onMounted(() => {
  if (authStore.isVerified) connectNotification()
})
onUnmounted(disconnectNotification)
</script>

<template>
  <div v-if="showNav" :class="route.meta.hideNavMobile ? 'hidden md:block' : ''">
    <TopNavBar />
  </div>
  <div :class="contentClass">
    <RouterView />
  </div>
  <div v-if="showNav" :class="route.meta.hideNavMobile ? 'hidden' : ''">
    <BottomNavBar />
  </div>
  <ToastNotification />
</template>
