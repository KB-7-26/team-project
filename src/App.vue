<script setup>
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { RouterView } from 'vue-router'
import { useRoute } from 'vue-router'
import { Client } from '@stomp/stompjs'
import TopNavBar from './components/common/TopNavBar.vue'
import BottomNavBar from './components/common/BottomNavBar.vue'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { auth } from '@/firebase'

const route = useRoute()
const authStore = useAuthStore()
const chatStore = useChatStore()
const showTopNavBar = computed(() => !route.meta.hideNav)

let notificationClient = null

async function connectNotification() {
  if (!authStore.isLoggedIn || !authStore.user?.id) return
  const token = await auth.currentUser?.getIdToken()
  if (!token) return

  const client = new Client({
    brokerURL: 'ws://localhost:8080/ws',
    reconnectDelay: 5000,
    connectHeaders: { Authorization: `Bearer ${token}` },
    onConnect: () => {
      client.subscribe(`/topic/notification/${authStore.user.id}`, () => {
        chatStore.fetchUnreadCount()
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
watch(() => authStore.isLoggedIn, (loggedIn) => {
  if (loggedIn) connectNotification()
  else disconnectNotification()
})

onMounted(() => {
  if (authStore.isLoggedIn) connectNotification()
})
onUnmounted(disconnectNotification)
</script>

<template>
  <TopNavBar v-if="showTopNavBar" />
  <div :class="showTopNavBar ? 'pt-16 pb-16 md:pb-0' : ''">
    <RouterView />
  </div>
  <BottomNavBar v-if="showTopNavBar" />
</template>
