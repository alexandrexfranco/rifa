// Variáveis globais
let participantes = {};
let valorRifa = 0;
let numerosSelecionados = [];
const grid = document.getElementById('grid');

// Criar grade de números (1 a 200)
for (let i = 1; i <= 200; i++) {
    const num = document.createElement('div');
    num.className = 'number';
    num.textContent = i.toString().padStart(2, '0');
    num.onclick = () => selecionarNumero(i);
    grid.appendChild(num);
}

// Função para resetar a grade (remover 'taken' de todos os números)
function resetarGrade() {
    const numbers = document.querySelectorAll('.number');
    numbers.forEach(num => num.classList.remove('taken'));
}

// Função para inicializar a aplicação (carregar dados do localStorage)
function inicializar() {
    const participantesSalvos = JSON.parse(localStorage.getItem('participantes'));
    if (participantesSalvos) {
        participantes = participantesSalvos;
        // Marcar números como ocupados
        for (let nome in participantes) {
            participantes[nome].forEach(num => {
                grid.children[num - 1].classList.add('taken');
            });
        }
    }
    
    const valorRifaSalvo = localStorage.getItem('valorRifa');
    if (valorRifaSalvo) {
        valorRifa = parseFloat(valorRifaSalvo);
        document.getElementById('valorRifa').value = valorRifa;
    }
    
    atualizarLista();
    atualizarEstatisticas();
}

// Carregar os dados quando a página for aberta
window.addEventListener('load', inicializar);

// Função para iniciar uma nova rifa
function novaRifa() {
    // Limpar localStorage
    localStorage.removeItem('participantes');
    localStorage.removeItem('valorRifa');
    
    // Reiniciar variáveis
    participantes = {};
    valorRifa = 0;
    numerosSelecionados = [];
    
    // Resetar grade
    resetarGrade();
    
    // Limpar campos
    document.getElementById('nome').value = '';
    document.getElementById('numerosEscolhidos').value = '';
    document.getElementById('valorRifa').value = '';
    
    // Atualizar interface
    atualizarLista();
    atualizarEstatisticas();
}

// Adicionar evento ao botão "Nova Rifa"
document.getElementById('nova-rifa').addEventListener('click', novaRifa);

// Atualizar o valor da rifa quando alterado
document.getElementById('valorRifa').addEventListener('change', function() {
    valorRifa = parseFloat(this.value) || 0;
    localStorage.setItem('valorRifa', valorRifa); // Salvar no localStorage
    atualizarEstatisticas();
});

// Função para selecionar números
function selecionarNumero(numero) {
    const index = numerosSelecionados.indexOf(numero);
    const numElement = grid.children[numero - 1];

    if (numElement.classList.contains('taken')) {
        alert('Este número já foi escolhido!');
        return;
    }

    if (index === -1) {
        numerosSelecionados.push(numero);
    } else {
        numerosSelecionados.splice(index, 1);
    }

    document.getElementById('numerosEscolhidos').value = numerosSelecionados.join(', ');
}

// Função para adicionar participante
function adicionarParticipante() {
    const nome = document.getElementById('nome').value.trim();
    const numeros = [...numerosSelecionados];

    if (!nome) {
        alert('Por favor, digite um nome!');
        return;
    }
    if (numeros.length === 0) {
        alert('Por favor, selecione pelo menos um número!');
        return;
    }

    participantes[nome] = numeros;
    localStorage.setItem('participantes', JSON.stringify(participantes)); // Salvar no localStorage
    
    // Marcar números como ocupados
    numeros.forEach(num => {
        grid.children[num - 1].classList.add('taken');
    });

    // Atualizar interface
    atualizarLista();
    atualizarEstatisticas();

    // Limpar campos
    document.getElementById('nome').value = '';
    document.getElementById('numerosEscolhidos').value = '';
    numerosSelecionados = [];
}

// Função para atualizar a lista de participantes
function atualizarLista() {
    const lista = document.getElementById('listaParticipantes');
    while (lista.children.length > 1) {
        lista.removeChild(lista.lastChild);
    }
    
    for (let nome in participantes) {
        const div = document.createElement('div');
        div.className = 'participante';
        div.textContent = `${nome}: ${participantes[nome].map(n => n.toString().padStart(2, '0')).join(', ')}`;
        lista.appendChild(div);
    }

    if (Object.keys(participantes).length === 0) {
        const p = document.createElement('p');
        p.textContent = 'Nenhum participante registrado';
        lista.appendChild(p);
    }
}

// Função para atualizar as estatísticas
function atualizarEstatisticas() {
    const totalParticipantes = Object.keys(participantes).length;
    const totalRifasVendidas = Object.values(participantes).reduce((acc, curr) => acc + curr.length, 0);
    const valorArrecadado = (totalRifasVendidas * valorRifa).toFixed(2);

    document.getElementById('totalParticipantes').textContent = totalParticipantes;
    document.getElementById('totalRifasVendidas').textContent = totalRifasVendidas;
    document.getElementById('valorArrecadado').textContent = valorArrecadado;
}