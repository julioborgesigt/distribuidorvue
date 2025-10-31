<template>
  <v-app>
    

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>



<script setup>
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

// 4. Ação de Logout
const handleLogout = () => {
  authStore.logout(); // Chama a ação da store
};
</script>