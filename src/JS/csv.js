// --- ENTRADA E SAÍDA DE DADOS (Importação/Exportação CSV) ---
import { colaboradores, salvarNoArmazenamento, registrarBackup } from './store.js';
import { mostrarNotificacao, fecharModalImportacao, verificarStatusBackup } from './ui.js';

export const baixarModeloCSV = () => {
    const cabecalhos = ['ID', 'Matricula', 'Nome', 'Funcao', 'Filial', 'Admissao', 'Ultimo_ASO', 'Periodicidade_Anos', 'Situacao'];
    const linhaExemplo = ['', '00123', 'EXEMPLO DA SILVA', 'OPERADOR', 'FILIAL 02', '2022-01-15', '2025-02-10', '1', 'Ativo'];

    const conteudoCsv = "data:text/csv;charset=utf-8,\uFEFF" + cabecalhos.join(',') + "\n" + linhaExemplo.join(',');
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
        colab.admissao || '',
        colab.ultimoExame,
        colab.periodicidade,
        colab.situacao || 'Ativo'
    ].join(','));

    const conteudoCsv = "data:text/csv;charset=utf-8,\uFEFF" + cabecalhos.join(',') + "\n" + linhas.join("\n");
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
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = (e) => {
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
                    else if (caractere === ',') { retorno.push(valor.trim()); valor = ''; }
                    else valor += caractere;
                }
            }
            retorno.push(valor.trim());
            return retorno;
        };

        let novosColaboradores = [];
        let contagemLinhas = 0;

        for (let i = 1; i < linhasArquivo.length; i++) {
            const linha = analisarLinhaCSV(linhasArquivo[i]);
            if (linha.length < 7) continue;

            novosColaboradores.push({
                id: linha[0] || Date.now().toString() + Math.random().toString(36).substr(2, 5),
                matricula: linha[1] ? linha[1].replace(/"/g, '').trim() : '',
                nome: linha[2] ? linha[2].replace(/"/g, '').trim().toUpperCase() : '',
                funcao: linha[3] ? linha[3].replace(/"/g, '').trim().toUpperCase() : '',
                filial: linha[4] ? linha[4].replace(/"/g, '').trim() : '',
                admissao: linha[5] || '',
                ultimoExame: linha[6],
                periodicidade: parseInt(linha[7]) || 1,
                situacao: linha[8] ? linha[8].replace(/"/g, '').trim() : 'Ativo'
            });
            contagemLinhas++;
        }

        if (novosColaboradores.length > 0) {
            let novosDados = [...colaboradores];
            if (confirm(`Identificamos ${contagemLinhas} registros.\n\nDeseja SUBSTITUIR toda a base atual? (Cancelar irá apenas fundir os dados novos)`)) {
                novosDados = novosColaboradores;
            } else {
                novosColaboradores.forEach(novoColab => {
                    if (!novosDados.find(e => e.id === novoColab.id)) novosDados.push(novoColab);
                    else { novoColab.id = Date.now().toString() + Math.random().toString(36).substr(2, 5); novosDados.push(novoColab); }
                });
            }
            salvarNoArmazenamento(novosDados);
            fecharModalImportacao();
            mostrarNotificacao('Dados importados e sincronizados!', 'success');
        } else {
            mostrarNotificacao('Falha na leitura dos dados CSV.', 'error');
        }
        evento.target.value = '';
    };
    leitor.readAsText(arquivo);
};