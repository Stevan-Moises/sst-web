// --- REGRAS DE NEGÓCIO & UTILITÁRIOS ---

// Sincroniza a data base do sistema ignorando as horas
const agora = new Date();
agora.setHours(0, 0, 0, 0);
export const DATA_ATUAL = agora;

// Calcula o status do exame (Vencido, A Vencer, Regular)
export const calcularStatus = (strUltimoExame, anosPeriodo) => {
    // BLINDAGEM 1: Se o usuário deixar a data de ASO em branco na planilha, não quebra a tela.
    if (!strUltimoExame) return { proximaData: null, status: 'Pendente', diferencaDias: 0 };

    const ultimaData = new Date(strUltimoExame + 'T12:00:00');

    // BLINDAGEM 2: Se a data for inválida (ex: digitaram texto no lugar de números)
    if (isNaN(ultimaData.getTime())) return { proximaData: null, status: 'Erro', diferencaDias: 0 };

    const proximaData = new Date(ultimaData);
    proximaData.setFullYear(proximaData.getFullYear() + parseInt(anosPeriodo || 1));

    const diferencaTempo = proximaData.getTime() - DATA_ATUAL.getTime();
    const diferencaDias = Math.ceil(diferencaTempo / (1000 * 60 * 60 * 24));

    let strStatus = 'Regular';
    if (diferencaDias < 0) strStatus = 'Vencido';
    else if (diferencaDias <= 30) strStatus = 'A Vencer';

    return { proximaData, status: strStatus, diferencaDias };
};

// Formatação visual de datas para o padrão brasileiro (Usado na Interface)
export const formatarData = (strData) => {
    if (!strData) return '-';
    try {
        const data = typeof strData === 'string' ? new Date(strData + 'T12:00:00') : strData;
        // BLINDAGEM 3: Impede o "RangeError" que apagava a sua tabela
        if (isNaN(data.getTime())) return 'Inválido';
        return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(data);
    } catch (e) {
        return '-';
    }
};

// Converte do Excel para o Banco de Dados
export const formatarDataParaISO = (dataBR) => {
    if (!dataBR) return '';
    const strLimpa = dataBR.trim();

    // Se já estiver no padrão correto, ignora
    if (strLimpa.match(/^\d{4}-\d{2}-\d{2}$/)) return strLimpa;

    // BLINDAGEM 4: A mágica Regex. Aceita barras (/), traços (-) ou pontos (.) do WhatsApp/Excel
    const partes = strLimpa.split(/[\/\-\.]/);
    if (partes.length !== 3) return '';

    let [dia, mes, ano] = partes;

    // BLINDAGEM 5: Corrige preguiça de digitação (Ex: 10/05/24 vira 2024-05-10)
    if (ano.length === 2) ano = '20' + ano;
    dia = String(dia).padStart(2, '0');
    mes = String(mes).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
};

// Converte do Banco de Dados para o Excel
export const formatarDataParaBR = (dataISO) => {
    if (!dataISO) return '';
    const strLimpa = dataISO.trim();
    if (strLimpa.includes('/')) return strLimpa;

    const partes = strLimpa.split('-');
    if (partes.length !== 3) return '';

    const [ano, mes, dia] = partes;
    return `${dia}/${mes}/${ano}`;
};

// Extrai as iniciais do nome para o Avatar
export const obterIniciais = (nome) => {
    if (!nome) return 'XX';
    const partes = nome.trim().split(' ');
    if (partes.length >= 2) return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    if (partes.length === 1 && partes[0].length >= 2) return partes[0].substring(0, 2).toUpperCase();
    return 'XX';
};

// Gera cor dinâmica baseada na string do nome
export const obterCorAvatar = (nome) => {
    if (!nome) return 'bg-slate-100 text-slate-500';
    const cores = ['bg-indigo-100 text-indigo-700', 'bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-pink-100 text-pink-700', 'bg-teal-100 text-teal-700'];
    let soma = 0;
    for (let i = 0; i < nome.length; i++) soma += nome.charCodeAt(i);
    return cores[soma % cores.length];
};