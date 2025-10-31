<template>
  <v-card-text>
    <div v-if="stats.total === 0" class="text-center text-grey">
      Nenhum dado para exibir com os filtros atuais.
    </div>

    <v-row v-else dense justify="center" class="mb-4">
      <v-btn-toggle
        v-model="currentView"
        color="primary"
        variant="outlined"
        density="compact"
        mandatory
      >
        <v-btn value="users">Pendentes por Usuário</v-btn>
        <v-btn value="details">Pendentes por Prazo/Assunto</v-btn>
      </v-btn-toggle>
    </v-row>

    <div v-if="stats.total > 0 && currentView === 'users'">
      <v-row dense>
        
        <v-col cols="6" sm="4" md="2">
          <v-card variant="text" class="text-center">
            <v-progress-circular
              :model-value="100"
              color="primary"
              :size="100"
              :width="10"
            >
              <strong>{{ stats.total }}</strong>
            </v-progress-circular>
            <v-card-text class="text-primary font-weight-bold pa-1">
              Total
            </v-card-text>
          </v-card>
        </v-col>

        <v-col v-for="user in paginatedUsers" :key="user.nome" cols="6" sm="4" md="2">
          <v-card variant="text" class="text-center">
            <v-progress-circular
              :model-value="user.percent"
              color="primary"
              :size="100"
              :width="10"
            >
              <strong>{{ user.count }}</strong>
            </v-progress-circular>
            <v-card-text class="pa-1">
              {{ user.nome }}<br>
              <span class="text-caption">({{ user.percent.toFixed(0) }}%)</span>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-if="totalUserPages > 1" justify="center" class="mt-2">
        <v-pagination
          v-model="userPage"
          :length="totalUserPages"
          size="small"
          density="compact"
        ></v-pagination>
      </v-row>
    </div>

    <div v-else-if="stats.total > 0 && currentView === 'details'">
      
      <v-row dense>
        <v-col v-for="prazo in stats.byPrazo" :key="prazo.nome" cols="6" sm="4" md="2">
          <v-card variant="text" class="text-center">
            <v-progress-circular
              :model-value="prazo.percent"
              color="orange"
              :size="100"
              :width="10"
            >
              <strong>{{ prazo.count }}</strong>
            </v-progress-circular>
            <v-card-text class="pa-1">
              {{ prazo.nome }}<br>
              <span class="text-caption">({{ prazo.percent.toFixed(0) }}%)</span>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col v-for="assunto in stats.byAssunto" :key="assunto.nome" cols="6" sm="4" md="2">
          <v-card variant="text" class="text-center">
            <v-progress-circular
              :model-value="assunto.percent"
              color="blue"
              :size="100"
              :width="10"
            >
              <strong>{{ assunto.count }}</strong>
            </v-progress-circular>
            <v-card-text class="pa-1">
              {{ assunto.nome }}<br>
              <span class="text-caption">({{ assunto.percent.toFixed(0) }}%)</span>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

  </v-card-text>
</template>

<script setup>
import { ref, computed } from 'vue';

// Props (Sem alteração)
const props = defineProps({
  stats: {
    type: Object,
    required: true,
    default: () => ({ total: 0, byUser: [], byPrazo: [], byAssunto: [] })
  }
});

// --- NOVO ESTADO DE VISÃO ---
// 'users' ou 'details'
const currentView = ref('users');

// --- LÓGICA DE PAGINAÇÃO (Corrigida) ---

// Itens por página: 11 usuários + 1 "Total" = 12 itens (Grid 6x2)
const itemsPerPage = 11; 

// Estado da página atual
const userPage = ref(1);

// Calcula o total de páginas (só pagina se tiver MAIS de 11 usuários)
const totalUserPages = computed(() => {
  if (props.stats.byUser.length <= itemsPerPage) return 1;
  return Math.ceil(props.stats.byUser.length / itemsPerPage);
});

// "Fatia" o array 'stats.byUser' para mostrar apenas os 11 da página atual
const paginatedUsers = computed(() => {
  // Se só há uma página, reseta a página para 1 (caso os filtros mudem)
  if (totalUserPages.value === 1) {
    userPage.value = 1;
  }
  const start = (userPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return props.stats.byUser.slice(start, end);
});
</script>