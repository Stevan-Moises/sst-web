// --- ENTRADA E SAÍDA DE DADOS (Importação/Exportação CSV) ---
import { colaboradores, salvarNoArmazenamento, registrarBackup } from './store.js';
import { mostrarNotificacao, fecharModalImportacao, verificarStatusBackup, abrirModalConfirmacaoImportacao, fecharModalConfirmacaoImportacao } from './ui.js';

// IMPORTANTE: Trazendo os tradutores de data
import { formatarDataParaISO, formatarDataParaBR } from './utils.js';

let dadosPendentesImportacao = [];

export const baixarModeloCSV = () => {
    const cabecalhos = ['ID', 'Matricula', 'Nome', 'Funcao', 'Filial', 'Admissao', 'Ultimo_ASO', 'Periodicidade_Anos', 'Situacao'];

    const linhaExemplo = ['', '00123', 'EXEMPLO DA SILVA', 'OPERADOR', 'FILIAL 02', '15/01/2022', '10/02/2025', '1', 'ATIVO'];

    const conteudoCsv = "data:text/csv;charset=utf-8,\uFEFF" + cabecalhos.join(';') + "\n" + linhaExemplo.join(';');
    const uriCodificada = encodeURI(conteudoCsv);
    const linkDownload = document.createElement("a");
    linkDownload.setAttribute("href", uriCodificada);
    linkDownload.setAttribute("download", "Modelo_Importacao_SST.csv");
    document.body.appendChild(linkDownload);
    linkDownload.click();
    document.body.removeChild(linkDownload);
    mostrarNotificacao('Modelo baixado. Preencha e faça o upload!', 'info');
};

export const exportarCSV = () => {
    const cabecalhos = ['ID', 'Matricula', 'Nome', 'Funcao', 'Filial', 'Admissao', 'Ultimo_ASO', 'Periodicidade_Anos', 'Situacao'];
    const linhas = colaboradores.map(colab => [
        colab.id,
        `"${colab.matricula || ''}"`,
        `"${colab.nome}"`,
        `"${colab.funcao}"`,
        `"${colab.filial}"`,
        formatarDataParaBR(colab.admissao),
        formatarDataParaBR(colab.ultimoExame),
        colab.periodicidade,
        colab.situacao || 'Ativo'
    ].join(';'));

    const conteudoCsv = "data:text/csv;charset=utf-8,\uFEFF" + cabecalhos.join(';') + "\n" + linhas.join("\n");
    const uriCodificada = encodeURI(conteudoCsv);
    const linkDownload = document.createElement("a");
    linkDownload.setAttribute("href", uriCodificada);
    linkDownload.setAttribute("download", `SST_Base_Colaboradores_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(linkDownload);
    linkDownload.click();
    document.body.removeChild(linkDownload);

    registrarBackup();
    verificarStatusBackup();
    mostrarNotificacao('Download do relatório e Backup concluídos.', 'success');
};

export const lidarImportacaoCSV = (evento) => {
    const arquivo = evento.target.files[0];
    evento.target.value = '';

    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = (e) => {
        try {
            const texto = e.target.result;
            const linhasArquivo = texto.split('\n').filter(linha => linha.trim() !== '');

            if (linhasArquivo.length < 2) {
                mostrarNotificacao('Arquivo vazio ou formato inválido.', 'error');
                return;
            }

            const analisarLinhaCSV = (str) => {
                let retorno = [], entreAspas = false, valor = '';
                for (let caractere of str) {
                    if (entreAspas) {
                        if (caractere === '"') entreAspas = false; else valor += caractere;
                    } else {
                        if (caractere === '"') entreAspas = true;
                        else if (caractere === ',' || caractere === ';') { retorno.push(valor.trim()); valor = ''; }
                        else valor += caractere;
                    }
                }
                retorno.push(valor.trim());
                return retorno;
            };

            // SANITIZADOR DE FILIAIS (Lógica Defensiva)
            const padronizarFilial = (valorBruto) => {
                if (!valorBruto) return '';
                const textoLimpo = valorBruto.replace(/"/g, '').trim().toUpperCase();

                // O Match procura por qualquer sequência de números no texto
                const numerosEncontrados = textoLimpo.match(/\d+/);

                if (numerosEncontrados) {
                    // Pega o número, e garante que tenha 2 dígitos (ex: '2' vira '02')
                    const numeroFormatado = String(numerosEncontrados[0]).padStart(2, '0');
                    return `FILIAL ${numeroFormatado}`;
                }

                // Se não achou número (ex: MATRIZ), devolve o texto original limpo
                return textoLimpo;
            };

            let novosColaboradores = [];
            let contagemLinhas = 0;

            for (let i = 1; i < linhasArquivo.length; i++) {
                const linha = analisarLinhaCSV(linhasArquivo[i]);

                if (linha.length < 7) continue;

                const sitDigitada = linha[8] ? linha[8].replace(/"/g, '').trim().toUpperCase() : '';

                novosColaboradores.push({
                    id: linha[0] || Date.now().toString() + Math.random().toString(36).substr(2, 5),
                    matricula: linha[1] ? linha[1].replace(/"/g, '').trim() : '',
                    nome: linha[2] ? linha[2].replace(/"/g, '').trim().toUpperCase() : '',
                    funcao: linha[3] ? linha[3].replace(/"/g, '').trim().toUpperCase() : '',

                    // NOVA LÓGICA DE FILIAL APLICADA AQUI
                    filial: padronizarFilial(linha[4]),

                    admissao: formatarDataParaISO(linha[5]),
                    ultimoExame: formatarDataParaISO(linha[6]),
                    periodicidade: parseInt(linha[7]) || 1,
                    situacao: sitDigitada === 'INSS' ? 'INSS' : 'Ativo'
                });
                contagemLinhas++;
            }

            if (novosColaboradores.length > 0) {
                dadosPendentesImportacao = novosColaboradores;
                fecharModalImportacao();
                abrirModalConfirmacaoImportacao(contagemLinhas);
            } else {
                mostrarNotificacao('Nenhum dado válido encontrado. Verifique o CSV.', 'error');
            }
        } catch (erro) {
            console.error("Erro fatal capturado na importação:", erro);
            mostrarNotificacao('Erro interno ao ler a planilha. Verifique o console.', 'error');
        }
    };
    leitor.readAsText(arquivo);
};

export const confirmarImportacao = (modo) => {
    let novosDados = [...colaboradores];

    if (modo === 'substituir') {
        novosDados = dadosPendentesImportacao;
    } else if (modo === 'mesclar') {
        dadosPendentesImportacao.forEach(novoColab => {
            if (!novosDados.find(e => e.id === novoColab.id)) novosDados.push(novoColab);
            else { novoColab.id = Date.now().toString() + Math.random().toString(36).substr(2, 5); novosDados.push(novoColab); }
        });
    }

    salvarNoArmazenamento(novosDados);
    dadosPendentesImportacao = [];
    fecharModalConfirmacaoImportacao();
    mostrarNotificacao('Dados importados e sincronizados!', 'success');
};