
// ficheiros do projeto, para compilar com um s� ficheiro no emsripten

#include "./TProcuraAdversa/TProcuraConstrutiva/TRand.cpp"
#include "./TProcuraAdversa/TProcuraConstrutiva/TProcuraConstrutiva.cpp"
#include "./TProcuraAdversa/TProcuraAdversa.cpp"
#include "GatosCaes.cpp"

// n�o colocar o main
// #include "ProcuraEngine.cpp"

// objeto global, com o estado do jogo
extern "C" {
	CGatosCaes gatosCaes;
}

// inicializa��o do tabuleiro vazio de um dado tamanho
extern "C" void Inicializar(int tamanho) {
	gatosCaes.instancia = { NULL, 4,4,8, NULL, NULL };
	gatosCaes.ResetParametros();
	if (tamanho < 4)
		tamanho = 4;
	if (tamanho > 8)
		tamanho = 8;
	gatosCaes.instancia.valor = tamanho;
	TRand::srand(gatosCaes.parametro[seed].valor);
	gatosCaes.SolucaoVazia();
//	printf("\nNovo tabuleiro %d.", tamanho);
}

// executar uma a��o(lance) na posi��o atual(que o utilizador tenha feito)
extern "C" bool ExecutarLance(const char* accao) {
	//printf("\nEm ExecutarLance(%s)", accao);
	bool resultado = gatosCaes.Acao(accao); // a��o executada, ficando o gatosCaes com o mesmo estado que a interface
	//if (!resultado)
		//gatosCaes.Debug();
	gatosCaes.Debug();
	return resultado;
}

// alterar parametros de execu��o
extern "C" int Parametros() { // retorna n�mero de par�metros
	return gatosCaes.parametro.Count();
}

extern "C" void GetParametro(int i, int& valor, int& min, int& max, char nome[256]) { // obtem informa��o sobre o par�metro i
	if (i >= 0 && i < gatosCaes.parametro.Count()) {
		valor = gatosCaes.parametro[i].valor;
		min = gatosCaes.parametro[i].min;
		max = gatosCaes.parametro[i].max;
		strcpy(nome, gatosCaes.parametro[i].nome);
	}
}

extern "C" void SetParametro(int i, int valor) { // altera o valor do par�metro i
	if (i >= 0 && i < gatosCaes.parametro.Count()) {
		if (valor < gatosCaes.parametro[i].min)
			valor = gatosCaes.parametro[i].min;
		if (valor > gatosCaes.parametro[i].max)
			valor = gatosCaes.parametro[i].max;
		gatosCaes.parametro[i].valor = valor;
//		printf("Parametro %d valor %d.\n", i, gatosCaes.parametro[i].valor);
	}
} 

// executar o algoritmo e retornar a��o(lance)
extern "C" void Executar(char accao[20], char estatisticas[1024]) {
	TVector<TNo> backup;
	clock_t inicio;
	int resultado;
	backup = gatosCaes.caminho;
	TRand::srand(gatosCaes.parametro[seed].valor);
	gatosCaes.caminho.Count(0);
	gatosCaes.LimparEstatisticas(inicio);
	resultado = gatosCaes.ExecutaAlgoritmo();
	printf("N(%d)", gatosCaes.N);
	gatosCaes.Debug();
	if (gatosCaes.solucao != NULL) {
		// extrair a a��o que passa do estado atual para o resultado da execu��o
		sprintf(accao, "%s", gatosCaes.Acao(gatosCaes.solucao));
		// o estado atual ser� o resultado da execu��o
		gatosCaes.Copiar(gatosCaes.solucao);
		delete gatosCaes.solucao;
		gatosCaes.solucao = NULL;
	}
	else 
		sprintf(accao, "Sem lance (%d)", resultado);

	// estat�sticas:
	sprintf(estatisticas, "Profundidade: %d (%d%%)\nEstados: %d (%.1fs)",
		gatosCaes.nivelOK, resultado / 10,
		gatosCaes.avaliacoes, 1.0 * (clock() - inicio) / CLOCKS_PER_SEC);

	gatosCaes.caminho = backup;
}

