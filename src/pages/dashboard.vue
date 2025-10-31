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
          @click="downloadPDF(filteredProcesses)"
          :disabled="filteredProcesses.length === 0"
        >
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
        v-model:sort-by="sortBy"
        :items="filteredProcesses"
        :loading="loading"
        :search="search"
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
// **** NOVO: Importa os componentes de gráfico ****
import StatsGrid from '../components/StatsGrid.vue';
import CumpridosChart from '../components/CumpridosChart.vue';
// **********************************************
// **** ATUALIZADO: 'subDays' foi adicionado ****
import { addDays, differenceInDays, startOfToday, parseISO, format, subDays } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- 1-4. ESTADOS (Existentes) ---
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const loading = ref(true);
const processes = ref([]);
const search = ref('');
const filters = ref({
  classe: [],
  assunto: [],
  tarjas: [],
  userId: [],
  prazo: null,
  cumprido: false,
});
const selected = ref([]);
const sortBy = ref([]);


// --- 5. ESTADO PARA MODAL DE CADASTRO ---
const dialogCadastro = ref(false);
const formCadastroRef = ref(null);
const loadingCadastro = ref(false);
const novoUsuario = ref({
  matricula: '',
  nome: '',
  senha: '',
  tipoCadastro: 'usuario_padrao' // O backend deve tratar 'usuario_padrao'
});
const tipoCadastroOptions = ref([
  { title: 'Admin Padrão', value: 'admin_padrao' },
  { title: 'Admin Super', value: 'admin_super' },
]);

// --- 6. ESTADO PARA SNACKBAR (Feedback) ---
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');


// --- 6.5. ESTADO PARA MODAL DE RESET ---
const dialogReset = ref(false);
const formResetRef = ref(null);
const loadingReset = ref(false);
const matriculaParaReset = ref(null); // Armazenará a matrícula do usuário a resetar
const allUsersList = ref([]); // Armazena a lista completa de usuários


// ===============================================
// ==== ADICIONE O ESTADO PARA DELETAR ====
// ===============================================
const dialogDelete = ref(false);
const formDeleteRef = ref(null);
const loadingDelete = ref(false);
const matriculaParaDelete = ref(null); // Armazena a matrícula do usuário a apagar

// ===============================================
// ==== ADICIONE O ESTADO PARA UPLOAD ====
// ===============================================
const dialogUpload = ref(false);
const loadingUpload = ref(false);
const csvFile = ref(null); // Armazenará o objeto File
const uploadError = ref(null); // Mensagem de erro do upload

// ===============================================
// ==== FIM DO NOVO ESTADO ====
// ===============================================


// ===============================================
// ==== ADICIONE O ESTADO PARA ATRIBUIÇÃO EM MASSA ====
// ===============================================
const dialogBulkAssign = ref(false);
const formBulkAssignRef = ref(null);
const loadingBulkAssign = ref(false);
const matriculaParaAtribuir = ref(null); // Armazena a matrícula do usuário destino

// ===============================================
// ==== FIM DO NOVO ESTADO ====
// ===============================================

// --- 7. REGRAS DE VALIDAÇÃO ---
const requiredRule = v => !!v || 'Campo obrigatório';
const senhaRule = v => (v && v.length >= 8) || 'Senha deve ter no mínimo 8 caracteres';

// --- 7.5. COMPUTED PARA O AUTOCOMPLETE DE RESET ---
// Transforma a lista de usuários no formato que o v-autocomplete espera
// e que a API de reset precisa (usa a matrícula como 'value')
const allUsersOptions = computed(() => {
  return allUsersList.value.map(user => ({
    title: `${user.nome} (${user.matricula})`,
    value: user.matricula // O backend de reset espera a matrícula
  }));
});


// --- 7. OPÇÕES PARA OS FILTROS (Existentes) ---
const getUniqueValues = (key) => {
  return computed(() => {
    if (!processes.value) return [];
    const values = new Set(processes.value.map(p => p[key]).filter(Boolean));
    return [...values];
  });
};
const uniqueClasses = getUniqueValues('classe_principal');
const uniqueAssuntos = getUniqueValues('assunto_principal');
const uniqueTarjas = getUniqueValues('tarjas');
const uniqueUsers = computed(() => {
  if (!processes.value) return [];
  const usersMap = new Map();
  processes.value.forEach(p => {
    if (p.User) {
      usersMap.set(p.User.id, p.User.nome);
    }
  });
  return Array.from(usersMap, ([id, nome]) => ({ title: nome, value: id }));
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

// --- 8. LÓGICA DE CÁLCULO (Existente) ---
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

// --- 9. LÓGICA DE FILTRAGEM (Existente) ---
const filteredProcesses = computed(() => {
  return processes.value
    .filter(proc => {
      // (Lógica de filtro existente)
      if (filters.value.classe.length > 0 && !filters.value.classe.includes(proc.classe_principal)) return false;
      if (filters.value.assunto.length > 0 && !filters.value.assunto.includes(proc.assunto_principal)) return false;
      if (filters.value.tarjas.length > 0 && !filters.value.tarjas.includes(proc.tarjas)) return false;
      if (filters.value.userId.length > 0 && !filters.value.userId.includes(proc.User?.id)) return false;
      if (filters.value.cumprido !== null && proc.cumprido !== filters.value.cumprido) return false;
      if (filters.value.prazo) {
        const prazoNum = getPrazoRestanteNum(proc);
        if (prazoNum === null) return false; 
        if (filters.value.prazo === 'vencido' && prazoNum >= 0) return false;
        if (filters.value.prazo === 'a_vencer' && prazoNum <= 0) return false;
      }
      return true;
    })
    .map(proc => {
      // ADICIONA OS CAMPOS CALCULADOS
      const prazoNum = getPrazoRestanteNum(proc);
      return {
        ...proc,
        prazoRestanteNum: prazoNum,
        prazoRestanteStr: formatarPrazo(prazoNum),
        prazoRestanteColor: getCorPrazo(prazoNum)
      };
    });
});


const chartFilteredProcesses = computed(() => {
  return processes.value
    .filter(proc => {
      // Filtros normais (copiados de 'filteredProcesses')
      if (filters.value.classe.length > 0 && !filters.value.classe.includes(proc.classe_principal)) return false;
      if (filters.value.assunto.length > 0 && !filters.value.assunto.includes(proc.assunto_principal)) return false;
      if (filters.value.tarjas.length > 0 && !filters.value.tarjas.includes(proc.tarjas)) return false;
      if (filters.value.userId.length > 0 && !filters.value.userId.includes(proc.User?.id)) return false;
      
      // !! A LINHA 'if (filters.value.cumprido ...)' FOI REMOVIDA AQUI DE PROPÓSITO !!
      
      if (filters.value.prazo) {
        // Precisamos recalcular o prazoNum aqui também
        const prazoNum = getPrazoRestanteNum(proc);
        if (prazoNum === null) return false; 
        if (filters.value.prazo === 'vencido' && prazoNum >= 0) return false;
        if (filters.value.prazo === 'a_vencer' && prazoNum <= 0) return false;
      }
      return true;
    })
    .map(proc => {
      // Também precisamos adicionar os campos calculados aqui
      const prazoNum = getPrazoRestanteNum(proc);
      return {
        ...proc,
        prazoRestanteNum: prazoNum,
        prazoRestanteStr: formatarPrazo(prazoNum),
        prazoRestanteColor: getCorPrazo(prazoNum)
      };
    });
});

// --- FUNÇÕES DE ORDENAÇÃO (Para o PDF) ---
const getValue = (obj, path) => {
  if (path === 'user') {
    return obj.User?.nome;
  }
  // Para outros campos, acessa o valor
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const sortProcesses = (processList, sortState) => {
  // Se não houver 'sortState' (vindo da tabela), retorna a lista como está
  if (!sortState || sortState.length === 0) {
    return processList;
  }
  
  // O v-data-table nos dá um array (ex: [{ key: 'prazoRestanteNum', order: 'asc' }])
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
    
    if (valA < valB) {
      return order === 'asc' ? -1 : 1;
    }
    if (valA > valB) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

// --- 12. **** COMPUTEDS PARA GRÁFICOS (SIMPLIFICADAS E CORRIGIDAS) **** ---

// Lista de CUMPRIDOS (para o gráfico de barras)
const cumpridos30d = computed(() => {
  const dataLimite = subDays(startOfToday(), 30);
  return chartFilteredProcesses.value.filter(p => {
    if (!p.cumprido || !p.cumpridoDate) return false;
    return parseISO(p.cumpridoDate) >= dataLimite;
  });
});

// Lista de PENDENTES (para o grid de anéis)
const pendentes = computed(() => {
  return chartFilteredProcesses.value.filter(p => !p.cumprido);
});

// 'statsList' foi removida

// Dados para o GRID DE ANÉIS (agora usa 'pendentes.value')
const statsData = computed(() => {
  const list = pendentes.value; // **** MUDANÇA: Usa 'pendentes' diretamente
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

// Dados para o GRÁFICO DE BARRAS (AGORA POR USUÁRIO)
const cumpridosChartData = computed(() => {
  // 1. Cria um Map para contar os cumprimentos por usuário
  const userCounts = new Map();

  // 2. Usa a lista 'cumpridos30d' que já está filtrada pelos últimos 30 dias
  //    e pelos filtros da tela
  cumpridos30d.value.forEach(processo => {
    
    // 3. Pega o nome do usuário. Se o processo não tiver usuário, agrupa como 'Não Atribuído'
    const userName = processo.User?.nome || 'Não Atribuído';
    
    // 4. Incrementa a contagem para esse usuário
    const currentCount = userCounts.get(userName) || 0;
    userCounts.set(userName, currentCount + 1);
  });

  // 5. Ordena os usuários: do que mais cumpriu para o que menos cumpriu
  const sortedUsers = Array.from(userCounts.entries())
                           .sort((a, b) => b[1] - a[1]); // Ordena pelo valor (contagem)

  // 6. Separa em labels (nomes) e data (contagens) para o Chart.js
  const labels = sortedUsers.map(entry => entry[0]); // ex: ['Usuário A', 'Usuário B']
  const data = sortedUsers.map(entry => entry[1]);   // ex: [10, 5]

  // 7. Retorna os dados formatados para o componente do gráfico
  return {
    labels: labels,
    datasets: [
      {
        label: 'Processos Cumpridos por Usuário (Últimos 30d)',
        backgroundColor: '#4CAF50', // Verde
        data: data
      }
    ]
  };
});
// **********************************************


// --- 13. FUNÇÃO DE GERAR PDF (Corrigida) ---
const downloadPDF = (dataToExport) => {
  let processesToExport = sortProcesses([...dataToExport], sortBy.value);

  
  if (processesToExport.length === 0) {
    alert('Nenhum item para exportar.');
    return;
  }
  
  const doc = new jsPDF('l', 'mm', 'a4');
  const printDate = new Date().toLocaleDateString('pt-BR');
  const processCount = processesToExport.length;
  
  const activeFilters = [];
  if (filters.value.classe.length > 0) activeFilters.push(`Classes: ${filters.value.classe.join(', ')}`);
  if (filters.value.assunto.length > 0) activeFilters.push(`Assuntos: ${filters.value.assunto.join(', ')}`);
  if (filters.value.tarjas.length > 0) activeFilters.push(`Tarjas: ${filters.value.tarjas.join(', ')}`);
  if (filters.value.userId.length > 0) {
    const userNames = filters.value.userId.map(id => uniqueUsers.value.find(u => u.value === id)?.title || id);
    activeFilters.push(`Usuários: ${userNames.join(', ')}`);
  }
  if (filters.value.cumprido !== null) {
    activeFilters.push(`Status: ${filters.value.cumprido ? 'Cumprido' : 'Não Cumprido'}`);
  }
  if (filters.value.prazo) {
    activeFilters.push(`Prazo: ${filters.value.prazo === 'vencido' ? 'Vencido' : 'A Vencer'}`);
  }
    
  let filtersText = activeFilters.join(' | ');
  if (filtersText.length === 0) {
    filtersText = 'Nenhum filtro ou ordenação aplicada';
  }

  doc.setFontSize(18);
  doc.text('Relatório de Processos', 14, 22);
  doc.setFontSize(10);
  doc.text(`Data de Impressão: ${printDate}`, 14, 30);
  doc.text(`Total de Processos: ${processCount}`, 14, 35);
  doc.text('Filtros e Ordenação:', 14, 40);
  doc.setFontSize(8);
  doc.text(filtersText, 14, 45, { maxWidth: 269 });

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

  autoTable(doc, {
    columns: columns,
    body: rows,
    startY: 55,
    theme: 'grid',
    headStyles: { 
      fillColor: [22, 160, 133], 
      textColor: [255, 255, 255] 
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    columnStyles: {
      numero_processo: { minCellWidth: 35 },
      classe_principal: { minCellWidth: 40 },
      assunto_principal: { minCellWidth: 40 },
      observacoes: { minCellWidth: 40 },
      reiteracoes: { cellWidth: 20 },
    }
  });

  doc.save('processos.pdf');
};

// --- 14. LÓGICA DE BUSCA DE DADOS (Refatorada) ---

// 1. A lógica de busca agora está em uma função reutilizável
const fetchData = async () => {
  loading.value = true;
  try {
    const response = await apiClient.get('/admin/processes');
    processes.value = response.data;

    // --- Seus logs (mantidos) ---
    console.log('--- LOG 1: DADOS BRUTOS (do Backend) ---');
    console.log('Dados recebidos:', response.data);
    // -------------------------
  } catch (error) {
    console.error('Erro ao buscar processos:', error);
  } finally {
    loading.value = false;
  }
};




// ===============================================
// ==== ADICIONE ESTA NOVA FUNÇÃO DE BUSCA ====
// ===============================================
// Busca a lista completa de usuários para o modal de reset
const fetchAllUsers = async () => {
  try {
    const response = await apiClient.get('/admin/users'); // Rota do backend que lista todos
    allUsersList.value = response.data;
  } catch (error) {
    console.error("Erro ao buscar lista de usuários:", error);
    snackbarText.value = 'Erro ao carregar lista de usuários.';
    snackbarColor.value = 'error';
    snackbar.value = true;
  }
};
// ===============================================
// ==== FIM DA NOVA FUNÇÃO ====
// ===============================================


// 2. 'onMounted' agora chama AMBAS as funções
onMounted(async () => {
  await fetchData();
  await fetchAllUsers(); // <-- CHAME A NOVA FUNÇÃO AQUI
});

// --- 3. Funções para os novos botões do Card de Boas-vindas ---

// **** ADICIONE ESTA FUNÇÃO (faltante do template) ****
const handleLogout = () => {
  authStore.logout();
  // (O router guard no index.js cuidará do redirecionamento)
};
const abrirModalCadastro = () => {
  // Reseta o formulário para um estado limpo
  novoUsuario.value = {
    matricula: '',
    nome: '',
    senha: '',
    tipoCadastro: 'usuario_padrao'
  };
  // Limpa os erros de validação anteriores
  formCadastroRef.value?.resetValidation();
  dialogCadastro.value = true;
};


const fecharModalCadastro = () => {
  dialogCadastro.value = false;
};

const handleSalvarCadastro = async () => {
  // 1. Valida o formulário
  const { valid } = await formCadastroRef.value.validate();
  if (!valid) return;

  loadingCadastro.value = true;
  try {
    // 2. Envia para a API (rota do seu backend)
    await apiClient.post('/admin/pre-cadastro', novoUsuario.value);
    
    // 3. Feedback de sucesso
    snackbarText.value = 'Usuário cadastrado com sucesso!';
    snackbarColor.value = 'success';
    snackbar.value = true;
    fecharModalCadastro();

  } catch (error) {
    // 4. Feedback de erro (incluindo usuário duplicado)
    if (error.response && error.response.status === 409) {
      snackbarText.value = 'Erro: Matrícula já cadastrada.';
    } else {
      snackbarText.value = 'Erro ao salvar usuário. Tente novamente.';
    }
    snackbarColor.value = 'error';
    snackbar.value = true;
    console.error('Erro ao salvar usuário:', error);
  } finally {
    loadingCadastro.value = false;
  }
};

const abrirModalReset = () => {
  // Reseta o formulário
  matriculaParaReset.value = null;
  formResetRef.value?.resetValidation();
  dialogReset.value = true;
};

// ===============================================
// ==== ADICIONE ESTAS NOVAS FUNÇÕES DO MODAL ====
// ===============================================
const fecharModalReset = () => {
  dialogReset.value = false;
};

const handleResetarSenha = async () => {
  // 1. Valida o formulário
  const { valid } = await formResetRef.value.validate();
  if (!valid) return;

  loadingReset.value = true;
  try {
    // 2. Envia para a API (rota do seu backend)
    await apiClient.post('/admin/reset-password', { 
      matricula: matriculaParaReset.value 
    });
    
    // 3. Feedback de sucesso
    snackbarText.value = 'Senha resetada com sucesso para "12345678"!';
    snackbarColor.value = 'success';
    snackbar.value = true;
    fecharModalReset();

  } catch (error) {
    // 4. Feedback de erro
    if (error.response && error.response.status === 404) {
      snackbarText.value = 'Erro: Usuário não encontrado com esta matrícula.';
    } else {
      snackbarText.value = 'Erro ao resetar senha. Tente novamente.';
    }
    snackbarColor.value = 'error';
    snackbar.value = true;
    console.error('Erro ao resetar senha:', error);
  } finally {
    loadingReset.value = false;
  }
};
// ===============================================
// ==== FIM DAS NOVAS FUNÇÕES ====
// ===============================================

// ===============================================
// ==== ADICIONE AS FUNÇÕES DE DELETAR ====
// ===============================================
const abrirModalDelete = () => {
  matriculaParaDelete.value = null; // Limpa seleção anterior
  formDeleteRef.value?.resetValidation(); // Limpa erros de validação
  dialogDelete.value = true;
};

const fecharModalDelete = () => {
  dialogDelete.value = false;
};

const handleDeleteUser = async () => {
  // 1. Valida o formulário
  const { valid } = await formDeleteRef.value.validate();
  if (!valid) return;

  loadingDelete.value = true;
  try {
    // 2. Envia para a API a matrícula a ser deletada
    await apiClient.post('/admin/delete-matricula', { 
      matricula: matriculaParaDelete.value 
    });
    
    // 3. Feedback de sucesso
    snackbarText.value = 'Usuário apagado com sucesso!';
    snackbarColor.value = 'success';
    snackbar.value = true;
    fecharModalDelete();

    // 4. IMPORTANTE: Atualiza a lista de usuários
    await fetchAllUsers();

  } catch (error) {
    // 4. Feedback de erro
    const msg = error.response?.data || 'Erro ao apagar usuário. Tente novamente.';
    snackbarText.value = `Erro: ${msg}`;
    snackbarColor.value = 'error';
    snackbar.value = true;
    console.error('Erro ao apagar usuário:', error);
  } finally {
    loadingDelete.value = false;
  }
};
// ===============================================
// ==== FIM DAS FUNÇÕES DE DELETAR ====
// ===============================================


// ===============================================
// ==== ADICIONE AS FUNÇÕES DE UPLOAD ====
// ===============================================

const abrirModalUpload = () => {
  csvFile.value = null; // Limpa o arquivo anterior
  uploadError.value = null; // Limpa erros anteriores
  dialogUpload.value = true;
};

const fecharModalUpload = () => {
  dialogUpload.value = false;
};

// Esta função é chamada quando o usuário seleciona um arquivo
const onFileChange = (event) => {
  const files = event.target.files;
  if (files && files.length > 0) {
    if (files[0].type === 'text/csv' || files[0].name.endsWith('.csv')) {
      csvFile.value = files[0];
      uploadError.value = null; // Limpa erro se o arquivo for válido
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

  // 1. O FormData é necessário para enviar arquivos
  const formData = new FormData();
  formData.append('csvFile', csvFile.value); // O nome 'csvFile' deve bater com o do backend

  try {
    // 2. Envia para a API (com cabeçalho 'multipart/form-data')
    const response = await apiClient.post('/admin/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    // 3. Sucesso!
    loadingUpload.value = false;
    fecharModalUpload();
    snackbarText.value = response.data || 'CSV importado com sucesso!';
    snackbarColor.value = 'success';
    snackbar.value = true;

    // 4. ATUALIZA A TABELA para mostrar os novos dados
    await fetchData();

  } catch (error) {
    // 4. Erro
    loadingUpload.value = false;
    const msg = error.response?.data?.error || error.response?.data || 'Erro ao importar CSV.';
    uploadError.value = msg; // Mostra o erro dentro do modal
    console.error('Erro ao fazer upload do CSV:', error);
  }
};
// ===============================================
// ==== FIM DAS FUNÇÕES DE UPLOAD ====
// ===============================================

// ===============================================
// ==== ADICIONE AS FUNÇÕES DE ATRIBUIÇÃO EM MASSA ====
// ===============================================
const abrirModalBulkAssign = () => {
  // A 'selected' ref já tem os processos. 
  // O botão já tem o :disabled, mas checamos por segurança.
  if (selected.value.length === 0) {
    snackbarText.value = 'Nenhum processo selecionado.';
    snackbarColor.value = 'warning';
    snackbar.value = true;
    return;
  }
  
  matriculaParaAtribuir.value = null; // Limpa seleção anterior
  formBulkAssignRef.value?.resetValidation(); // Limpa erros de validação
  dialogBulkAssign.value = true;
};

const fecharModalBulkAssign = () => {
  dialogBulkAssign.value = false;
};

const handleBulkAssign = async () => {
  // 1. Valida o formulário
  const { valid } = await formBulkAssignRef.value.validate();
  if (!valid) return;

  // 2. Pega os IDs dos processos selecionados
  const processIds = selected.value.map(processo => processo.id);

  loadingBulkAssign.value = true;
  try {
    // 3. Envia para a API
    await apiClient.post('/admin/bulk-assign', { 
      processIds: processIds,
      matricula: matriculaParaAtribuir.value
    });
    
    // 4. Feedback de sucesso
    snackbarText.value = 'Processos atribuídos com sucesso!';
    snackbarColor.value = 'success';
    snackbar.value = true;
    fecharModalBulkAssign();

    // 5. Atualiza a tela: limpa a seleção e busca os dados
    selected.value = [];
    await fetchData(); //

  } catch (error) {
    // 6. Feedback de erro
    const msg = error.response?.data || 'Erro ao atribuir processos.';
    snackbarText.value = `Erro: ${msg}`;
    snackbarColor.value = 'error';
    snackbar.value = true;
    console.error('Erro na atribuição em massa:', error);
  } finally {
    loadingBulkAssign.value = false;
  }
};
// ===============================================
// ==== FIM DAS FUNÇÕES DE ATRIBUIÇÃO EM MASSA ====
// ===============================================


// --- ADICIONE ESTES LOGS DE OBSERVAÇÃO ---
// (Cole isso após o 'onMounted')

// Log para 'filteredProcesses'
watch(filteredProcesses, (newList) => {
  console.log('--- LOG 2: Processos PÓS-FILTROS da tela ---');
  console.log(`(Total: ${newList.length})`, newList);
}, { deep: true });

// Log para 'cumpridos30d' (a lista que alimenta o gráfico)
watch(cumpridos30d, (newList) => {
  console.log('--- LOG 3: Processos CUMPRIDOS (últimos 30d) ---');
  console.log(`(Total: ${newList.length})`, newList);
}, { deep: true });

// Log para 'cumpridosChartData' (os dados finais do gráfico)
watch(cumpridosChartData, (newData) => {
  console.log('--- LOG 4: Dados FINAIS para o gráfico ---');
  console.log(newData);
}, { deep: true });

// --- FIM DOS LOGS ---

// --- 15. FUNÇÕES "HANDLER" (Existentes) ---
const handleSalvarObservacoes = async (itemEditado) => {
  try {
    const id = itemEditado.id;
    const obs = itemEditado.observacoes;
    await apiClient.put(`/admin/processes/${id}/observacoes`, { observacoes: obs });
    const index = processes.value.findIndex(p => p.id === id);
    if (index !== -1) {
      processes.value[index].observacoes = obs;
    }
  } catch (error) {
    console.error("Erro ao salvar observação:", error);
  }
};

const handleMarcarComoCumprido = async (item) => {
  if (item.cumprido) {
    if (!confirm(`Deseja realmente DESMARCAR o processo ${item.numero_processo} como cumprido?`)) {
      return;
    }
    try {
      const response = await apiClient.patch(`/admin/processes/${item.id}/desfazer-cumprir`); 
      const dadosAtualizados = response.data; 
      const index = processes.value.findIndex(p => p.id === item.id);
      if (index !== -1) {
        processes.value.splice(index, 1, dadosAtualizados);
      }
    } catch (error) {
      console.error("Erro ao desmarcar como cumprido:", error);
    }
  } else {
    if (!confirm(`Deseja realmente MARCAR o processo ${item.numero_processo} como cumprido?`)) {
      return;
    }
    try {
      const response = await apiClient.patch(`/admin/processes/${item.id}/cumprir`); 
      const dadosAtualizados = response.data; 
      const index = processes.value.findIndex(p => p.id === item.id);
      if (index !== -1) {
        processes.value.splice(index, 1, dadosAtualizados);
      }
    } catch (error) {
      console.error("Erro ao marcar como cumprido:", error);
    }
  }
};


</script>

<style scoped>
.container-estreito {
  /* O padrão do Vuetify 'xl' é 1280px. */
  /* Ajuste este valor para o que achar melhor. */
  max-width: 1400px; 
}
</style>