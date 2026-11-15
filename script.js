// ============= INICIO SEGURO =============
let consultas = [];
try {
  consultas = JSON.parse(localStorage.getItem('shalom_v2') || '[]');
  if (!Array.isArray(consultas)) consultas = [];
} catch (e) {
  consultas = [];
}

document.addEventListener('DOMContentLoaded', () => {
  const inputData = document.getElementById('data');
  if (inputData) inputData.valueAsDate = new Date();
  // Se estiver no histórico, já lista
  if (document.getElementById('tabelaHist')) listarHistorico();
});

function getEl(id) { return document.getElementById(id); }

function salvarEIr() {
  const dados = {
    id: Date.now(),
    nome: getEl('nome')?.value.trim() || '',
    idade: getEl('idade')?.value || '',
    sexo: getEl('sexo')?.value || '',
    data: getEl('data')?.value || '',
    sintomas: getEl('sintomas')?.value.trim() || '',
    diagnostico: getEl('diagnostico')?.value.trim() || '',
    exam: getEl('exam')?.value.trim() || '',
    tratamento: getEl('tratamento')?.value.trim() || '',
    obs: getEl('obs')?.value.trim() || ''
  };

  if (!dados.nome) { alert('ERRO: Digite o Nome Completo!'); getEl('nome')?.focus(); return; }
  if (!dados.diagnostico) { alert('ERRO: Digite o Diagnóstico!'); getEl('diagnostico')?.focus(); return; }

  consultas.unshift(dados);
  localStorage.setItem('shalom_v2', JSON.stringify(consultas));
  alert('Salvo com sucesso!');
  window.location.href = 'historico.html';
}

function listarHistorico() {
  const tabela = getEl('tabelaHist');
  const busca = (getEl('busca')?.value || '').toLowerCase();
  if (!tabela) return;

  if (consultas.length === 0) {
    tabela.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:20px">Nenhuma consulta ainda</td></tr>';
    return;
  }

  const filtradas = consultas.filter(c => c.nome.toLowerCase().includes(busca));
  let html = '';
  filtradas.forEach((c) => {
    const indexReal = consultas.indexOf(c);
    html += `<tr>
      <td>${c.data}</td>
      <td><b>${c.nome}</b> (${c.idade || '-'}a - ${c.sexo || '-'})<br><small>${c.diagnostico}</small></td>
      <td>
        <button class="btn-pdf" onclick="verFicha(${indexReal})">Ver</button>
        <button class="btn-pdf" onclick="gerarPDF(${indexReal})">PDF</button>
        <button class="btn-del" onclick="apagar(${indexReal})">X</button>
      </td>
    </tr>`;
  });
  tabela.innerHTML = html;
}

function verFicha(i) {
  const c = consultas[i];
  if (!c) return;
  getEl('modalBox').innerHTML = `
    <h3 style="margin-top:0; color:#0f766e">${c.nome}</h3>
    <p><b>Idade:</b> ${c.idade} | <b>Sexo:</b> ${c.sexo} | <b>Data:</b> ${c.data}</p><hr>
    <p><b>Sintomas:</b> ${c.sintomas}</p>
    <p><b>Diagnóstico:</b> ${c.diagnostico}</p>
    <p><b>Exames:</b> ${c.exam}</p>
    <p><b>Tratamento:</b> ${c.tratamento}</p>
    <p><b>Obs:</b> ${c.obs}</p><br>
    <div class="botoes">
      <button class="btn btn-save" onclick="gerarPDF(${i})">📄 Gerar PDF</button>
      <button class="btn btn-print" onclick="fecharModal()">Fechar</button>
    </div>`;
  getEl('modal').style.display = 'flex';
}

function fecharModal() { getEl('modal').style.display = 'none'; }
function fechar() { fecharModal(); } // compatibilidade

function apagar(i) {
  if (confirm('Tem certeza que quer apagar esta ficha de ' + consultas[i].nome + '?')) {
    consultas.splice(i, 1);
    localStorage.setItem('shalom_v2', JSON.stringify(consultas));
    listarHistorico();
  }
}

function gerarPDF(i) {
  const c = consultas[i];
  if (!c || !window.jspdf) { alert('Biblioteca PDF não carregou. Verifique a internet.'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(16); doc.setFont(undefined, 'bold');
  doc.text('CLINICA SHALOM BAFATA', 105, 15, { align: 'center' });
  doc.setFontSize(12); doc.text('FICHA DE CONSULTA', 105, 22, { align: 'center' });
  doc.setFont(undefined, 'normal'); doc.setFontSize(11);
  let y = 35;
  const add = (txt) => { doc.text(doc.splitTextToSize(txt, 190), 10, y); y += 10; if (y > 280) { doc.addPage(); y = 15; } };
  add(`Nome: ${c.nome} | Idade: ${c.idade} | Sexo: ${c.sexo} | Data: ${c.data}`);
  add(`Sintomas: ${c.sintomas}`); add(`Diagnostico: ${c.diagnostico}`);
  add(`Exames Complementares: ${c.exam}`); add(`Tratamento: ${c.tratamento}`); add(`Obs: ${c.obs}`);
  y += 10; doc.text('___________________________', 10, y); doc.text('Assinatura do Medico', 10, y + 6);
  doc.save(`Ficha_${c.nome.replace(/\s/g, '_')}.pdf`);
}

function exportarTudoExcel() {
  if (consultas.length === 0) return alert('Nada para exportar');
  let csv = 'Data;Nome;Idade;Sexo;Sintomas;Diagnostico;Exames;Tratamento;Obs\n';
  consultas.forEach(c => { csv += `"${c.data}";"${c.nome}";"${c.idade}";"${c.sexo}";"${c.sintomas}";"${c.diagnostico}";"${c.exam}";"${c.tratamento}";"${c.obs}"\n`; });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'historico_shalom.csv'; a.click();
}