// --- RENDERIZAÇÃO DE TELA E MODAIS (UI) ---
import { DATA_ATUAL, calcularStatus, formatarData, obterIniciais, obterCorAvatar } from './utils.js';
import { colaboradores, obterDataUltimoBackup } from './store.js';

// Variável de estado para filtros
export let filtrosAtuais = { busca: '', filial: 'Todas', status: 'Todos' };

// Sistema de Notificações (Toasts)
export const mostrarNotificacao = (mensagem, tipo = 'success') => {
    const notificacao = document.createElement('div');
    let cores = tipo === 'success' ? 'bg-emerald-600 text-white' : (tipo === 'error' ? 'bg-red-600 text-white' : 'bg-slate-800 text-white');
    let icone = tipo === 'success' ? 'fa-check-circle' : (tipo === 'error' ? 'fa-circle-xmark' : 'fa-info-circle');

    notificacao.className = `transform transition-all duration-300 translate-x-full ${cores} px-5 py-3.5 rounded-xl shadow-float flex items-center gap-3 font-medium text-sm`;
    notificacao.innerHTML = `<i class="fa-solid ${icone} text-lg"></i> ${mensagem}`;

    document.getElementById('containerNotificacoes').appendChild(notificacao);

    requestAnimationFrame(() => notificacao.classList.remove('translate-x-full'));

    setTimeout(() => {
        notificacao.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => notificacao.remove(), 300);
    }, 3500);
};

// Guardião de Backup
export const verificarStatusBackup = () => {
    const strUltimoBackup = obterDataUltimoBackup();
    const bannerAlerta = document.getElementById('alertaBackup');

    if (colaboradores.length > 6) {
        if (!strUltimoBackup) {
            bannerAlerta.classList.remove('hidden');
            return;
        }

        const ultimoBackup = new Date(strUltimoBackup);
        const diferencaTempo = DATA_ATUAL.getTime() - ultimoBackup.getTime();
        const diferencaDias = Math.ceil(diferencaTempo / (1000 * 60 * 60 * 24));

        if (diferencaDias >= 7) {
            bannerAlerta.classList.remove('hidden');
        } else {
            bannerAlerta.classList.add('hidden');
        }
    }
};

// Controladores de Telas (Roteamento)
export const mudarTela = (nomeTela) => {
    document.getElementById('tela-painel').classList.add('hidden');
    document.getElementById('tela-operacao').classList.add('hidden');
    document.getElementById(`tela-${nomeTela}`).classList.remove('hidden');

    const navPainel = document.getElementById('nav-painel');
    const navOperacao = document.getElementById('nav-operacao');

    navPainel.className = "flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent font-medium transition-all group";
    navPainel.querySelector('i').className = "fa-solid fa-chart-pie w-5 text-center group-hover:text-white transition-colors";

    navOperacao.className = "flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent font-medium transition-all group";
    navOperacao.querySelector('i').className = "fa-solid fa-users-viewfinder w-5 text-center group-hover:text-white transition-colors";

    if (nomeTela === 'painel') {
        document.getElementById('tituloPagina').textContent = "Painel Gerencial";
        navPainel.className = "flex items-center gap-3 px-4 py-3 rounded-xl text-brand-50 bg-brand-600/20 font-semibold border border-brand-500/30 transition-all";
        navPainel.querySelector('i').className = "fa-solid fa-chart-pie w-5 text-center text-brand-400";
    } else {
        document.getElementById('tituloPagina').textContent = "Gestão de ASOs";
        navOperacao.className = "flex items-center gap-3 px-4 py-3 rounded-xl text-brand-50 bg-brand-600/20 font-semibold border border-brand-500/30 transition-all";
        navOperacao.querySelector('i').className = "fa-solid fa-users-viewfinder w-5 text-center text-brand-400";
    }
};

// Controladores de Modais
export const abrirModal = () => { document.body.classList.add('modal-aberto'); document.getElementById('modalColaborador').classList.remove('hidden'); };
export const fecharModal = () => {
    document.body.classList.remove('modal-aberto');
    document.getElementById('modalColaborador').classList.add('hidden');
    document.getElementById('formularioColaborador').reset();
    document.getElementById('colabId').value = '';
    document.getElementById('modal-title').textContent = 'Adicionar Colaborador';
};

export const abrirModalImportacao = () => { document.body.classList.add('modal-aberto'); document.getElementById('modalImportacao').classList.remove('hidden'); };
export const fecharModalImportacao = () => { document.body.classList.remove('modal-aberto'); document.getElementById('modalImportacao').classList.add('hidden'); };

export const abrirModalRenovacao = (id) => {
    const colab = colaboradores.find(e => e.id === id);
    if (!colab) return;
    document.getElementById('idRenovacao').value = id;
    document.getElementById('nomeRenovacao').textContent = colab.nome;
    document.getElementById('novaDataExame').value = DATA_ATUAL.toISOString().split('T')[0];
    document.getElementById('modalRenovacao').classList.remove('hidden');
};
export const fecharModalRenovacao = () => { document.getElementById('modalRenovacao').classList.add('hidden'); document.getElementById('novaDataExame').value = ''; };

// Renderizadores de Dados
export const renderizarPainel = () => {
    let indicadores = { total: 0, vencidos: 0, avencer: 0, regulares: 0 };
    let alertasUrgentes = [];

    colaboradores.forEach(colab => {
        if (!colab.situacao) colab.situacao = 'Ativo';
        const calculo = calcularStatus(colab.ultimoExame, colab.periodicidade);
        colab._calculo = calculo;

        if (colab.situacao === 'Ativo') {
            indicadores.total++;
            if (calculo.status === 'Vencido') { indicadores.vencidos++; alertasUrgentes.push(colab); }
            if (calculo.status === 'A Vencer') { indicadores.avencer++; alertasUrgentes.push(colab); }
            if (calculo.status === 'Regular') indicadores.regulares++;
        }
    });

    document.getElementById('indicador-total').textContent = indicadores.total;
    document.getElementById('indicador-vencidos').textContent = indicadores.vencidos;
    document.getElementById('indicador-avencer').textContent = indicadores.avencer;
    document.getElementById('indicador-regulares').textContent = indicadores.regulares;

    const listaAlertas = document.getElementById('listaAlertasTop');
    listaAlertas.innerHTML = '';
    alertasUrgentes.sort((a, b) => a._calculo.diferencaDias - b._calculo.diferencaDias);
    const top5 = alertasUrgentes.slice(0, 5);

    if (top5.length === 0) {
        listaAlertas.innerHTML = `<li class="px-6 py-8 text-center"><i class="fa-solid fa-shield-check text-4xl text-emerald-200 mb-3"></i><p class="text-slate-500 font-medium text-sm">Nenhuma urgência pendente.<br>Todos os ASOs estão em dia!</p></li>`;
    } else {
        top5.forEach(colab => {
            const calculo = colab._calculo;
            const estaVencido = calculo.status === 'Vencido';
            const corIcone = estaVencido ? 'text-red-500 bg-red-50' : 'text-amber-500 bg-amber-50';
            const textoTempo = estaVencido ? `Vencido há ${Math.abs(calculo.diferencaDias)} dias` : `Faltam ${calculo.diferencaDias} dias`;

            listaAlertas.insertAdjacentHTML('beforeend', `
                <li class="px-6 py-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full ${corIcone} flex items-center justify-center shrink-0">
                            <i class="fa-solid ${estaVencido ? 'fa-xmark' : 'fa-clock'}"></i>
                        </div>
                        <div>
                            <p class="text-sm font-bold text-slate-800">${colab.nome}</p>
                            <p class="text-xs text-slate-500">${colab.filial} &bull; ${colab.funcao}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-sm font-bold ${estaVencido ? 'text-red-600' : 'text-amber-600'}">${formatarData(calculo.proximaData)}</p>
                        <p class="text-xs font-medium text-slate-400">${textoTempo}</p>
                    </div>
                </li>
            `);
        });
    }
};

export const renderizarTabela = () => {
    const corpoTabelaHtml = document.getElementById('corpoTabela');
    const estadoVazioHtml = document.getElementById('estadoVazio');
    corpoTabelaHtml.innerHTML = '';

    let dadosFiltrados = [];

    colaboradores.forEach(colab => {
        if (!colab.situacao) colab.situacao = 'Ativo';
        const calculo = calcularStatus(colab.ultimoExame, colab.periodicidade);
        colab._calculo = calculo;

        let combinaBusca = colab.nome.toLowerCase().includes(filtrosAtuais.busca) ||
            colab.funcao.toLowerCase().includes(filtrosAtuais.busca) ||
            (colab.matricula && colab.matricula.includes(filtrosAtuais.busca));
        let combinaFilial = filtrosAtuais.filial === 'Todas' || colab.filial === filtrosAtuais.filial;
        let combinaStatus = filtrosAtuais.status === 'Todos' || calculo.status === filtrosAtuais.status;

        if (filtrosAtuais.status !== 'Todos' && colab.situacao === 'INSS') combinaStatus = false;

        if (combinaBusca && combinaFilial && combinaStatus) dadosFiltrados.push(colab);
    });

    dadosFiltrados.sort((a, b) => {
        if (a.situacao === 'INSS' && b.situacao !== 'INSS') return 1;
        if (a.situacao !== 'INSS' && b.situacao === 'INSS') return -1;
        if (a._calculo.diferencaDias !== b._calculo.diferencaDias) return a._calculo.diferencaDias - b._calculo.diferencaDias;
        return a.nome.localeCompare(b.nome, 'pt-BR');
    });

    if (dadosFiltrados.length === 0) {
        estadoVazioHtml.classList.remove('hidden');
    } else {
        estadoVazioHtml.classList.add('hidden');

        dadosFiltrados.forEach(colab => {
            const calculo = colab._calculo;
            let badgeStatus = '', linhaIndicadora = '', badgeSituacao = '', classeOpacidade = '';

            if (colab.situacao === 'INSS') {
                badgeSituacao = `<span class="px-2 py-1 inline-flex text-[11px] font-bold uppercase tracking-wider rounded bg-slate-100 text-slate-500 border border-slate-200"><i class="fa-solid fa-bed-pulse mr-1 mt-0.5"></i> INSS</span>`;
                badgeStatus = `<span class="px-2.5 py-1 inline-flex text-[11px] font-bold uppercase tracking-wider rounded-full bg-slate-100 text-slate-400 border border-slate-200"><i class="fa-solid fa-pause mr-1 mt-0.5"></i> Suspenso</span>`;
                classeOpacidade = 'opacity-60 grayscale-[30%] hover:opacity-100 hover:grayscale-0';
                linhaIndicadora = 'border-l-4 border-transparent';
            } else {
                badgeSituacao = `<span class="px-2 py-1 inline-flex text-[11px] font-bold uppercase tracking-wider rounded bg-brand-50 text-brand-700 border border-brand-100">Ativo</span>`;
                if (calculo.status === 'Vencido') {
                    badgeStatus = `<span class="px-2.5 py-1 inline-flex text-[11px] font-bold uppercase tracking-wider rounded-full bg-red-50 text-red-700 border border-red-200 shadow-sm"><i class="fa-solid fa-xmark mr-1 mt-0.5"></i> Vencido</span>`;
                    linhaIndicadora = 'border-l-4 border-red-500';
                    classeOpacidade = 'bg-red-50/30';
                } else if (calculo.status === 'A Vencer') {
                    badgeStatus = `<span class="px-2.5 py-1 inline-flex text-[11px] font-bold uppercase tracking-wider rounded-full bg-amber-50 text-amber-700 border border-amber-200 shadow-sm"><i class="fa-solid fa-clock mr-1 mt-0.5"></i> A Vencer</span>`;
                    linhaIndicadora = 'border-l-4 border-amber-400';
                    classeOpacidade = 'bg-amber-50/20';
                } else {
                    badgeStatus = `<span class="px-2.5 py-1 inline-flex text-[11px] font-bold uppercase tracking-wider rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"><i class="fa-solid fa-check mr-1 mt-0.5"></i> Regular</span>`;
                    linhaIndicadora = 'border-l-4 border-transparent';
                }
            }

            corpoTabelaHtml.insertAdjacentHTML('beforeend', `
                <tr class="${linhaIndicadora} ${classeOpacidade} hover:bg-slate-50 transition-colors duration-200 group">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center gap-4">
                            <div class="h-10 w-10 rounded-full ${obterCorAvatar(colab.nome)} flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm">${obterIniciais(colab.nome)}</div>
                            <div>
                                <div class="text-sm font-bold text-slate-900 group-hover:text-brand-700 transition-colors flex items-center gap-2">${colab.nome} <span class="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono border border-slate-200">#${colab.matricula || '-'}</span></div>
                                <div class="text-xs text-slate-500 mt-0.5 font-medium">${colab.funcao}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap"><span class="text-sm font-semibold text-slate-700">${colab.filial}</span></td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex flex-col gap-1">
                            <div class="text-xs text-slate-500 flex justify-between w-32"><span class="text-slate-400">Adm:</span> <span class="font-semibold text-slate-700">${formatarData(colab.admissao)}</span></div>
                            <div class="text-xs text-slate-500 flex justify-between w-32"><span class="text-slate-400">Último:</span> <span class="font-semibold text-slate-700">${formatarData(colab.ultimoExame)}</span></div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">${badgeSituacao}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex flex-col items-start gap-1.5">
                            ${badgeStatus}
                            <div class="text-[11px] font-semibold ${calculo.status === 'Vencido' && colab.situacao !== 'INSS' ? 'text-red-500' : 'text-slate-400'} ml-1">
                                ${colab.situacao === 'INSS' ? 'Pausado' : (calculo.diferencaDias < 0 ? `Atraso: ${Math.abs(calculo.diferencaDias)} dias` : `P/ ${formatarData(calculo.proximaData)}`)}
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div class="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button onclick="abrirModalRenovacao('${colab.id}')" class="w-8 h-8 flex items-center justify-center rounded-lg ${colab.situacao === 'INSS' ? 'text-slate-300 bg-slate-50 cursor-not-allowed' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800'}" title="Registrar novo ASO" ${colab.situacao === 'INSS' ? 'disabled' : ''}><i class="fa-solid fa-file-medical"></i></button>
                            <button onclick="editarColaborador('${colab.id}')" class="w-8 h-8 flex items-center justify-center rounded-lg text-brand-600 bg-brand-50 hover:bg-brand-100 hover:text-brand-800" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button>
                            <button onclick="excluirColaborador('${colab.id}')" class="w-8 h-8 flex items-center justify-center rounded-lg text-red-500 bg-red-50 hover:bg-red-100 hover:text-red-700" title="Remover"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                    </td>
                </tr>
            `);
        });
    }
};