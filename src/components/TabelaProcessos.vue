<template>
  <div>
    <v-data-table-server
      :headers="headers"
      :items="props.items"
      :items-length="props.totalItems" :loading="props.loading"
      
      show-select
      return-object
      :model-value="props.selected"
      @update:model-value="emit('update:selected', $event)"
      
      @update:options="emit('update:options', $event)" item-key="id"
      class="elevation-1"
      fixed-header
      height="70vh"
    >
      <template v-slot:item.user="{ item }">
        <span v-if="item.User">{{ item.User.nome }}</span>
        <v-chip v-else size="small" variant="tonal">Não Atribuído</v-chip>
      </template>
        
      <template v-slot:item.prazoRestanteNum="{ item }">
        <v-chip :color="item.prazoRestanteColor" size="small">
          {{ item.prazoRestanteStr }}
        </v-chip>
      </template>

      <template v-slot:item.observacoes="{ item }">
        <div @dblclick="abrirModalObs(item)" class="obs-celula" title="Clique duplo para editar">
          {{ item.observacoes || '...' }}
        </div>
      </template>

      <template v-slot:item.acaoCumprido="{ item }">
        <v-tooltip location="top" v-if="item.cumprido">
          <template v-slot:activator="{ props: tooltipProps }">
            <v-btn
              icon
              color="success"
              v-bind="tooltipProps"
              @click="emitirEventoMarcarCumprido(item)"
              title="Desmarcar processo"
              size="small"
            >
              <v-icon>mdi-check-circle</v-icon>
            </v-btn>
            </template>
          <span>
            Cumprido em: {{ formatarDataHora(item.cumpridoDate) }}
          </span>
        </v-tooltip>
        
        <v-btn
          v-else
          icon
          color="grey-lighten-1"
          @click="emitirEventoMarcarCumprido(item)"
          title="Marcar como cumprido"
          size="small" 
        >
          <v-icon>mdi-check-circle</v-icon>
        </v-btn>
      </template>

    </v-data-table-server>

    <v-dialog v-model="dialogObs" max-width="600px" persistent>
      <v-card>
        <v-card-title>
          <span class="headline">Editar Observações</span>
        </v-card-title>
        <v-card-text>
          <v-textarea
            v-model="itemEdicao.observacoes"
            label="Observações do Processo"
            rows="5"
            auto-grow
            counter
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dialogObs = false">Cancelar</v-btn>
          <v-btn color="primary" @click="emitirEventoSalvarObs">
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>



<script setup>
import { ref } from 'vue';
import { parseISO, format } from 'date-fns';

// --- 1. PROPS (ATUALIZADO) ---
const props = defineProps({
  items: { type: Array, default: () => [] },
  totalItems: { type: Number, default: 0 }, // NOVO: Total de itens no DB
  loading: { type: Boolean, default: false },
  selected: { type: Array, default: () => [] },
  // 'search' foi removido (o pai controla)
  // 'sortBy' foi removido (agora vem pelo evento 'options')
});

// --- 2. EVENTS (ATUALIZADO) ---
const emit = defineEmits([
  'salvar-obs', 
  'marcar-cumprido', 
  'update:selected',
  'update:options' // NOVO: Evento de paginação/ordenação
]);

// --- 3. ESTADO LOCAL (Sem alteração) ---
const dialogObs = ref(false);
const itemEdicao = ref({ id: null, observacoes: '' });

// --- 4. HEADERS (Sem alteração, mas 'sortable: false' foi removido) ---
// Precisamos habilitar 'sortable' para a ordenação do servidor funcionar.
// O 'prazoRestanteNum' vai precisar de atenção especial.
const headers = ref([
  { title: 'Nº Processo', key: 'numero_processo', width: '17%' },
  { title: 'Atribuído a', key: 'user', width: '10%' },
  { title: 'Classe', key: 'classe_principal', width: '10%' },
  { title: 'Assunto', key: 'assunto_principal', width: '10%' },
  { title: 'Tarjas', key: 'tarjas', width: '10%' },
  { title: 'Prazo Restante', key: 'prazoRestanteNum', width: '12%' }, // <-- Isso vai quebrar
  { title: 'Reit.', key: 'reiteracoes', width: '5%', align: 'center' },
  { title: 'Obs', key: 'observacoes',  width: '19%', sortable: false },
  { title: 'Cumprir', key: 'acaoCumprido', width: '7%', align: 'center', sortable: false },
]);

// --- 5. FUNÇÕES AUXILIARES (Sem alteração) ---
const formatarDataHora = (dataISO) => {
  if (!dataISO) return '';
  try {
    return format(parseISO(dataISO), 'dd/MM/yyyy HH:mm');
  } catch (e) {
    return 'Data inválida';
  }
};

// --- 6. MÉTODOS DE EMIT (Sem alteração) ---
const abrirModalObs = (item) => {
  itemEdicao.value = { ...item };
  dialogObs.value = true;
};
const emitirEventoSalvarObs = () => {
  emit('salvar-obs', itemEdicao.value);
  dialogObs.value = false;
};
const emitirEventoMarcarCumprido = (item) => {
  emit('marcar-cumprido', item);
};
</script>

<style scoped>
/* Seus estilos permanecem os mesmos */ 
.obs-celula {
  cursor: pointer;
  min-height: 40px;
  display: flex;
  align-items: center;
  width: 100%;
}
:deep(th:not(:last-child)) {
  border-right: 1px solid rgba(255, 255, 255, 0.12) !important;
}
:deep(td:not(:last-child)) {
  border-right: 1px solid rgba(255, 255, 255, 0.12) !important;
}
:deep(table) {
  table-layout: fixed;
}
:deep(td) {
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-all;
}
</style>