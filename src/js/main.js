// --- PONTO DE ENTRADA E ORQUESTRAÇÃO (Main) ---
import { DATA_ATUAL } from './utils.js';
import { colaboradores, salvarNoArmazenamento } from './store.js';
import { baixarModeloCSV, exportarCSV, lidarImportacaoCSV, confirmarImportacao } from './csv.js';
import {
    filtrosAtuais, mudarTela, abrirModal, fecharModal, abrirModalImportacao,
    fecharModalImportacao, abrirModalRenovacao, fecharModalRenovacao,
    abrirModalExclusao, fecharModalExclusao, abrirModalConfirmacaoImportacao, fecharModalConfirmacaoImportacao,
    renderizarPainel, renderizarTabela, mostrarNotificacao, verificarStatusBackup, alternarMenuMobile
} from './ui.js';

// --- CONTROLADORES DE CRUD ---

const lidarEnvioFormulario = (evento) => {
    evento.preventDefault();

    const id = document.getElementById('colabId').value;
    const novoColab = {
        id: id || Date.now().toString(),
        matricula: document.getElementById('colabMatricula').value.trim(),
        nome: document.getElementById('colabNome').value.trim().toUpperCase(),
        funcao: document.getElementById('colabFuncao').value.trim().toUpperCase(),
        filial: document.getElementById('colabFilial').value,
        admissao: document.getElementById('colabAdmissao').value,
        situacao: document.getElementById('colabSituacao').value,
        ultimoExame: document.getElementById('colabDataExame').value,
        periodicidade: parseInt(document.getElementById('colabPeriodo').value)
    };

    let copiaColaboradores = [...colaboradores];

    if (id) {
        const indice = copiaColaboradores.findIndex(colab => colab.id === id);
        if (indice > -1) copiaColaboradores[indice] = novoColab;
        mostrarNotificacao('Colaborador atualizado com sucesso!', 'success');
    } else {
        copiaColaboradores.push(novoColab);
        mostrarNotificacao('Colaborador adicionado com sucesso!', 'success');
    }

    salvarNoArmazenamento(copiaColaboradores);
    fecharModal();
};

const editarColaborador = (id) => {
    const colab = colaboradores.find(e => e.id === id);
    if (!colab) return;

    document.getElementById('colabId').value = colab.id;
    document.getElementById('colabMatricula').value = colab.matricula || '';
    document.getElementById('colabNome').value = colab.nome;
    document.getElementById('colabFuncao').value = colab.funcao;
    document.getElementById('colabFilial').value = colab.filial;
    document.getElementById('colabAdmissao').value = colab.admissao || '';
    document.getElementById('colabSituacao').value = colab.situacao || 'Ativo';
    document.getElementById('colabDataExame').value = colab.ultimoExame;
    document.getElementById('colabPeriodo').value = colab.periodicidade;

    document.getElementById('modal-title').textContent = 'Editar Colaborador';
    abrirModal();
};

const confirmarRenovacao = () => {
    const id = document.getElementById('idRenovacao').value;
    const novaData = document.getElementById('novaDataExame').value;

    if (!novaData) {
        alert('Informe a data do exame.');
        return;
    }

    let copiaColaboradores = [...colaboradores];
    const indice = copiaColaboradores.findIndex(e => e.id === id);
    if (indice > -1) {
        copiaColaboradores[indice].ultimoExame = novaData;
        salvarNoArmazenamento(copiaColaboradores);
        mostrarNotificacao('ASO Renovado! Status recalibrado.', 'success');
        fecharModalRenovacao();
    }
};

// --- NOVA FUNÇÃO DE EXCLUSÃO DE DADOS ---
const confirmarExclusao = () => {
    const id = document.getElementById('idExclusao').value;
    // Filtra removendo o colaborador com o ID selecionado
    const novosDados = colaboradores.filter(e => e.id !== id);
    salvarNoArmazenamento(novosDados);
    mostrarNotificacao('Colaborador removido da base.', 'info');
    fecharModalExclusao();
};

// --- EXPOSIÇÃO GLOBAL PARA O HTML ---
window.mudarTela = mudarTela;
window.alternarMenuMobile = alternarMenuMobile;
window.abrirModal = abrirModal;
window.fecharModal = fecharModal;
window.abrirModalImportacao = abrirModalImportacao;
window.fecharModalImportacao = fecharModalImportacao;
window.abrirModalRenovacao = abrirModalRenovacao;
window.fecharModalRenovacao = fecharModalRenovacao;

// Expondo os controladores do novo Modal de Exclusão
window.abrirModalExclusao = abrirModalExclusao;
window.fecharModalExclusao = fecharModalExclusao;
window.confirmarExclusao = confirmarExclusao;

// Expondo os controladores do novo Modal de Confirmação de Importação
window.abrirModalConfirmacaoImportacao = abrirModalConfirmacaoImportacao;
window.fecharModalConfirmacaoImportacao = fecharModalConfirmacaoImportacao;
window.confirmarImportacao = confirmarImportacao;

window.lidarEnvioFormulario = lidarEnvioFormulario;
window.editarColaborador = editarColaborador;
window.confirmarRenovacao = confirmarRenovacao;

window.baixarModeloCSV = baixarModeloCSV;
window.exportarCSV = exportarCSV;
window.lidarImportacaoCSV = lidarImportacaoCSV;

// --- INICIALIZAÇÃO E EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {

    // Configuração dos inputs de filtro
    document.getElementById('inputBusca').addEventListener('input', (evento) => {
        filtrosAtuais.busca = evento.target.value.toLowerCase();
        renderizarTabela();
    });

    document.getElementById('filtroFilial').addEventListener('change', (evento) => {
        filtrosAtuais.filial = evento.target.value;
        renderizarTabela();
    });

    document.getElementById('filtroStatus').addEventListener('change', (evento) => {
        filtrosAtuais.status = evento.target.value;
        renderizarTabela();
    });

    // Boot Inicial
    const opcoesData = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('dataAtual').textContent = DATA_ATUAL.toLocaleDateString('pt-BR', opcoesData);

    renderizarPainel();
    renderizarTabela();
    mudarTela('painel');
    verificarStatusBackup();
});

// Padrão de Reatividade: Ouve o evento da store.js e atualiza a tela automaticamente
window.addEventListener('sstDadosAtualizados', () => {
    renderizarPainel();
    renderizarTabela();
});