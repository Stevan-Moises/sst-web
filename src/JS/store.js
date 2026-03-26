// --- CAMADA DE DADOS & ESTADO ---

// Dados iniciais de demonstração
const DADOS_TESTE = [
    { id: '1', matricula: '00101', nome: 'CARLOS ANDRADE', funcao: 'OPERADOR DE MÁQUINA', filial: 'FILIAL 02', admissao: '2022-01-15', ultimoExame: '2025-02-10', periodicidade: 1, situacao: 'Ativo' },
    { id: '2', matricula: '00102', nome: 'JULIANA COSTA', funcao: 'GERENTE ADMINISTRATIVO', filial: 'FILIAL 03', admissao: '2019-04-01', ultimoExame: '2025-04-10', periodicidade: 1, situacao: 'Ativo' },
    { id: '3', matricula: '00103', nome: 'ROBERTO FIRMINO', funcao: 'MOTORISTA', filial: 'FILIAL 53', admissao: '2021-06-10', ultimoExame: '2024-06-15', periodicidade: 2, situacao: 'INSS' },
    { id: '4', matricula: '00104', nome: 'AMANDA NUNES', funcao: 'ANALISTA DE RH', filial: 'FILIAL 02', admissao: '2023-01-20', ultimoExame: '2023-01-20', periodicidade: 2, situacao: 'Ativo' },
    { id: '5', matricula: '00105', nome: 'FERNANDO SILVA', funcao: 'ESTOQUISTA', filial: 'FILIAL 54', admissao: '2024-09-01', ultimoExame: '2025-09-01', periodicidade: 1, situacao: 'Ativo' },
    { id: '6', matricula: '00106', nome: 'MARCOS TULIO', funcao: 'VENDEDOR', filial: 'FILIAL 53', admissao: '2020-03-10', ultimoExame: '2025-03-01', periodicidade: 1, situacao: 'Ativo' }
];

// Inicializa dados via LocalStorage
export let colaboradores = JSON.parse(localStorage.getItem('sst_dados_v2')) || DADOS_TESTE;

// Middleware para salvar dados no cofre do navegador
export const salvarNoArmazenamento = (novosDados) => {
    colaboradores = novosDados;
    localStorage.setItem('sst_dados_v2', JSON.stringify(colaboradores));
};

// Funções de gerenciamento do Backup
export const registrarBackup = () => {
    localStorage.setItem('sst_ultimo_backup', new Date().toISOString());
};

export const obterDataUltimoBackup = () => {
    return localStorage.getItem('sst_ultimo_backup');
};