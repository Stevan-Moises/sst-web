// --- REGRAS DE NEGÓCIO & UTILITÁRIOS ---

// Sincroniza a data base do sistema ignorando as horas
const agora = new Date();
agora.setHours(0, 0, 0, 0);
export const DATA_ATUAL = agora;

// Calcula o status do exame (Vencido, A Vencer, Regular)
export const calcularStatus = (strUltimoExame, anosPeriodo) => {
    const ultimaData = new Date(strUltimoExame + 'T12:00:00');
    const proximaData = new Date(ultimaData);
    proximaData.setFullYear(proximaData.getFullYear() + parseInt(anosPeriodo));

    const diferencaTempo = proximaData.getTime() - DATA_ATUAL.getTime();
    const diferencaDias = Math.ceil(diferencaTempo / (1000 * 60 * 60 * 24));

    let strStatus = 'Regular';
    if (diferencaDias < 0) strStatus = 'Vencido';
    else if (diferencaDias <= 30) strStatus = 'A Vencer';

    return { proximaData, status: strStatus, diferencaDias };
};

// Formatação visual de datas para o padrão brasileiro
export const formatarData = (strData) => {
    if (!strData) return '-';
    const data = typeof strData === 'string' ? new Date(strData + 'T12:00:00') : strData;
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(data);
};

// Extrai as iniciais do nome para o Avatar
export const obterIniciais = (nome) => {
    const partes = nome.trim().split(' ');
    if (partes.length >= 2) return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    if (partes.length === 1 && partes[0].length >= 2) return partes[0].substring(0, 2).toUpperCase();
    return 'XX';
};

// Gera cor dinâmica baseada na string do nome
export const obterCorAvatar = (nome) => {
    const cores = ['bg-indigo-100 text-indigo-700', 'bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-pink-100 text-pink-700', 'bg-teal-100 text-teal-700'];
    let soma = 0;
    for (let i = 0; i < nome.length; i++) soma += nome.charCodeAt(i);
    return cores[soma % cores.length];
};

// Converte de DD/MM/YYYY (Humano) para YYYY-MM-DD (Computador)
export const formatarDataParaISO = (dataBR) => {
    if (!dataBR) return '';
    const strLimpa = dataBR.trim();
    // Prevenção: Se o dado já vier com traço (já é ISO), ele deixa passar.
    if (strLimpa.includes('-')) return strLimpa;
    
    const partes = strLimpa.split('/');
    if (partes.length !== 3) return ''; // Se não achar as 3 partes, cancela.
    
    const [dia, mes, ano] = partes;
    return `${ano}-${mes}-${dia}`;
};

// Converte de YYYY-MM-DD (Computador) para DD/MM/YYYY (Humano) para a Exportação
export const formatarDataParaBR = (dataISO) => {
    if (!dataISO) return '';
    const strLimpa = dataISO.trim();
    // Prevenção: Se o dado já tiver barra (já é BR), ele deixa passar.
    if (strLimpa.includes('/')) return strLimpa;
    
    const partes = strLimpa.split('-');
    if (partes.length !== 3) return '';
    
    const [ano, mes, dia] = partes;
    return `${dia}/${mes}/${ano}`;
};