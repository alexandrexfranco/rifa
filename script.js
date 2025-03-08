let participantes = {};
let valorRifa = 0;
let numerosSelecionados = [];
const grid = document.getElementById('grid');

for (let i = 1; i <= 200; i++) {
    const num = document.createElement('div');
    num.className = 'number';
    num.textContent = i.toString().padStart(2, '0');
    num.onclick = () => selecionarNumero(i);
    grid.appendChild(num);
}

function resetarGrade() {
    grid.querySelectorAll('.number').forEach(num => num.classList.remove('taken'));
}

function inicializar() {
    const saved = JSON.parse(localStorage.getItem('participantes')) || {};
    participantes = saved;
    for (let nome in participantes) {
        participantes[nome].forEach(num => grid.children[num - 1].classList.add('taken'));
    }
    valorRifa = parseFloat(localStorage.getItem('valorRifa')) || 0;
    document.getElementById('valorRifa').value = valorRifa || '';
    atualizarLista();
    atualizarEstatisticas();
}

window.addEventListener('load', inicializar);

function novaRifa() {
    localStorage.clear();
    participantes = {};
    valorRifa = 0;
    numerosSelecionados = [];
    resetarGrade();
    document.getElementById('nome').value = '';
    document.getElementById('numerosEscolhidos').value = '';
    document.getElementById('valorRifa').value = '';
    document.getElementById('resultado').textContent = '';
    atualizarLista();
    atualizarEstatisticas();
}

document.getElementById('nova-rifa').addEventListener('click', novaRifa);
document.getElementById('valorRifa').addEventListener('change', function() {
    valorRifa = parseFloat(this.value) || 0;
    localStorage.setItem('valorRifa', valorRifa);
    atualizarEstatisticas();
});

function selecionarNumero(numero) {
    const numElement = grid.children[numero - 1];
    if (numElement.classList.contains('taken')) return;

    const index = numerosSelecionados.indexOf(numero);
    if (index === -1) {
        numerosSelecionados.push(numero);
        numElement.style.background = '#3498db';
    } else {
        numerosSelecionados.splice(index, 1);
        numElement.style.background = 'white';
    }
    document.getElementById('numerosEscolhidos').value = numerosSelecionados.join(', ');
}

function adicionarParticipante() {
    const nome = document.getElementById('nome').value.trim();
    if (!nome || !numerosSelecionados.length) {
        alert('Preencha o nome e selecione números!');
        return;
    }
    participantes[nome] = [...numerosSelecionados];
    localStorage.setItem('participantes', JSON.stringify(participantes));
    numerosSelecionados.forEach(num => grid.children[num - 1].classList.add('taken'));
    document.getElementById('nome').value = '';
    document.getElementById('numerosEscolhidos').value = '';
    numerosSelecionados = [];
    atualizarLista();
    atualizarEstatisticas();
}

function atualizarLista() {
    const lista = document.getElementById('listaParticipantes');
    while (lista.children.length > 1) lista.removeChild(lista.lastChild);
    for (let nome in participantes) {
        const div = document.createElement('div');
        div.className = 'participante';
        div.textContent = `${nome}: ${participantes[nome].map(n => n.toString().padStart(2, '0')).join(', ')}`;
        lista.appendChild(div);
    }
    if (!Object.keys(participantes).length) {
        const p = document.createElement('p');
        p.textContent = 'Nenhum participante ainda.';
        lista.appendChild(p);
    }
}

function atualizarEstatisticas() {
    const totalParticipantes = Object.keys(participantes).length;
    const totalRifasVendidas = Object.values(participantes).reduce((acc, curr) => acc + curr.length, 0);
    const valorArrecadado = (totalRifasVendidas * valorRifa).toFixed(2);
    document.getElementById('totalParticipantes').textContent = totalParticipantes;
    document.getElementById('totalRifasVendidas').textContent = totalRifasVendidas;
    document.getElementById('valorArrecadado').textContent = valorArrecadado;
}

function sortear() {
    const todosNumeros = Object.values(participantes).flat();
    if (!todosNumeros.length) {
        alert('Adicione participantes antes de sortear!');
        return;
    }
    const vencedorNum = todosNumeros[Math.floor(Math.random() * todosNumeros.length)];
    for (let nome in participantes) {
        if (participantes[nome].includes(vencedorNum)) {
            document.getElementById('resultado').textContent = `Vencedor: ${nome} (Número: ${vencedorNum.toString().padStart(2, '0')})`;
            break;
        }
    }
}

function compartilharNoWhatsApp() {
    // Montar a lista de participantes
    let listaParticipantes = '';
    for (let nome in participantes) {
        const numeros = participantes[nome].map(n => n.toString().padStart(2, '0')).join(', ');
        listaParticipantes += `- ${nome}: ${numeros}\n`;
    }
    if (!listaParticipantes) {
        listaParticipantes = 'Nenhum participante ainda.\n';
    }

    // Pegar as estatísticas
    const totalRifasVendidas = Object.values(participantes).reduce((acc, curr) => acc + curr.length, 0);
    const valorRifaFormatado = valorRifa.toFixed(2);
    const valorArrecadado = (totalRifasVendidas * valorRifa).toFixed(2);

    // Montar a mensagem formatada
    const mensagem = `⚠ Resumo da Rifa ⚠\n\n` +
                    `👩🏾‍🤝‍👩🏼 Participantes:\n${listaParticipantes}\n` +
                    `▶ Total de rifas vendidas: ${totalRifasVendidas}\n` +
                    `▶ Valor de cada rifa: R$ ${valorRifaFormatado}\n` +
                    `▶ Valor total arrecadado: R$ ${valorArrecadado}`;

    // Codificar a mensagem para URL e abrir no WhatsApp
    const url = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
}