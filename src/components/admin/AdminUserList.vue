<script setup>
defineProps({
  users: {
    type: Array,
    required: true,
  },
  statLabel: {
    type: String,
    default: '건수',
  },
  statKey: {
    type: String,
    default: 'totalCount',
  },
})

defineEmits(['select'])
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full text-center">
      <thead>
        <tr>
          <th class="text-center text-xs font-bold text-[#8c7e6e] uppercase pb-3 border-b-2 border-[#e8e0d4]">닉네임</th>
          <th class="text-center text-xs font-bold text-[#8c7e6e] uppercase pb-3 border-b-2 border-[#e8e0d4]">이메일</th>
          <th class="text-center text-xs font-bold text-[#8c7e6e] uppercase pb-3 border-b-2 border-[#e8e0d4] w-24">{{ statLabel }}</th>
          <th class="text-center text-xs font-bold text-[#8c7e6e] uppercase pb-3 border-b-2 border-[#e8e0d4] w-20">상세</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="user in users"
          :key="user.userId ?? user.id"
          class="hover:bg-[#96d4b4]/10 transition-colors"
        >
          <td class="py-3 border-b border-[#e8e0d4] text-sm font-medium text-ink text-center">
            {{ user.nickname ?? '—' }}
          </td>
          <td class="py-3 border-b border-[#e8e0d4] text-xs text-[#8c7e6e] text-center">
            {{ user.email ?? '—' }}
          </td>
          <td class="py-3 border-b border-[#e8e0d4] text-sm font-bold text-[#cc5a3a] text-center">
            {{ user[statKey] ?? '—' }}
          </td>
          <td class="py-3 border-b border-[#e8e0d4] text-center">
            <button
              @click="$emit('select', user)"
              class="px-3 py-1 text-xs font-bold rounded-lg border-2 border-ink bg-white hover:bg-ink hover:text-white transition-all cursor-pointer shadow-[1px_1px_0_#1c1712]"
            >
              보기
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
