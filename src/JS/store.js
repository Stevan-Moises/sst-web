// --- CAMADA DE DADOS & ESTADO ---

// Inicializa dados via LocalStorage. 
// PADRÃO DE PRODUÇÃO: Se não houver dados, inicia com um array vazio [].
export let colaboradores = JSON.parse(localStorage.getItem('sst_dados_v2')) || [];

// Middleware para salvar dados no cofre do navegador
export const salvarNoArmazenamento = (novosDados) => {
    colaboradores = novosDados;
    localStorage.setItem('sst_dados_v2', JSON.stringify(colaboradores));
    
    // (Event Driven): Avisa a aplicação toda que os dados mudaram!
    window.dispatchEvent(new Event('sstDadosAtualizados'));
};

// Funções de gerenciamento do Backup
export const registrarBackup = () => {
    localStorage.setItem('sst_ultimo_backup', new Date().toISOString());
};

export const obterDataUltimoBackup = () => {
    return localStorage.getItem('sst_ultimo_backup');
};