<template>
  <v-container class="container-estreito">
    
    <v-alert
      v-if="unassignedCount > 0 && showUnassignedAlert"
      type="warning"
      variant="tonal"
      closable
      @click:close="showUnassignedAlert = false"
      class="mb-6"
      border="start"
      prominent
    >
      <div class="d-flex justify-space-between align-center flex-wrap ga-2">
        <div>
          Atenção: Existem <strong>{{ unassignedCount }}</strong> processo(s) sem atribuição.
        </div>
        <v-btn
          color="warning"
          variant="flat"
          @click="filterUnassigned"
          size="small"
        >
          Filtrar Não Atribuídos
        </v-btn>
      </div>
    </v-alert>
    <v-card class="mb-6 pa-3">
      <v-row align="center" justify="space-between">
         <v-btn
              :title="theme.global.current.value.dark ? 'Mudar para tema claro' : 'Mudar para tema escuro'"
              icon
              @click="toggleTheme"
              class="mr-1 ml-4"
            >
              <v-icon>
                {{ theme.global.current.value.dark ? 'mdi-white-balance-sunny' : 'mdi-weather-night' }}
              </v-icon>
            </v-btn>
        <v-col cols="12" md="auto" class="text-center text-md-left">
          
          <div class="text-h6">Bem-vindo, {{ user?.nome }}!</div>
          <div class="text-body-2">
            Você está logado como: 
            <strong>{{ user?.admin_super ? 'Admin Super' : (user?.admin_padrao ? 'Admin Padrão' : 'Usuário') }}</strong>
          </div>
        </v-col>

        <v-col cols="12" md="auto">
          <div class="d-flex flex-wrap justify-center justify-md-end" style="gap: 10px;">
            
            <template v-if="user?.admin_super">
              <v-btn 
                color="primary" 
                variant="tonal" 
                prepend-icon="mdi-account-plus-outline"
                @click="abrirModalCadastro"
              >
                Cadastrar Usuário
              </v-btn>
              <v-btn 
                color="orange" 
                variant="tonal" 
                prepend-icon="mdi-lock-reset"
                @click="abrirModalReset"
              >
                Resetar Senha
              </v-btn>
              <v-btn 
                color="red" 
                variant="tonal" 
                prepend-icon="mdi-account-remove-outline"
                @click="abrirModalDelete"
              >
                Apagar Usuário
              </v-btn>
            
              <v-btn 
                color="teal" 
                variant="tonal" 
                prepend-icon="mdi-file-upload-outline"
                @click="abrirModalUpload"
              >
                Importar CSV
              </v-btn>
            </template>
           

            <v-btn 
              @click="handleLogout" 
              prepend-icon="mdi-logout"
              variant="text"
            >
              Sair
            </v-btn>
          </div>
        </v-col>
      
      </v-row>
    </v-card>

    <v-card class="mb-6 d-none d-md-block">
      <v-row dense class="pa-4">
        
        <v-col cols="12" md="6"> 
          <stats-grid 
          :stats="statsData" 
          style="max-height: 400px; padding-right: 1%;"
          />
        </v-col>       

        

        <v-col cols="12" md="6" class="border-s pl-4"> <v-card-subtitle>Cumpridos por Usuário (Últimos 30 dias)</v-card-subtitle>
          <cumpridos-chart 
            :chart-data="cumpridosChartData" 
            style="max-height: 400px;"
          />
        </v-col>

      </v-row> 
    </v-card>
    
    <v-expansion-panels class="mb-6">
       <v-expansion-panel> <v-expansion-panel-title>
          <v-icon start>mdi-filter-variant</v-icon>
          Filtros
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-row>
            <v-col cols="12" md="4">
              <v-autocomplete
                v-model="filters.classe"
                label="Classe"
                density="compact"
                variant="outlined"
                clearable
                multiple
                chips
              ></v-autocomplete>
            </v-col>
            <v-col cols="12" md="4">
              <v-autocomplete
                v-model="filters.assunto"
                label="Assunto"
                density="compact"
                variant="outlined"
                clearable
                multiple
                chips
              ></v-autocomplete>
            </v-col>
            <v-col cols="12" md="4">
              <v-autocomplete
                v-model="filters.tarjas"
                label="Tarjas"
                density="compact"
                variant="outlined"
                clearable
                multiple
                chips
              ></v-autocomplete>
            </v-col>
            <v-col cols="12" md="4">
              <v-autocomplete
                v-model="filters.userId"
                :items="uniqueUsers"
                item-title="title"
                item-value="value"
                label="Usuário"
                density="compact"
                variant="outlined"
                clearable
                multiple
                chips
                :disabled="!user?.admin_super"
              ></v-autocomplete>
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="filters.cumprido"
                :items="statusCumpridoOptions"
                item-title="title"
                item-value="value"
                label="Status (Cumprido)"
                density="compact"
                variant="outlined"
                :disabled="!user?.admin_super"
              ></v-select>
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="filters.prazo"
                :items="prazoOptions"
                item-title="title"
                item-value="value"
                label="Prazo Restante"
                density="compact"
                variant="outlined"
                clearable
              ></v-select>
            </v-col>
            <v-col cols="12" md="3">
              <v-menu
                v-model="menuInicio"
                :close-on-content-click="false"
                location="bottom end"
                transition="scale-transition"
              >
                <template v-slot:activator="{ props }">
                  <v-text-field
                    v-model="formattedDataInicio"
                    label="Data Início (Cumprido)"
                    density="compact"
                    variant="outlined"
                    prepend-inner-icon="mdi-calendar"
                    readonly
                    clearable
                    @click:clear="filters.data_inicio = null"
                    v-bind="props"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="filters.data_inicio"
                  @update:model-value="menuInicio = false"
                  locale="pt-BR"
                  hide-header
                  title="Data Início"
                ></v-date-picker>
              </v-menu>
            </v-col>
            <v-col cols="12" md="3">
              <v-menu
                v-model="menuFim"
                :close-on-content-click="false"
                location="bottom end"
                transition="scale-transition"
              >
                <template v-slot:activator="{ props }">
                  <v-text-field
                    v-model="formattedDataFim"
                    label="Data Fim (Cumprido)"
                    density="compact"
                    variant="outlined"
                    prepend-inner-icon="mdi-calendar"
                    readonly
                    clearable
                    @click:clear="filters.data_fim = null"
                    v-bind="props"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="filters.data_fim"
                  @update:model-value="menuFim = false"
                  locale="pt-BR"
                  hide-header
                  title="Data Fim"
                ></v-date-picker>
              </v-menu>
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel> </v-expansion-panels>
    


    <v-card>
      <v-card-title class="d-flex justify-space-between align-center flex-wrap ga-2">
        <span class="text-h5">Lista de Processos</span>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="flat"
          prepend-icon="mdi-download"
          @click="downloadPDF(serverItems)" :disabled="serverItems.length === 0" >
          Baixar Exibidos
        </v-btn>
        <v-btn
          color="blue-grey"
          variant="flat"
          prepend-icon="mdi-download-box-outline"
          @click="downloadPDF(selected)"
          :disabled="selected.length === 0"
        >
          Baixar Selecionados
        </v-btn>
        <v-btn
          color="secondary"
          variant="flat"
          prepend-icon="mdi-account-arrow-right"
          @click="abrirModalBulkAssign"
          :disabled="selected.length === 0"
        >
          Atribuir Seleção
        </v-btn>
        <v-text-field
          v-model="search"
          label="Buscar processo..."
          variant="outlined"
          density="compact"
          prepend-inner-icon="mdi-magnify"
          hide-details
          style="max-width: 300px"
        ></v-text-field>
      </v-card-title>
      
      <tabela-processos
        v-model:selected="selected"
        :items="serverItems"
        :totalItems="totalItems"
        :loading="loadingTable"
        @update:options="options = $event"
        @salvar-obs="handleSalvarObservacoes"
        @marcar-cumprido="handleMarcarComoCumprido"
      />
    
    </v-card> <v-dialog v-model="dialogCadastro" max-width="600px" persistent>
      <v-card>
        <v-form ref="formCadastroRef" @submit.prevent="handleSalvarCadastro">
          <v-card-title>
            <span class="text-h5">Cadastrar Novo Usuário</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="novoUsuario.nome"
                    label="Nome Completo"
                    :rules="[requiredRule]"
                    variant="outlined"
                    density="compact"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="novoUsuario.matricula"
                    label="Matrícula"
                    :rules="[requiredRule]"
                    variant="outlined"
                    density="compact"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="novoUsuario.senha"
                    label="Senha Provisória"
                    :rules="[requiredRule, senhaRule]"
                    type="password"
                    variant="outlined"
                    density="compact"
                    hint="Mínimo 8 caracteres"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <label class="text-body-2">Tipo de Acesso</label>
                  <v-radio-group v-model="novoUsuario.tipoCadastro" inline>
                    <v-radio
                      v-for="opt in tipoCadastroOptions"
                      :key="opt.value"
                      :label="opt.title"
                      :value="opt.value"
                    ></v-radio>
                  </v-radio-group>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="fecharModalCadastro">Cancelar</v-btn>
            <v-btn
              color="primary"
              :loading="loadingCadastro"
              type="submit"
            >
              Salvar
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogReset" max-width="500px" persistent>
      <v-card>
        <v-form ref="formResetRef" @submit.prevent="handleResetarSenha">
          <v-card-title>
            <span class="text-h5">Resetar Senha de Usuário</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-autocomplete
                    v-model="matriculaParaReset"
                    :items="allUsersOptions"
                    item-title="title"
                    item-value="value"
                    label="Selecionar Usuário"
                    :rules="[requiredRule]"
                    variant="outlined"
                    density="compact"
                    placeholder="Digite o nome ou matrícula..."
                  ></v-autocomplete>
                  <div class="text-caption pa-1">
                    A senha do usuário selecionado será redefinida para "12345678".
                  </div>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="fecharModalReset">Cancelar</v-btn>
            <v-btn
              color="orange"
              :loading="loadingReset"
              type="submit"
            >
              Resetar Senha
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogUpload" max-width="500px" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h5">Importar e Atualizar CSV</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-file-input
                  label="Selecionar arquivo CSV"
                  accept=".csv, text/csv"
                  variant="outlined"
                  density="compact"
                  @change="onFileChange"
                  :error-messages="uploadError"
                ></v-file-input>
                <div class="text-caption pa-1">
                  O arquivo será processado pelo backend.
                  Processos existentes serão atualizados se a data de intimação for mais recente.
                </div>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="fecharModalUpload">Cancelar</v-btn>
          <v-btn
            color="teal"
            :loading="loadingUpload"
            @click="handleUploadCSV"
            :disabled="!csvFile"
          >
            Enviar e Processar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>


    <v-dialog v-model="dialogDelete" max-width="500px" persistent>
      <v-card>
        <v-form ref="formDeleteRef" @submit.prevent="handleDeleteUser">
          <v-card-title>
            <span class="text-h5">Apagar Usuário</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-alert
                type="error"
                variant="tonal"
                class="mb-4"
                border="start"
                prominent
              >
                <strong>Atenção:</strong> Esta ação é permanente e não pode ser desfeita. Todos os processos atribuídos a este usuário ficarão "Não Atribuídos".
              </v-alert>

              <v-row>
                <v-col cols="12">
                  <v-autocomplete
                    v-model="matriculaParaDelete"
                    item-title="title"
                    :items="allUsersOptions"
                    item-value="value"
                    label="Selecionar Usuário para Apagar"
                    :rules="[requiredRule]"
                    variant="outlined"
                    density="compact"
                    placeholder="Digite o nome ou matrícula..."
                  ></v-autocomplete>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="fecharModalDelete">Cancelar</v-btn>
            <v-btn
              color="red"
              :loading="loadingDelete"
              type="submit"
            >
              Apagar Usuário
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>




    <v-dialog v-model="dialogBulkAssign" max-width="500px" persistent>
      <v-card>
        <v-form ref="formBulkAssignRef" @submit.prevent="handleBulkAssign">
          <v-card-title>
            <span class="text-h5">Atribuir Processos Selecionados</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <div class="text-subtitle-1 mb-2">
                    <strong>{{ selected.length }}</strong> processo(s) selecionado(s).
                  </div>
                  <v-autocomplete
                    v-model="matriculaParaAtribuir"
                    item-title="title"
                    :items="allUsersOptions"
                    item-value="value"
                    label="Atribuir ao usuário:"
                    :rules="[requiredRule]"
                    variant="outlined"
                    density="compact"
                    placeholder="Selecione o usuário de destino..."
                  ></v-autocomplete>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="fecharModalBulkAssign">Cancelar</v-btn>
            <v-btn
              color="secondary"
              :loading="loadingBulkAssign"
              type="submit"
            >
              Atribuir
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>



    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      :timeout="3000"
      location="top right"
      multi-line
    >
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn icon @click="snackbar = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  
  </v-container>
</template>

<script setup>
// =================================================================
// 1. IMPORTS
// =================================================================
import { ref, onMounted, computed, watch } from 'vue'; 
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import apiClient from '@/api/axios';
import TabelaProcessos from '../components/TabelaProcessos.vue'; 
import StatsGrid from '../components/StatsGrid.vue';
import CumpridosChart from '../components/CumpridosChart.vue';
import { addDays, differenceInDays, startOfToday, parseISO, format, subDays } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useTheme } from 'vuetify'; 

const theme = useTheme();
const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark';
};


// =================================================================
// 2. ESTADO PRINCIPAL (AUTH & FILTROS)
// =================================================================
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const search = ref('');
const filters = ref({
  classe: [],
  assunto: [],
  tarjas: [],
  userId: [],
  prazo: null,
  cumprido: false, // Default é "Não Cumprido"
  data_inicio: null,
  data_fim: null,
});
const selected = ref([]);

// =================================================================
// 3. ESTADO DA TABELA E GRÁFICOS (PAGINAÇÃO DO SERVIDOR)
// =================================================================
const loadingTable = ref(true);
const serverItems = ref([]); // Itens da página atual
const totalItems = ref(0);  // Total de itens no DB
const options = ref({});    // { page, itemsPerPage, sortBy }

const loadingCharts = ref(true);
const statsResponse = ref(null); // Resposta da API de estatísticas
const unassignedCount = ref(0);
const showUnassignedAlert = ref(true);
const allUsersList = ref([]); // Lista de todos os usuários para modais/filtros

// =================================================================
// 4. ESTADO DOS MODAIS E SNACKBAR
// =================================================================
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');
const menuInicio = ref(false);
const menuFim = ref(false);

// Modal: Cadastrar Usuário
const dialogCadastro = ref(false);
const formCadastroRef = ref(null);
const loadingCadastro = ref(false);
const novoUsuario = ref({ matricula: '', nome: '', senha: '', tipoCadastro: 'usuario_padrao' });

// Modal: Resetar Senha
const dialogReset = ref(false);
const formResetRef = ref(null);
const loadingReset = ref(false);
const matriculaParaReset = ref(null);

// Modal: Apagar Usuário
const dialogDelete = ref(false);
const formDeleteRef = ref(null);
const loadingDelete = ref(false);
const matriculaParaDelete = ref(null);

// Modal: Upload CSV
const dialogUpload = ref(false);
const loadingUpload = ref(false);
const csvFile = ref(null);
const uploadError = ref(null);

// Modal: Atribuir em Massa
const dialogBulkAssign = ref(false);
const formBulkAssignRef = ref(null);
const loadingBulkAssign = ref(false);
const matriculaParaAtribuir = ref(null);

// =================================================================
// 5. REGRAS DE VALIDAÇÃO
// =================================================================
const requiredRule = v => !!v || 'Campo obrigatório';
const senhaRule = v => (v && v.length >= 8) || 'Senha deve ter no mínimo 8 caracteres';

// =================================================================
// 6. PROPRIEDADES COMPUTADAS (COMPUTED)
// =================================================================

// Opções para os selects de filtro/modais
const tipoCadastroOptions = ref([
  { title: 'Admin Padrão', value: 'admin_padrao' },
  { title: 'Admin Super', value: 'admin_super' },
]);

const statusCumpridoOptions = [
  { title: 'Todos', value: null },
  { title: 'Cumprido', value: true },
  { title: 'Não Cumprido', value: false }
];

const prazoOptions = [
  { title: 'Vencido', value: 'vencido' },
  { title: 'A Vencer', value: 'a_vencer' }
];

// Gera a lista de usuários para os modais de admin
const allUsersOptions = computed(() => {
  return allUsersList.value.map(user => ({
    title: `${user.nome} (${user.matricula})`,
    value: user.matricula // Modais de admin usam 'matricula'
  }));
});

// Gera a lista de usuários para o FILTRO (incluindo "Não Atribuído")
const uniqueUsers = computed(() => {
  const naoAtribuidoOption = { title: 'Não Atribuído', value: 'NA' };
  const userOptions = allUsersList.value 
    ? allUsersList.value.map(user => ({
        title: user.nome,
        value: user.id // Filtro principal usa 'id'
      }))
    : [];
  return [naoAtribuidoOption, ...userOptions];
});

// Computed para o StatsGrid (baseado na resposta da API)
const statsData = computed(() => {
  if (!statsResponse.value) {
    return { total: 0, byUser: [], byPrazo: [], byAssunto: [] };
  }
  const { totalPendentes, byUser, byPrazo, byAssunto } = statsResponse.value;
  
  const byUserFormatted = byUser.map(user => ({
    ...user,
    percent: totalPendentes > 0 ? (user.count / totalPendentes) * 100 : 0
  }));
  
  const byPrazoFormatted = [
    { nome: 'Vencidos', count: byPrazo.vencidos, percent: totalPendentes > 0 ? (byPrazo.vencidos / totalPendentes) * 100 : 0 },
    { nome: 'P < 10d', count: byPrazo.p10d, percent: totalPendentes > 0 ? (byPrazo.p10d / totalPendentes) * 100 : 0 },
    { nome: 'P < 30d', count: byPrazo.p30d, percent: totalPendentes > 0 ? (byPrazo.p30d / totalPendentes) * 100 : 0 }
  ];
  
  const byAssuntoFormatted = byAssunto.map(assunto => ({
    ...assunto,
    percent: totalPendentes > 0 ? (assunto.count / totalPendentes) * 100 : 0
  }));

  return { 
    total: totalPendentes, 
    byUser: byUserFormatted, 
    byPrazo: byPrazoFormatted, 
    byAssunto: byAssuntoFormatted 
  };
});

// Computed para o CumpridosChart (baseado na resposta da API)
const cumpridosChartData = computed(() => {
  if (!statsResponse.value) {
    return { labels: [], datasets: [] };
  }
  const sortedUsers = statsResponse.value.cumpridos30d;
  const labels = sortedUsers.map(entry => entry.nome);
  const data = sortedUsers.map(entry => entry.count);
  
  return {
    labels: labels,
    datasets: [
      {
        label: 'Processos Cumpridos por Usuário (Últimos 30d)',
        backgroundColor: '#4CAF50',
        data: data
      }
    ]
  };
});

// Formata as datas para exibição nos campos de texto
const formattedDataInicio = computed(() => {
  return filters.value.data_inicio ? format(filters.value.data_inicio, 'dd/MM/yyyy') : '';
});
const formattedDataFim = computed(() => {
  return filters.value.data_fim ? format(filters.value.data_fim, 'dd/MM/yyyy') : '';
});


// =================================================================
// 7. FUNÇÕES HELPERS (Cálculo de Prazo, Construtores de Query)
// =================================================================

// --- Helpers de Cálculo de Prazo (Usados pela Tabela) ---
const parsePrazoDias = (prazoString) => {
  if (!prazoString) return 0;
  const dias = parseInt(prazoString, 10);
  return isNaN(dias) ? 0 : dias;
};
const getPrazoRestanteNum = (proc) => {
    if (!proc.data_intimacao || proc.prazo_processual == null) return null;
    try {
      const hoje = startOfToday();
      const diasDePrazo = parsePrazoDias(proc.prazo_processual);
      const dataIntimacao = parseISO(proc.data_intimacao);
      const dataVencimento = addDays(dataIntimacao, diasDePrazo);
      return differenceInDays(dataVencimento, hoje);
    } catch (e) {
      return null;
    }
};
const formatarPrazo = (dias) => {
  if (dias === null || dias === 'Erro') return 'N/A';
  if (dias < 0) return `Vencido há ${Math.abs(dias)} dias`;
  if (dias === 0) return 'Vence hoje';
  return `Vence em ${dias} dias`;
};
const getCorPrazo = (dias) => {
  if (dias === null || dias === 'Erro') return 'grey';
  if (dias < 0) return 'red';
  if (dias <= 5) return 'orange';
  return 'green';
};

// --- Helpers de Query Params ---
const buildChartQueryParams = () => {
  const params = new URLSearchParams();
  if (search.value) params.append('search', search.value);
  if (filters.value.prazo) params.append('prazo', filters.value.prazo);

  // ✅ INÍCIO DO NOVO BLOCO DE DATA
  // Formata a data para 'yyyy-MM-dd' antes de enviar
  if (filters.value.data_inicio) {
    params.append('dataInicio', format(filters.value.data_inicio, 'yyyy-MM-dd'));
  }
  if (filters.value.data_fim) {
    params.append('dataFim', format(filters.value.data_fim, 'yyyy-MM-dd'));
  }
  // ✅ FIM DO NOVO BLOCO
  
  filters.value.classe.forEach(v => params.append('classe', v));
  filters.value.assunto.forEach(v => params.append('assunto', v));
  filters.value.tarjas.forEach(v => params.append('tarjas', v));

  const userIdFilterValues = filters.value.userId || [];
  const realUserIds = userIdFilterValues.filter(id => id !== 'NA');
  const includesNaoAtribuido = userIdFilterValues.includes('NA');
  realUserIds.forEach(id => params.append('userId', id));
  if (includesNaoAtribuido) params.append('includeNA', 'true');

  return params;
};

const buildQueryParams = () => {
    const params = buildChartQueryParams(); 
    if (filters.value.cumprido !== null) {
      params.append('cumprido', filters.value.cumprido);
    }
    return params;
  };

// =================================================================
// 8. FUNÇÕES API (Chamadas ao Backend)
// =================================================================

// Busca dados paginados para a TABELA
const fetchTableData = async () => {
  loadingTable.value = true;
  const params = buildQueryParams();
  params.append('page', options.value.page || 1);
  params.append('itemsPerPage', options.value.itemsPerPage || 10);
  params.append('sortBy', JSON.stringify(options.value.sortBy || []));

  try {
    const response = await apiClient.get('/admin/processes', { params });
    serverItems.value = response.data.items.map(proc => {
      const prazoNum = getPrazoRestanteNum(proc);
      return {
        ...proc,
        prazoRestanteNum: prazoNum,
        prazoRestanteStr: formatarPrazo(prazoNum),
        prazoRestanteColor: getCorPrazo(prazoNum)
      };
    });
    totalItems.value = response.data.totalItems;
  } catch (error) {
    console.error('Erro ao buscar dados da tabela:', error);
    snackbarText.value = 'Erro ao carregar processos da tabela.';
    snackbarColor.value = 'error';
    snackbar.value = true;
  } finally {
    loadingTable.value = false;
  }
};

// Busca dados de estatísticas para os GRÁFICOS
const fetchChartData = async () => {
  loadingCharts.value = true;
  const params = buildChartQueryParams();
  try {
    const response = await apiClient.get('/admin/stats/dashboard', { params });
    statsResponse.value = response.data;
  } catch (error) {
    console.error('Erro ao buscar dados dos gráficos:', error);
    snackbarText.value = 'Erro ao carregar dados dos gráficos.';
    snackbarColor.value = 'error';
    snackbar.value = true;
  } finally {
    loadingCharts.value = false;
  }
};

// Busca contagem de não atribuídos para o ALERTA
const checkUnassignedProcesses = async () => {
  try {
    const response = await apiClient.get('/admin/stats/unassigned-count');
    unassignedCount.value = response.data.count;
    if (unassignedCount.value > 0) {
      showUnassignedAlert.value = true;
    }
  } catch (error) {
    console.error("Erro ao verificar processos não atribuídos:", error);
  }
};

// Busca a lista de todos os usuários para os modais/filtros
const fetchAllUsers = async () => {
  try {
    const response = await apiClient.get('/admin/users');
    allUsersList.value = response.data;
  } catch (error) {
    console.error("Erro ao buscar lista de usuários:", error);
    snackbarText.value = 'Erro ao carregar lista de usuários.';
    snackbarColor.value = 'error';
    snackbar.value = true;
  }
};

// Recarrega todos os dados da página
const reloadAllData = async () => {
  await fetchTableData();
  await fetchChartData();
  await checkUnassignedProcesses();
};

// =================================================================
// 9. HANDLERS DE EVENTOS (Tabela, UI, Logout)
// =================================================================

// --- Handlers da Tabela ---
const handleSalvarObservacoes = async (itemEditado) => {
  try {
    const { id, observacoes } = itemEditado;
    await apiClient.put(`/admin/processes/${id}/observacoes`, { observacoes });
    await reloadAllData(); // Recarrega para refletir mudança
  } catch (error) {
    console.error("Erro ao salvar observação:", error);
  }
};

const handleMarcarComoCumprido = async (item) => {
  const acao = item.cumprido ? 'desfazer-cumprir' : 'cumprir';
  const confirmar = confirm(`Deseja realmente ${item.cumprido ? 'DESMARCAR' : 'MARCAR'} o processo ${item.numero_processo} como cumprido?`);
  if (!confirmar) return;

  try {
    await apiClient.patch(`/admin/processes/${item.id}/${acao}`);
    await reloadAllData(); // Recarrega para refletir mudança
  } catch (error) {
    console.error(`Erro ao ${acao} processo:`, error);
  }
};

// --- Handlers da UI ---
const filterUnassigned = () => {
  filters.value.userId = ['NA'];
  showUnassignedAlert.value = false;
};

const handleLogout = () => {
  authStore.logout();
};

// --- Handlers de PDF ---
const downloadPDF = (dataToExport) => {
  let processesToExport;
  if (dataToExport === selected.value) {
    processesToExport = [...dataToExport];
  } else {
    processesToExport = [...serverItems.value];
  }

  const sortState = options.value.sortBy || [];
  if (sortState.length > 0) {
    processesToExport = sortProcesses(processesToExport, sortState);
  }
  
  if (processesToExport.length === 0) {
    alert('Nenhum item para exportar.');
    return;
  }
  
  const doc = new jsPDF('l', 'mm', 'a4');
  // ... (Sua lógica de PDF) ...
  const columns = [
    { header: 'Nº Processo', dataKey: 'numero_processo' },
    { header: 'Atribuído a', dataKey: 'user' },
    { header: 'Classe', dataKey: 'classe_principal' },
    { header: 'Assunto', dataKey: 'assunto_principal' },
    { header: 'Tarjas', dataKey: 'tarjas' },
    { header: 'Prazo', dataKey: 'prazoRestanteStr' },
    { header: 'Reiterações', dataKey: 'reiteracoes' },
    { header: 'Obs', dataKey: 'observacoes' }
  ];
  const rows = processesToExport.map(proc => ({
    numero_processo: proc.numero_processo || '',
    user: proc.User?.nome || 'N.A.',
    classe_principal: proc.classe_principal || '',
    assunto_principal: proc.assunto_principal || '',
    tarjas: proc.tarjas || '',
    prazoRestanteStr: proc.prazoRestanteStr || 'N/A',
    reiteracoes: proc.reiteracoes || 0,
    observacoes: proc.observacoes || ''
  }));
  autoTable(doc, { columns, body: rows, startY: 55 });
  doc.save('processos.pdf');
};

const getValue = (obj, path) => {
  if (path === 'user') return obj.User?.nome;
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const sortProcesses = (processList, sortState) => {
  if (!sortState || sortState.length === 0) return processList;
  const { key, order } = sortState[0];
  if (!key) return processList;
  return [...processList].sort((a, b) => {
    let valA = getValue(a, key);
    let valB = getValue(b, key);
    if (valA == null) return 1;
    if (valB == null) return -1;
    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }
    if (valA < valB) return order === 'asc' ? -1 : 1;
    if (valA > valB) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

// =================================================================
// 10. FUNÇÕES DOS MODAIS (Admin)
// =================================================================

// --- Modal Cadastrar ---
const abrirModalCadastro = () => {
  novoUsuario.value = { matricula: '', nome: '', senha: '', tipoCadastro: 'usuario_padrao' };
  formCadastroRef.value?.resetValidation();
  dialogCadastro.value = true;
};
const fecharModalCadastro = () => { dialogCadastro.value = false; };
const handleSalvarCadastro = async () => {
  const { valid } = await formCadastroRef.value.validate();
  if (!valid) return;
  loadingCadastro.value = true;
  try {
    await apiClient.post('/admin/pre-cadastro', novoUsuario.value);
    snackbarText.value = 'Usuário cadastrado com sucesso!';
    snackbarColor.value = 'success';
    snackbar.value = true;
    fecharModalCadastro();
    await fetchAllUsers(); // Atualiza a lista de usuários
  } catch (error) {
    snackbarText.value = error.response?.data?.error || 'Erro ao salvar usuário.';
    snackbarColor.value = 'error';
    snackbar.value = true;
  } finally {
    loadingCadastro.value = false;
  }
};

// --- Modal Resetar Senha ---
const abrirModalReset = () => {
  matriculaParaReset.value = null;
  formResetRef.value?.resetValidation();
  dialogReset.value = true;
};
const fecharModalReset = () => { dialogReset.value = false; };
const handleResetarSenha = async () => {
  const { valid } = await formResetRef.value.validate();
  if (!valid) return;
  loadingReset.value = true;
  try {
    await apiClient.post('/admin/reset-password', { matricula: matriculaParaReset.value });
    snackbarText.value = 'Senha resetada com sucesso para "12345678"!';
    snackbarColor.value = 'success';
    snackbar.value = true;
    fecharModalReset();
  } catch (error) {
    snackbarText.value = error.response?.data || 'Erro ao resetar senha.';
    snackbarColor.value = 'error';
    snackbar.value = true;
  } finally {
    loadingReset.value = false;
  }
};

// --- Modal Apagar Usuário ---
const abrirModalDelete = () => {
  matriculaParaDelete.value = null;
  formDeleteRef.value?.resetValidation();
  dialogDelete.value = true;
};
const fecharModalDelete = () => { dialogDelete.value = false; };
const handleDeleteUser = async () => {
  const { valid } = await formDeleteRef.value.validate();
  if (!valid) return;
  loadingDelete.value = true;
  try {
    await apiClient.post('/admin/delete-matricula', { matricula: matriculaParaDelete.value });
    
    snackbarText.value = 'Usuário apagado com sucesso!';
    snackbarColor.value = 'success';
    snackbar.value = true;
    fecharModalDelete();
    await fetchAllUsers(); // Atualiza a lista de usuários
    await reloadAllData(); // Recarrega processos (podem ter sido desatribuídos)

  } catch (error) {
    // ✅ CORREÇÃO: Lê a propriedade 'error' da resposta JSON do backend
    snackbarText.value = error.response?.data?.error || 'Erro ao apagar usuário.';
    
    snackbarColor.value = 'error';
    snackbar.value = true;
  } finally {
    loadingDelete.value = false;
  }
};

// --- Modal Upload CSV ---
const abrirModalUpload = () => {
  csvFile.value = null;
  uploadError.value = null;
  dialogUpload.value = true;
};
const fecharModalUpload = () => { dialogUpload.value = false; };
const onFileChange = (event) => {
  const files = event.target.files;
  if (files && files.length > 0) {
    if (files[0].type === 'text/csv' || files[0].name.endsWith('.csv')) {
      csvFile.value = files[0];
      uploadError.value = null;
    } else {
      csvFile.value = null;
      uploadError.value = "Formato de arquivo inválido. Por favor, selecione um arquivo .csv";
    }
  }
};
const handleUploadCSV = async () => {
  if (!csvFile.value) {
    uploadError.value = "Nenhum arquivo selecionado.";
    return;
  }
  loadingUpload.value = true;
  uploadError.value = null;
  const formData = new FormData();
  formData.append('csvFile', csvFile.value);
  try {
    const response = await apiClient.post('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    fecharModalUpload();
    snackbarText.value = response.data || 'CSV importado com sucesso!';
    snackbarColor.value = 'success';
    snackbar.value = true;
    await reloadAllData(); // Recarrega tudo
  } catch (error) {
    loadingUpload.value = false;
    uploadError.value = error.response?.data?.error || 'Erro ao importar CSV.';
  }
};

// --- Modal Atribuir em Massa ---
const abrirModalBulkAssign = () => {
  if (selected.value.length === 0) {
    snackbarText.value = 'Nenhum processo selecionado.';
    snackbarColor.value = 'warning';
    snackbar.value = true;
    return;
  }
  matriculaParaAtribuir.value = null;
  formBulkAssignRef.value?.resetValidation();
  dialogBulkAssign.value = true;
};
const fecharModalBulkAssign = () => { dialogBulkAssign.value = false; };
const handleBulkAssign = async () => {
  const { valid } = await formBulkAssignRef.value.validate();
  if (!valid) return;
  const processIds = selected.value.map(processo => processo.id);
  loadingBulkAssign.value = true;
  try {
    await apiClient.post('/admin/bulk-assign', { 
      processIds: processIds,
      matricula: matriculaParaAtribuir.value
    });
    snackbarText.value = 'Processos atribuídos com sucesso!';
    snackbarColor.value = 'success';
    snackbar.value = true;
    fecharModalBulkAssign();
    selected.value = [];
    await reloadAllData(); // Recarrega tudo
  } catch (error) {
    snackbarText.value = error.response?.data || 'Erro ao atribuir processos.';
    snackbarColor.value = 'error';
    snackbar.value = true;
  } finally {
    loadingBulkAssign.value = false;
  }
};

// =================================================================
// 11. OBSERVADORES (WATCHERS)
// =================================================================

// Dispara quando 'options' (página, itensPorPagina, sortBy) muda
watch(options, fetchTableData, { deep: true });

// Dispara quando 'filters' ou 'search' mudam
watch(
  [filters, search],
  () => {
    // Quando um filtro muda, reseta a paginação e busca novos dados
    fetchTableData();
    fetchChartData();
    checkUnassignedProcesses(); // Re-verifica o alerta também
  },
  { deep: true }
);

// =================================================================
// 12. LIFECYCLE HOOKS
// =================================================================

onMounted(() => {
  // A chamada inicial do 'fetchTableData' é disparada pelo 'watch(options...)'
  // Mas as outras precisam ser chamadas manualmente.
  fetchChartData();
  fetchAllUsers();
  checkUnassignedProcesses();
});

</script>



<style scoped>
.container-estreito {
  max-width: 1400px; 
}
</style>