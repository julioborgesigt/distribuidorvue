<template>
  <v-container class="container-estreito">
    <v-card class="mb-6 pa-3">
      <v-row align="center" justify="space-between">
        
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
              variant="tonal"
            >
              Sair
            </v-btn>
          </div>
        </v-col>
      
      </v-row>
    </v-card>

    <v-card class="mb-6">
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
                :items="uniqueClasses"
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
                :items="uniqueAssuntos"
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
                :items="uniqueTarjas"
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
                    :items="allUsersOptions"
                    item-title="title"
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
                    :items="allUsersOptions"
                    item-title="title"
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

// --- 1. ESTADO DE AUTENTICAÇÃO E FILTROS (Sem mudança) ---
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const search = ref('');
const filters = ref({
  classe: [],
  assunto: [],
  tarjas: [],
  userId: [],
  prazo: null,
  cumprido: false, // Default agora é null (Todos)
});
const selected = ref([]);

// --- 2. NOVO ESTADO PARA PAGINAÇÃO DO SERVIDOR ---
// Estado da Tabela
const loadingTable = ref(true);
const serverItems = ref([]); // Itens da página atual
const totalItems = ref(0);  // Total de itens no DB
const options = ref({});    // { page, itemsPerPage, sortBy }

// Estado dos Gráficos
const loadingCharts = ref(true);
const chartItems = ref([]); // Lista COMPLETA (não paginada) para os gráficos

// --- 3. ESTADO DOS MODAIS (Sem mudança) ---
// (Todo o seu código de 'dialogCadastro', 'dialogReset', 'dialogUpload', 'dialogDelete', etc. permanece o mesmo)
const dialogCadastro = ref(false);
const formCadastroRef = ref(null);
const loadingCadastro = ref(false);
const novoUsuario = ref({ matricula: '', nome: '', senha: '', tipoCadastro: 'usuario_padrao' });
const tipoCadastroOptions = ref([
  { title: 'Admin Padrão', value: 'admin_padrao' },
  { title: 'Admin Super', value: 'admin_super' },
]);
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');
const dialogReset = ref(false);
const formResetRef = ref(null);
const loadingReset = ref(false);
const matriculaParaReset = ref(null);
const allUsersList = ref([]);
const dialogDelete = ref(false);
const formDeleteRef = ref(null);
const loadingDelete = ref(false);
const matriculaParaDelete = ref(null);
const dialogUpload = ref(false);
const loadingUpload = ref(false);
const csvFile = ref(null);
const uploadError = ref(null);
const dialogBulkAssign = ref(false);
const formBulkAssignRef = ref(null);
const loadingBulkAssign = ref(false);
const matriculaParaAtribuir = ref(null);
const requiredRule = v => !!v || 'Campo obrigatório';
const senhaRule = v => (v && v.length >= 8) || 'Senha deve ter no mínimo 8 caracteres';
const allUsersOptions = computed(() => {
  return allUsersList.value.map(user => ({
    title: `${user.nome} (${user.matricula})`,
    value: user.matricula
  }));
});

// NOVA FUNÇÃO: Constrói os parâmetros de query para os GRÁFICOS
// (É uma cópia do buildQueryParams, mas IGNORA o filtro 'cumprido')
const buildChartQueryParams = () => {
  const params = new URLSearchParams();
  
  // Filtros (SEM o 'cumprido')
  if (search.value) {
    params.append('search', search.value);
  }
  // O filtro 'cumprido' é IGNORADO AQUI
  if (filters.value.prazo) {
    params.append('prazo', filters.value.prazo);
  }
  
  // Filtros de Array
  filters.value.classe.forEach(v => params.append('classe', v));
  filters.value.assunto.forEach(v => params.append('assunto', v));
  filters.value.tarjas.forEach(v => params.append('tarjas', v));

  // --- LÓGICA DE FILTRO DE USUÁRIO ATUALIZADA ---
  const userIdFilterValues = filters.value.userId || [];
  
  // 1. Separa os IDs reais (ex: 1, 2, 3) do nosso sinalizador 'NA'
  const realUserIds = userIdFilterValues.filter(id => id !== 'NA');
  const includesNaoAtribuido = userIdFilterValues.includes('NA');

  // 2. Anexa os IDs reais à query
  realUserIds.forEach(id => params.append('userId', id));

  // 3. Se 'NA' foi selecionado, anexa um sinalizador separado
  if (includesNaoAtribuido) {
    params.append('includeNA', 'true');
  }
  // --- FIM DA LÓGICA ATUALIZADA ---

  return params;
};



// --- 4. CÁLCULOS E COMPUTAÇÕES (Refatorados) ---

// Funções puras de cálculo (movidas para o topo)
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

// 'processedChartItems' substitui 'chartFilteredProcesses'
// Ele agora é baseado em 'chartItems' (que vem da API)
const processedChartItems = computed(() => {
  return chartItems.value.map(proc => {
    const prazoNum = getPrazoRestanteNum(proc);
    return {
      ...proc,
      prazoRestanteNum: prazoNum,
      prazoRestanteStr: formatarPrazo(prazoNum),
      prazoRestanteColor: getCorPrazo(prazoNum)
    };
  });
});

// 'cumpridos30d' agora se baseia em 'processedChartItems'
const cumpridos30d = computed(() => {
  const dataLimite = subDays(startOfToday(), 30);
  return processedChartItems.value.filter(p => {
    if (!p.cumprido || !p.cumpridoDate) return false;
    return parseISO(p.cumpridoDate) >= dataLimite;
  });
});

// 'pendentes' agora se baseia em 'processedChartItems'
const pendentes = computed(() => {
  return processedChartItems.value.filter(p => !p.cumprido);
});

// 'statsData' e 'cumpridosChartData' não mudam, pois dependem de 'pendentes' e 'cumpridos30d'
const statsData = computed(() => {
  const list = pendentes.value; 
  const total = list.length;
  if (total === 0) return { total: 0, byUser: [], byPrazo: [], byAssunto: [] };

  const userCounts = {};
  list.forEach(p => {
    const nome = p.User?.nome || 'N.A.';
    userCounts[nome] = (userCounts[nome] || 0) + 1;
  });
  const byUser = Object.entries(userCounts)
    .map(([nome, count]) => ({
      nome,
      count,
      percent: (count / total) * 100
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 11);

  const vencidos = list.filter(p => p.prazoRestanteNum < 0).length;
  const p10d = list.filter(p => p.prazoRestanteNum >= 0 && p.prazoRestanteNum <= 10).length;
  const p30d = list.filter(p => p.prazoRestanteNum > 10 && p.prazoRestanteNum <= 30).length;
  
  const byPrazo = [
    { nome: 'Vencidos', count: vencidos, percent: (vencidos / total) * 100 },
    { nome: 'P < 10d', count: p10d, percent: (p10d / total) * 100 },
    { nome: 'P < 30d', count: p30d, percent: (p30d / total) * 100 }
  ];
  
  const assuntosChave = ['Homicídio', 'Roubo', 'Furto', 'Estelionato', 'Tráfico'];
  const byAssunto = assuntosChave.map(assunto => {
    const count = list.filter(p => p.assunto_principal?.includes(assunto)).length;
    return {
      nome: assunto,
      count: count,
      percent: (count / total) * 100
    };
  });

  return { total, byUser, byPrazo, byAssunto };
});

const cumpridosChartData = computed(() => {
  const userCounts = new Map();
  cumpridos30d.value.forEach(processo => {
    const userName = processo.User?.nome || 'Não Atribuído';
    const currentCount = userCounts.get(userName) || 0;
    userCounts.set(userName, currentCount + 1);
  });
  const sortedUsers = Array.from(userCounts.entries())
                           .sort((a, b) => b[1] - a[1]);
  const labels = sortedUsers.map(entry => entry[0]);
  const data = sortedUsers.map(entry => entry[1]);
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


// --- 5. LÓGICA DE BUSCA DE DADOS (TOTALMENTE NOVA) ---

// Constrói os parâmetros de query para a API
const buildQueryParams = () => {
  const params = new URLSearchParams();
  
  // Filtros
  if (search.value) {
    params.append('search', search.value);
  }
  if (filters.value.cumprido !== null) {
    params.append('cumprido', filters.value.cumprido);
  }
  if (filters.value.prazo) {
    params.append('prazo', filters.value.prazo);
  }
  
  // Filtros de Array
  filters.value.classe.forEach(v => params.append('classe', v));
  filters.value.assunto.forEach(v => params.append('assunto', v));
  filters.value.tarjas.forEach(v => params.append('tarjas', v));

  // --- LÓGICA DE FILTRO DE USUÁRIO ATUALIZADA ---
  const userIdFilterValues = filters.value.userId || [];
  
  // 1. Separa os IDs reais (ex: 1, 2, 3) do nosso sinalizador 'NA'
  const realUserIds = userIdFilterValues.filter(id => id !== 'NA');
  const includesNaoAtribuido = userIdFilterValues.includes('NA');

  // 2. Anexa os IDs reais à query
  realUserIds.forEach(id => params.append('userId', id));

  // 3. Se 'NA' foi selecionado, anexa um sinalizador separado
  if (includesNaoAtribuido) {
    params.append('includeNA', 'true');
  }
  // --- FIM DA LÓGICA ATUALIZADA ---

  return params;
};

// NOVA FUNÇÃO: Busca dados paginados para a TABELA
const fetchTableData = async () => {
  loadingTable.value = true;
  
  // Começa com os filtros
  const params = buildQueryParams();
  
  // Adiciona paginação e ordenação
  params.append('page', options.value.page || 1);
  params.append('itemsPerPage', options.value.itemsPerPage || 10);
  params.append('sortBy', JSON.stringify(options.value.sortBy || []));

  try {
    const response = await apiClient.get('/admin/processes', { params });
    
    // ATENÇÃO: Precisamos calcular os campos de prazo AQUI
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

// NOVA FUNÇÃO: Busca TODOS os dados (não paginados) para os GRÁFICOS
const fetchChartData = async () => {
  loadingCharts.value = true;

  // Começa com os filtros
  const params = buildChartQueryParams();
  
  // Adiciona o flag para buscar TUDO
  params.append('itemsPerPage', -1); // O backend entende -1 como "todos"

  try {
    const response = await apiClient.get('/admin/processes', { params });
    chartItems.value = response.data.items; // Atualiza os dados dos gráficos
    
  } catch (error) {
    console.error('Erro ao buscar dados dos gráficos:', error);
    snackbarText.value = 'Erro ao carregar dados dos gráficos.';
    snackbarColor.value = 'error';
    snackbar.value = true;
  } finally {
    loadingCharts.value = false;
  }
};

// --- 6. OBSERVADORES (WATCHERS) ---

// Observador para a TABELA
// Dispara quando 'options' (página, itensPorPagina, sortBy) muda
watch(options, fetchTableData, { deep: true });

// Observador para os FILTROS
// Dispara quando 'filters' ou 'search' mudam
watch(
  [filters, search],
  () => {
    // Quando um filtro muda, força a tabela a voltar para a página 1
    // (O v-data-table-server faz isso automaticamente se o 'items-length' mudar,
    // mas vamos garantir que as buscas sejam chamadas)
    fetchTableData();
    fetchChartData();
  },
  { deep: true }
);

// --- 7. MONTAGEM INICIAL ---

onMounted(() => {
  // A carga inicial da tabela e gráficos é disparada pelos watchers
  // (se 'options' tiver um valor inicial)
  // Mas vamos garantir que 'fetchTableData' seja chamado se 'options' estiver vazio
  if (Object.keys(options.value).length === 0) {
    fetchTableData();
  }
  fetchChartData();
  fetchAllUsers();
});

// --- 8. FUNÇÕES DE CRUD (Atualizadas para recarregar os dados) ---

// Recarrega todos os dados do servidor
const reloadAllData = async () => {
  await fetchTableData();
  await fetchChartData();
};

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

// Salvar Observações
const handleSalvarObservacoes = async (itemEditado) => {
  try {
    const id = itemEditado.id;
    const obs = itemEditado.observacoes;
    await apiClient.put(`/admin/processes/${id}/observacoes`, { observacoes: obs });
    
    // EM VEZ DE ATUALIZAR LOCALMENTE, RECARREGA OS DADOS
    await reloadAllData();

  } catch (error) {
    console.error("Erro ao salvar observação:", error);
  }
};

// Marcar/Desmarcar como Cumprido
const handleMarcarComoCumprido = async (item) => {
  const acao = item.cumprido ? 'desfazer-cumprir' : 'cumprir';
  const confirmar = confirm(`Deseja realmente ${item.cumprido ? 'DESMARCAR' : 'MARCAR'} o processo ${item.numero_processo} como cumprido?`);
  
  if (!confirmar) return;

  try {
    await apiClient.patch(`/admin/processes/${item.id}/${acao}`);
    
    // EM VEZ DE ATUALIZAR LOCALMENTE, RECARREGA OS DADOS
    await reloadAllData();

  } catch (error) {
    console.error(`Erro ao ${acao} processo:`, error);
  }
};

// Ação de Logout (do passo anterior)
const handleLogout = () => {
  authStore.logout();
};

// --- Funções de Modais (Atualizadas para recarregar) ---

// CADASTRO
const abrirModalCadastro = () => { /* ... (código idêntico) ... */ 
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
    await fetchAllUsers(); // <-- Ação específica
  } catch (error) {
    if (error.response && error.response.status === 409) {
      snackbarText.value = 'Erro: Matrícula já cadastrada.';
    } else {
      snackbarText.value = 'Erro ao salvar usuário. Tente novamente.';
    }
    snackbarColor.value = 'error';
    snackbar.value = true;
  } finally {
    loadingCadastro.value = false;
  }
};

// RESET
const abrirModalReset = () => { /* ... (código idêntico) ... */ 
  matriculaParaReset.value = null;
  formResetRef.value?.resetValidation();
  dialogReset.value = true;
};
const fecharModalReset = () => { dialogReset.value = false; };
const handleResetarSenha = async () => { /* ... (código idêntico) ... */ 
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
    if (error.response && error.response.status === 404) {
      snackbarText.value = 'Erro: Usuário não encontrado com esta matrícula.';
    } else {
      snackbarText.value = 'Erro ao resetar senha. Tente novamente.';
    }
    snackbarColor.value = 'error';
    snackbar.value = true;
  } finally {
    loadingReset.value = false;
  }
};

// DELETE USER
const abrirModalDelete = () => { /* ... (código idêntico) ... */ 
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
    await fetchAllUsers(); // <-- Ação específica
    await reloadAllData(); // <-- Recarrega dados (processos podiam ser dele)
  } catch (error) {
    const msg = error.response?.data || 'Erro ao apagar usuário. Tente novamente.';
    snackbarText.value = `Erro: ${msg}`;
    snackbarColor.value = 'error';
    snackbar.value = true;
  } finally {
    loadingDelete.value = false;
  }
};

// UPLOAD CSV
const abrirModalUpload = () => { /* ... (código idêntico) ... */ 
  csvFile.value = null;
  uploadError.value = null;
  dialogUpload.value = true;
};
const fecharModalUpload = () => { dialogUpload.value = false; };
const onFileChange = (event) => { /* ... (código idêntico) ... */ 
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
  if (!csvFile.value) { /* ... (código idêntico) ... */ 
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
    loadingUpload.value = false;
    fecharModalUpload();
    snackbarText.value = response.data || 'CSV importado com sucesso!';
    snackbarColor.value = 'success';
    snackbar.value = true;
    await reloadAllData(); // <-- RECARREGA TUDO
  } catch (error) {
    loadingUpload.value = false;
    const msg = error.response?.data?.error || error.response?.data || 'Erro ao importar CSV.';
    uploadError.value = msg;
  }
};

// BULK ASSIGN
const abrirModalBulkAssign = () => { /* ... (código idêntico) ... */ 
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
    await reloadAllData(); // <-- RECARREGA TUDO
  } catch (error) {
    const msg = error.response?.data || 'Erro ao atribuir processos.';
    snackbarText.value = `Erro: ${msg}`;
    snackbarColor.value = 'error';
    snackbar.value = true;
  } finally {
    loadingBulkAssign.value = false;
  }
};

// --- 9. OPÇÕES PARA OS FILTROS (Sem mudança) ---
// (Todo o seu código 'getUniqueValues', 'uniqueClasses', 'statusCumpridoOptions', etc. permanece o mesmo)
const getUniqueValues = (key) => {
  return computed(() => {
    // Agora se baseia em 'chartItems'
    if (!chartItems.value) return [];
    const values = new Set(chartItems.value.map(p => p[key]).filter(Boolean));
    return [...values];
  });
};
const uniqueClasses = getUniqueValues('classe_principal');
const uniqueAssuntos = getUniqueValues('assunto_principal');
const uniqueTarjas = getUniqueValues('tarjas');
const uniqueUsers = computed(() => {
  // 1. Cria a nossa opção especial "Não Atribuído"
  // Usamos 'NA' como um valor especial que o backend vai entender
  const naoAtribuidoOption = { title: 'Não Atribuído', value: 'NA' };

  // 2. Mapeia os usuários reais
  const userOptions = allUsersList.value 
    ? allUsersList.value.map(user => ({
        title: user.nome,
        value: user.id 
      }))
    : [];

  // 3. Retorna a lista combinada, com "Não Atribuído" primeiro
  return [naoAtribuidoOption, ...userOptions];
});
const statusCumpridoOptions = [
  { title: 'Todos', value: null },
  { title: 'Cumprido', value: true },
  { title: 'Não Cumprido', value: false }
];
const prazoOptions = [
  { title: 'Vencido', value: 'vencido' },
  { title: 'A Vencer', value: 'a_vencer' }
];

// --- 10. FUNÇÃO DE GERAR PDF (Atualizada) ---

// 'sortBy' não existe mais. Devemos usar 'options.value.sortBy'
// 'filteredProcesses' não existe mais. Devemos usar 'serverItems.value'
const downloadPDF = (dataToExport) => {
  let processesToExport;

  // Decide se exporta os 'selecionados' ou os 'exibidos na tabela'
  if (dataToExport === selected.value) {
    processesToExport = [...dataToExport]; // Usa os selecionados
  } else {
    // 'dataToExport' será 'serverItems.value' (os itens da página atual)
    processesToExport = [...serverItems.value];
  }

  // Ordena os dados
  const sortState = options.value.sortBy || [];
  if (sortState.length > 0) {
    processesToExport = sortProcesses(processesToExport, sortState);
  }
  
  if (processesToExport.length === 0) {
    alert('Nenhum item para exportar.');
    return;
  }
  
  // (O resto da sua lógica de PDF, colunas e linhas permanece o mesmo)
  // ...
  const doc = new jsPDF('l', 'mm', 'a4');
  const printDate = new Date().toLocaleDateString('pt-BR');
  const processCount = processesToExport.length;
  // ... (Lógica de filtros) ...
  let filtersText = '...'; // (Sua lógica de filtros aqui) ...

  doc.setFontSize(18);
  doc.text('Relatório de Processos', 14, 22);
  // ... (Resto da geração de PDF) ...

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
    prazoRestanteStr: proc.prazoRestanteStr || 'N/A', // 'prazoRestanteStr' é calculado em 'fetchTableData'
    reiteracoes: proc.reiteracoes || 0,
    observacoes: proc.observacoes || ''
  }));

  autoTable(doc, {
    columns: columns,
    body: rows,
    startY: 55,
    // ... (Seus estilos de PDF) ...
  });

  doc.save('processos.pdf');
};

// Funções de ordenação para o PDF (não mudam)
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


</script>

<style scoped>
.container-estreito {
  max-width: 1400px; 
}
</style>