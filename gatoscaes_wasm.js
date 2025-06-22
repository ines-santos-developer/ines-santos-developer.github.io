
/* Funções de acesso ao código WASM */
var Inicializar, ExecutarLance, Parametros, GetParametroX, SetParametro, ExecutarX;
const board = document.getElementById("board"); // objeto principal, global a todas as funções

Module.onRuntimeInitialized = function () {
    // Inicializar funções globalmente
    Inicializar = Module.cwrap('Inicializar', null, ['number']);
    ExecutarLance = Module.cwrap('ExecutarLance', 'boolean', ['string']);
    Parametros = Module.cwrap('Parametros', 'number', []);
    GetParametroX = Module.cwrap('GetParametro', null, ['number', 'number', 'number', 'number', 'string']);
    SetParametro = Module.cwrap('SetParametro', null, ['number', 'number']);
    ExecutarX = Module.cwrap('Executar', null, ['number', 'number']);

    // chamar a inicialização do tabuleiro  apenas após estar tudo carregado
    // antes deste ponto nenhuma função pode ser chamada
    IniciarTabuleiro(4);
};

function Executar() {
    return new Promise(resolve => {
        let acaoPtr = Module.ccall('malloc', 'number', ['number'], [20]); // Aloca memória
        let estPtr = Module.ccall('malloc', 'number', ['number'], [1024]); // Aloca memória

        board.classList.add("pensando"); // Ativa a animação
        document.getElementById("statsContent").textContent = "A pensar..."

        setTimeout(() => {
            ExecutarX(acaoPtr, estPtr); // Executa a função WebAssembly

            let acao = Module.UTF8ToString(acaoPtr); // Converte de memória WebAssembly para string
            let est = Module.UTF8ToString(estPtr); // Converte de memória WebAssembly para string
            console.log("acao: " + acao + " est:" + est);
            Module.ccall('free', null, ['number'], [acaoPtr]); // Libera memória
            Module.ccall('free', null, ['number'], [estPtr]); // Libera memória

            board.classList.remove("pensando"); // Remove a animação

            resolve([acao, est]); // Agora retorna corretamente
        }, 100); // Pequeno atraso para a animação ser visível
    });
}

function GetParametro(i) {
    let valorPtr = Module.ccall('malloc', 'number', ['number'], [4]);
    let minPtr = Module.ccall('malloc', 'number', ['number'], [4]);
    let maxPtr = Module.ccall('malloc', 'number', ['number'], [4]);
    let nomePtr = Module.ccall('malloc', 'number', ['number'], [256]); // Buffer maior para o nome

    GetParametroX(i, valorPtr, minPtr, maxPtr, nomePtr);

    let valor = Module.getValue(valorPtr, 'i32');
    let min = Module.getValue(minPtr, 'i32');
    let max = Module.getValue(maxPtr, 'i32');
    let nome = Module.UTF8ToString(nomePtr);

    Module.ccall('free', null, ['number'], [valorPtr]);
    Module.ccall('free', null, ['number'], [minPtr]);
    Module.ccall('free', null, ['number'], [maxPtr]);
    Module.ccall('free', null, ['number'], [nomePtr]);

    return [valor, min, max, nome];
}

// Função para definir um cookie
function SetCookie(nome, valor, dias) {
    const dataExp = new Date();
    dataExp.setTime(dataExp.getTime() + (dias * 24 * 60 * 60 * 1000));
    const expires = "expires=" + dataExp.toUTCString();
    document.cookie = nome + "=" + valor + ";" + expires + ";path=/";
}

// Função para obter o valor de um cookie
function GetCookie(nome) {
    const name = nome + "=";
    const ca = document.cookie.split(';');
    for (let c of ca) {
        c = c.trim();
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// eventos mapeados
document.getElementById('btnLimpar').addEventListener('click', function () {
    SetCookie("resultados", "", -1); // apagar o cookie
    LerResultados();
})

document.getElementById('btnJogar').addEventListener('click', function () {
    if (board.dataset.computador > -1 || board.dataset.nJogadas > 2)  
        board.dataset.jogoValido = 0;
    board.dataset.computador = board.dataset.jogador;
    // acertar nível de jogo
    const nivel = Number(document.getElementById('nivelJogo').value);
    if (nivel == 1) { // Nível 1: Nível 1: limite=2 limiteTempo=1s podaBranca=0 (profundidade 1)
        SetParametro(8, 2); // limite
        SetParametro(4, 1); // limiteTempo
        SetParametro(17, 1); // heurGatos
    } else if (nivel == 2) { // Nivel 2: limite=3 limiteTempo=1s podaBranca=0 (profundidade 2)	
        SetParametro(8, 3); // limite
        SetParametro(4, 1); // limiteTempo
        SetParametro(17, 1); // heurGatos
    } else if (nivel == 3) { // Nivel 3: limite=0 limiteTempo=2s podaBranca=0
        SetParametro(8, 0); // limite
        SetParametro(4, 2); // limiteTempo
        SetParametro(17, 1); // heurGatos
    } else if (nivel == 4) { // Nivel 4: limite=0 limiteTempo=5s podaBranca=0 
        SetParametro(8, 0); // limite
        SetParametro(4, 5); // limiteTempo
        SetParametro(17, 1); // heurGatos
    } else if (nivel == 5) { // Nível 5: limite=0 limiteTempo=10s podaBranca=0
        SetParametro(8, 0); // limite
        SetParametro(4, 10); // limiteTempo
        SetParametro(17, 1); // heurGatos
    }
    // semente aleatória, com base no tempo em milisegundos
    //SetParametro(3, (Date.now() % 1000000) + 1);
    SetParametro(3, 1);

    SetParametro(0, 1); // algoritmo

    if (board.dataset.jogoEmCurso == 1)
        JogarComputador();
    else
        AnalisarComputador();
});

document.getElementById("btnNovoJogo").addEventListener("click", function () {
    IniciarTabuleiro(document.getElementById("boardSize").value);
});


// Cria um tabuleiro com coordenadas axiais.
function IniciarTabuleiro(size) {
    board.innerHTML = ""; // Limpa o tabuleiro anterior
    const boardMatrix = [];
    const cellSize = 50; // Base para os cálculos (largura da célula)

    size = Number(size);

    // dados:
    board.dataset.casa = ""; // casa selecionada
    board.dataset.jogador = 0; // quem joga
    board.dataset.corSel = "beige"; // cor de uma casa selecionada
    board.dataset.corNormal = "lightblue"; // cor de uma casa não selecionada
    board.dataset.nJogadas = 0; // número de jogadas
    board.dataset.computador = -1; // não tem lado
    board.dataset.jogoValido = 1; // jogo válido, até que o jogador automático jogue em mais que um lado
    board.dataset.jogoEmCurso = 1;
    board.partida = []; // lista de lances

    // partida tem de ficar vazia: 
    document.getElementById("moveList").innerHTML = "";

    if (Opcao("anotarCasas"))
        AdicionarAnotacoes(size);

    // Itera pelas linhas (r) e colunas (q)
    for (let r = 0; r < size; r++) {
        boardMatrix[r] = [];
        for (let q = 0; q < size; q++) {
            const square = document.createElement("div");
            square.classList.add("square");

            const x = (q * cellSize * 1.25) + 65;
            const y = (r * cellSize * 1.1) + 65;
            square.style.left = `${x}px`;
            square.style.top = `${y}px`;

            // Define a posição identificadora (colunas com letras e linhas com números)
            square.dataset.position = String.fromCharCode(65 + q) + (r + 1);
            square.dataset.conteudo = 0;

            // Evento de clique em cada quadrado
            square.addEventListener("click", () =>
                handleSquareClick(square));

            board.appendChild(square);
            boardMatrix[r][q] = square;
        }
    }

    // dimensão do container do tabuleiro
    const totalWidth = (size * cellSize * 1.25) + 125;
    const totalHeight = (size * cellSize * 1.1) + 125;
    board.style.width = totalWidth + "px";
    board.style.height = totalHeight + "px";

    // criar casas de indicação de jogador a jogar (nos cantos)
    const positions = [
        { x: 0, y: 0, name: "sup-esq" },
        { x: totalWidth - 59, y: totalHeight - cellSize - 2, name: "inf-dir" },
        { x: totalWidth - 59, y: 0, name: "sup-dir" },
        { x: 0, y: totalHeight - cellSize - 2, name: "inf-esq" }
    ];

    positions.forEach(pos => {
        const square = document.createElement("div");
        square.classList.add("player");
        square.style.left = `${pos.x}px`;
        square.style.top = `${pos.y}px`;
        square.dataset.position = pos.name;
        square.style.background = "thistle";

        board.appendChild(square);
    });
    board.boardMatrix = boardMatrix;

    document.getElementById('btnJogar').innerHTML = "Jogar";

    Inicializar(size);
    FinalizarJogada(false);
    LerResultados();
}

function AdicionarAnotacoes(size) {
    size = Number(size);
    const cellSize = 50;

    // Letras nas colunas (A, B, C...)
    for (let c = 0; c < size; c++) {
        const anot = document.createElement("div");
        anot.classList.add("anotacao");
        anot.style.position = "absolute";
        anot.style.left = `${(c * cellSize * 1.25) + 80}px`;
        anot.style.top = `30px`; // Acima do tabuleiro
        anot.textContent = String.fromCharCode(65 + c); // A, B, C...
        board.appendChild(anot);
    }

    // Números nas linhas (1, 2, 3...)
    for (let r = 0; r < size; r++) {
        const anot = document.createElement("div");
        anot.classList.add("anotacao");
        anot.style.position = "absolute";
        anot.style.left = `30px`; // À esquerda do tabuleiro
        anot.style.top = `${(r * cellSize * 1.1) + 80}px`;
        anot.textContent = r + 1;
        board.appendChild(anot);
    }
}

// retorna as casas selecionadas atuais
function CasaSelecionada() {
    return document.querySelector(`[data-position="${board.dataset.casa}"]`);
}

async function AnalisarComputador() {
    // Possibilidade de melhoria:
    // analisar todos os lances
    // permitir parar a análise (trocar o botão para "Parar" enquanto faz a análise)
    // marcar os que estão de acordo com o agente
    // os que são distintos, e têm variação de valor, assinalar como erros, interrogação (ou ponto de exclamação)
    // assinar a análise com o nível utilizado

    // atualmente, analisa a posição atual, indicando o lance que aconselha, e estatísticas
    let [lance, est] = await Executar(); // Chama a função WebAssembly
    console.log("Análise executada: ", lance, "Estatísticas", est);
    document.getElementById("statsContent").textContent =
        "Lance: " + lance + "\n" + est;
}

async function JogarComputador() {
    let [lance, est] = await Executar(); // Chama a função WebAssembly
    console.log("Ação executada: ", lance, "Estatísticas", est);

    // Atualiza o painel de estatísticas
    if (Opcao("mostraEstatisticas"))
        document.getElementById("statsContent").textContent = est;
    else
        document.getElementById("statsContent").textContent = "";

    ExecutarLanceHTML(lance);
}

function ExecutarLanceHTML(lance) {
    /* executar a ação no HTML */
    lance = lance.toUpperCase(); // Converter para maiúsculas
    let match = lance.match(/^[A-Z]\d{1,2}?$/);

    console.log("lance: " + lance + " match: " + match);

    if (match) {
        board.dataset.casa = match; // Primeira casa

        if (board.dataset.jogoEmCurso == 1)
            EfetuarJogadaTab();
    } else {
        console.error("Formato inválido de jogada:", lance);
    }
}

// peça: 0 - vazia, 1 - gato, 2 - cao
function SetSquare(square, peca) {
    // Vetor de peças onde o índice representa a peça
    const pecas = ["", "🐱", "🐶"];
    square.dataset.conteudo = peca;
    // Atualiza o conteúdo do quadrado com base no vetor
    square.innerHTML = pecas[peca] || "";
}


// Função que recebe o quadrado clicado e o tabuleiro
function handleSquareClick(square) {
    if (board.dataset.jogoEmCurso != 1) {
        alert("Jogo terminado. Inicie um novo jogo selecionando um tamanho para o tabuleiro.");
        return;
    }

    if(!JogadaValida(square)) {
        if(board.dataset.nJogadas == 0)
            alert("Jogada inválida! Primeira jogada dos gatos deve de ser na zona central.");
        else if (board.dataset.nJogadas == 1)
            alert("Jogada inválida! Primeira jogada dos caes deve de ser fora da zona central ou casa inválida.");
        else
            alert("Jogada inválida! Escolha uma casa válida.");
        return;
    }

    board.dataset.casa = square.dataset.position;
    square.style.background = board.dataset.corSel;
    // colocar peça do jogador
    SetSquare(square, Number(board.dataset.jogador) === 0 ? 1 : 2);
    EfetuarJogadaWASM("");
}

function JogadaValida(square) {
    if (square.dataset.conteudo !== "0") return false; // Casa ocupada

    const jogador = Number(board.dataset.jogador);
    
    const minhaPeca = jogador === 0 ? 1 : 2;         // 1 = gato, 2 = cão
    const pecaInimiga = jogador === 0 ? 2 : 1;

    // Extrai linha (número) e coluna (letra)
    const pos = square.dataset.position;
    const colLetra = pos.charAt(0).toUpperCase();
    const linhaNum = parseInt(pos.slice(1));

    const c = colLetra.charCodeAt(0) - 65; // 'A' -> 0, 'B' -> 1, ...
    const r = linhaNum - 1;                // '1' -> 0, '2' -> 1, ...

    const matrix = board.boardMatrix;
    const size = matrix.length;
    const centro = Math.floor(size / 2);
    const naZonaCentral = (r === centro || (r === centro-1)) && (c === centro || (c === centro-1));

    if (board.dataset.nJogadas == 0 && !naZonaCentral) return false;
    if (board.dataset.nJogadas == 1 && naZonaCentral) return false;

    const vizinhos = [
        [r - 1, c], // cima
        [r + 1, c], // baixo
        [r, c - 1], // esquerda
        [r, c + 1]  // direita
    ];

    for (let [vr, vc] of vizinhos) {
        if (vr >= 0 && vr < size && vc >= 0 && vc < size) {
            const vizinho = matrix[vr][vc];
            if (parseInt(vizinho.dataset.conteudo) === pecaInimiga) {
                return false; // Tem inimigo ao lado
            }
        }
    }

    return true; // Casa válida e sem inimigos ao lado
}

// efetuar jogada no HTML
function EfetuarJogadaTab() {
    const sel1 = CasaSelecionada();

    if (sel1) {     
        sel1.style.background = board.dataset.corSel;
        // colocar peça da cor do jogador
        if (board.dataset.jogador == 0) 
            SetSquare(sel1, 1); // Peça gato
        else 
            SetSquare(sel1, 2); // Peça cao
    }

    FinalizarJogada(true);
}

// executar uma jogada
function EfetuarJogadaWASM(lance) {
    let jogada = "";
    if (lance == "") {
        const sel1 = CasaSelecionada();

        // repor fundo
        if (sel1)
            sel1.style.background = board.dataset.corNormal;

        // efetuar jogada no WASM
        jogada = board.dataset.casa; // Concatenar valores
    } else
        jogada = lance;
    jogada = jogada.toLowerCase();
    let sucesso = ExecutarLance(jogada);
    console.log("Jogada enviada:", jogada, "Sucesso:", sucesso);

    if (lance == "")
        FinalizarJogada(true);
}

function Opcao(label) {
    return document.getElementById(label).checked;
}

function AdicionarLance(lance) {
    const moveList = document.getElementById("moveList");

    // Normaliza o lance
    lance = lance.toLowerCase();
    if (lance === "") lance = "error";

    // Adiciona o lance ao histórico da partida
    board.partida.push(lance);

    // O número da jogada é obtido a partir do contador (sendo lances azuis e vermelhos)
    let numJogada = Math.ceil(board.dataset.nJogadas / 2);

    // Obtém o último item da lista (para adicionar o lance vermelho na mesma rodada)
    let ultimoItem = moveList.lastElementChild;

    if (board.dataset.nJogadas % 2 === 0) {
        // Se for a jogada ímpar (ou se não houver item anterior), cria um novo item
        let novoItem = document.createElement("li");
        novoItem.style.display = "flex";
        novoItem.style.alignItems = "center";
        novoItem.style.marginBottom = "5px"; // Espaçamento entre os itens

        // Cria o rótulo com o número da jogada
        let moveNumber = document.createElement("span");
        moveNumber.textContent = `${numJogada+1}. `;
        moveNumber.style.width = "30px";         // Largura fixa para o número
        moveNumber.style.display = "inline-block";
        moveNumber.style.textAlign = "right";     // Alinha o número à direita
        novoItem.appendChild(moveNumber);

        // Cria uma mini tabela para abrigar os botões dos lances
        let tabela = document.createElement("table");
        tabela.style.borderCollapse = "collapse";
        tabela.style.display = "inline-table";     // Para que a tabela fique na mesma linha do número

        let row = tabela.insertRow();

        // Coluna para o lance azul
        let cellAzul = row.insertCell();
        cellAzul.style.width = "100px";            // Largura fixa
        cellAzul.style.textAlign = "left";
        cellAzul.textContent = `🐱${lance}`;

        // Coluna para o lance vermelho (inicialmente vazia)
        let cellVermelho = row.insertCell();
        cellVermelho.style.width = "100px";        // Largura fixa
        cellVermelho.style.textAlign = "left";

        // Junta a mini tabela ao item e adiciona na lista
        novoItem.appendChild(tabela);
        moveList.appendChild(novoItem);
    } else {
        // Se for a jogada par, adiciona o lance ao último item criado para completar a rodada
        let tabela = ultimoItem.querySelector("table");
        let row = tabela.rows[0];
        let cellVermelho = row.cells[1];
        cellVermelho.textContent = `🐶${lance}`;
    }

    // Incrementa o contador de jogadas
    board.dataset.nJogadas++;
}

function FinalizarJogada(trocaJog) {
    const sel1 = CasaSelecionada();

    // troca de jogador
    if (trocaJog) {
        AdicionarLance(board.dataset.casa);
        board.dataset.jogador = 1 - Number(board.dataset.jogador);
    }

    // limpar seleção
    board.dataset.casa = "";

    // atualizar quem joga
    const supdir = document.querySelector(`[data-position="sup-dir"]`);
    const supesq = document.querySelector(`[data-position="sup-esq"]`);
    const infdir = document.querySelector(`[data-position="inf-dir"]`);
    const infesq = document.querySelector(`[data-position="inf-esq"]`);
    if (board.dataset.jogador == 0) {
        SetSquare(supesq, 1); // gato
        SetSquare(infdir, 1); // gato
        SetSquare(supdir, 0);
        SetSquare(infesq, 0);
    } else {
        SetSquare(supesq, 0); 
        SetSquare(infdir, 0); 
        SetSquare(supdir, 2); // cao
        SetSquare(infesq, 2); // cao
    }
    if (JogoTerminado()) {
        SetSquare(supesq, 1); // gato
        SetSquare(infdir, 1); // gato
        SetSquare(supdir, 2); // cao
        SetSquare(infesq, 2); // cao
        if (board.dataset.jogador == 0) {
            supdir.style.background = "gold";
            infesq.style.background = "gold";
            alert("Vitória Cao!");
        } else {
            supesq.style.background = "gold";
            infdir.style.background = "gold";
            alert("Vitória Gato!");
        }
        if (board.dataset.jogoValido == 1) 
            RegistoJogo()

        board.dataset.computador = -1;
        board.dataset.jogoEmCurso = 0;
        document.getElementById('btnJogar').innerHTML = "Analisar";
        board.currentMove = board.partida.length - 1;
        EventosNavegacao();
    } 

    // marcar fundo, para se ver (apenas em casas não brilhantes)
    if (Opcao("marcaUltimaJogada")) {
        // marcaUltimaJogada
        if (sel1)
            if (sel1.style.background == board.dataset.corNormal)
                sel1.style.background = board.dataset.corSel;
    }

    // jogada do computador
    if (board.dataset.jogoEmCurso == 1 && board.dataset.computador == board.dataset.jogador)
        JogarComputador();
}

function JogoTerminado() {
    const jogador = Number(board.dataset.jogador);
    const target = jogador == 0 ? 1 : 2; // supondo que os valores do dataset.conteudo sejam '1' ou '2'
    const visited = new Set();
    const queue = [];
    let resultado = 0;
    let corSel = "gold";

    const minhaPeca = jogador === 0 ? 1 : 2;         // 1 = gato, 2 = cão
    const pecaInimiga = jogador === 0 ? 2 : 1;

    const matrix = board.boardMatrix;
    const size = matrix.length;

    // Percorre o tabuleiro à procura de uma jogada válida
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const cell = matrix[r][c];
            if (cell.dataset.conteudo !== "0") continue; // Casa já ocupada

            // Verifica os 4 vizinhos (cima, baixo, esquerda, direita)
            const vizinhos = [
                [r - 1, c],
                [r + 1, c],
                [r, c - 1],
                [r, c + 1]
            ];

            let temInimigoAdjacente = false;
            for (let [vr, vc] of vizinhos) {
                if (vr >= 0 && vr < size && vc >= 0 && vc < size) {
                    const vizinho = matrix[vr][vc];
                    if (parseInt(vizinho.dataset.conteudo) === pecaInimiga) {
                        temInimigoAdjacente = true;
                        break;
                    }
                }
            }

            // Se não tem inimigo ao lado, é uma jogada válida!
            if (!temInimigoAdjacente) {
                return false; // Jogo NÃO terminou, jogada disponível
            }
        }
    }

    // Se não encontrou nenhuma jogada válida
    return true; // Jogo TERMINOU
}

function LerResultados() {
    const valor = GetCookie("resultados");

    if (valor) {
        let resultados = JSON.parse(decodeURIComponent(valor));
        board.result = resultados;
    } else {
        let resultados = [];
        for (let t = 4; t <= 11; t++) {
            resultados[t - 4] = [];
            for (let n = 0; n <= 5; n++)
                resultados[t - 4][n] = [[0, 0], [0, 0]];
        }
        board.result = resultados;
    }
    // refresh da tabela de resultados
    RefreshResultados();
}

function RegistoJogo() {
    const tamanho = Number(board.boardMatrix.length);
    const nivel = board.dataset.computador == -1 ? 0 : Number(document.getElementById('nivelJogo').value);
    const lado = Number(board.dataset.computador == 0 ? 1 : 0);
    const resultado = board.dataset.jogador != board.dataset.computador ? 0 : 1;

    console.log("RegistoJogo" + tamanho + nivel + lado + resultado);

    // atualizar estrutura 
    board.result[tamanho - 4][nivel][lado][resultado]++;

    // colocar estrutra nos cookies
    SetCookie("resultados", encodeURIComponent(JSON.stringify(board.result)), 30);

    // refresh da tabela de resultados
    RefreshResultados();
}

function RefreshResultados() {
    const tabela = document.querySelector("#resultsTable");

    console.log("RefreshResultados");

    // Limpa apenas o conteúdo das linhas sem remover o cabeçalho
    tabela.innerHTML = "";

    // verificar as colunas e linhas a visualizar
    let verColunas = [];
    let verLinhas = [];

    for (let t = 4; t <= 11; t++) {
        let vazia = true;
        for (let n = 0; n <= 5 && vazia; n++) {
            let c = board.result[t - 4][n];
            vazia = (c[0][0] + c[0][1] + c[1][0] + c[1][1] == 0);
        }
        if (!vazia)
            verLinhas.push(t);
    }
    for (let n = 0; n <= 5; n++) {
        let vazia = true;
        for (let t = 4; t <= 11 && vazia; t++) {
            let c = board.result[t - 4][n];
            vazia = (c[0][0] + c[0][1] + c[1][0] + c[1][1] == 0);
        }
        if (!vazia)
            verColunas.push(n);
    }

    if (verLinhas.length == 0) {
        let linha=tabela.insertRow();
        let celula = linha.insertCell();
        celula.innerHTML = "Ainda não há jogos terminados. <br>Clique nas casas para jogar!<br>Para jogar contra o computador, carregue em 'Jogar' no primeiro ou segundo lance.<br> Pode também desafiar um amigo! <br>No final do jogo pode rever e analisar com o computador.";
        return;
    }

    // colocar o cabeçalho primeiro
    let cabecalho = tabela.insertRow(); 
    let celula = cabecalho.insertCell();
    celula.innerHTML = "<b>Tabuleiro</b>";
    const nomesNiveis = ["Humano", "Fácil", "Desafiante", "Complicado", "Insano", "Impossível"];
    verColunas.forEach(n => {
        let celula = cabecalho.insertCell();
        celula.innerHTML = `<b>${nomesNiveis[n]}</b>`;
    });

    verLinhas.forEach(t => {
        let linha = tabela.insertRow(); // Adiciona uma nova linha
        let novaCelula = linha.insertCell();
        novaCelula.innerHTML = t + "x" + t;

        verColunas.forEach(n => {
            let celula = board.result[t - 4][n];
            //let conteudo = `🐱 ${celula[0][1]} 🏆 ${celula[0][0]} 😞 <br>🐶 ${celula[1][1]} 🏆 ${celula[1][0]} 😞`;
            let conteudo = `
    <table class="miniTabela">
        <tr>
            <td></td>
            <td>🏆</td>
            <td>❌</td>
        </tr>
        <tr>
            <td>🐱</td>
            <td>${NaoZero(celula[0][1])}</td>
            <td>${NaoZero(celula[0][0])}</td>
        </tr>
        <tr>
            <td>🐶</td>
            <td>${NaoZero(celula[1][1])}</td>
            <td>${NaoZero(celula[1][0])}</td>
        </tr>
    </table>
`;

            if (JSON.stringify(celula) === JSON.stringify([[0, 0], [0, 0]]))
                conteudo = "";

            let novaCelula = linha.insertCell();
            novaCelula.innerHTML = conteudo;
        });
    });
}

function NaoZero(valor) {
    return (valor == 0 ? "" : valor);
}

function jumpToMove(index) {
    const partida = [...board.partida];

    // Limpa tabuleiro e restaura jogadas até o índice desejado
    IniciarTabuleiro(board.boardMatrix.length);
    board.dataset.jogoValido = 0; // não registar vitórias
    board.partida = [...partida];
    for (let lance = 0; lance <= index; lance++) {
        EfetuarJogadaWASM(partida[lance]);
        ExecutarLanceHTML(partida[lance]);
    }
    board.partida = partida;
    board.currentMove = index;
    board.dataset.jogoEmCurso = 0;
    document.getElementById('btnJogar').innerHTML = "Analisar";
    EventosNavegacao();
}

function EventosNavegacao() {
    const moveList = document.getElementById("moveList");
    moveList.innerHTML = ''; // Limpa a lista antes de adicionar os novos itens

    let currentMove = board.currentMove;

    for (let index = 0; index < board.partida.length / 2; index++) {
        // Criar o LI como container flex para manter tudo na mesma linha
        let item = document.createElement("li");
        item.style.display = "flex";
        item.style.alignItems = "left";
        item.style.marginBottom = "5px"; // espaçamento entre os itens

        // Adiciona um span para o número do movimento, com largura fixa
        let moveNumber = document.createElement("span");
        moveNumber.textContent = `${index + 1}. `;
        moveNumber.style.width = "30px"; // largura fixa para o número
        moveNumber.style.display = "inline-block";
        moveNumber.style.textAlign = "right";
        item.appendChild(moveNumber);

        // Cria a tabela que conterá os botões dos lances
        let tabela = document.createElement("table");
        tabela.style.borderCollapse = "collapse";
        tabela.style.display = "inline-table"; // faz com que a tabela fique na mesma linha do número

        let row = tabela.insertRow();

        // Coluna da jogada gato
        let cellAzul = row.insertCell();
        cellAzul.style.width = "100px"; // largura fixa
        cellAzul.style.textAlign = "left";
        let botaoAzul = document.createElement("button");
        botaoAzul.textContent = `🐱 ${board.partida[index * 2]}`;
        botaoAzul.addEventListener("click", () => jumpToMove(index * 2));
        if (index * 2 === currentMove) {
            botaoAzul.classList.add("activeMove");
        }
        cellAzul.appendChild(botaoAzul);

        // Coluna da jogada cao (se houver)
        let cellVermelho = row.insertCell();
        cellVermelho.style.width = "100px"; // largura fixa
        cellVermelho.style.textAlign = "left";
        if (board.partida[index * 2 + 1]) {
            let botaoVermelho = document.createElement("button");
            botaoVermelho.textContent = `🐶 ${board.partida[index * 2 + 1]}`;
            botaoVermelho.addEventListener("click", () => jumpToMove(index * 2 + 1));
            if (index * 2 + 1 === currentMove) {
                botaoVermelho.classList.add("activeMove");
            }
            cellVermelho.appendChild(botaoVermelho);
        }
        // Incluí a tabela (com os botões) no item da lista
        item.appendChild(tabela);
        moveList.appendChild(item);
    }
}



