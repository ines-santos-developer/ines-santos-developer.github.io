#include "GatosCaes.h"
#include <stdio.h>

int CGatosCaes::N=4; // dimensão do tabuleiro, 4,6,8

CGatosCaes::CGatosCaes(void)
{
}

CGatosCaes::~CGatosCaes(void)
{
}

TProcuraConstrutiva* CGatosCaes::Duplicar() {
    CGatosCaes* clone = new CGatosCaes;
    if (clone != NULL)
        clone->Copiar(this);
    else
        memoriaEsgotada = true;
    return clone;
}

void CGatosCaes::Copiar(TProcuraConstrutiva* obj) {
    CGatosCaes* outro = (CGatosCaes*)obj;
    gatos = outro->gatos;
    caes = outro->caes;
    jogadas = outro->jogadas;
    minimizar = outro->minimizar;
}

void CGatosCaes::SolucaoVazia() {
    TProcuraConstrutiva::SolucaoVazia();
    N = instancia.valor;
    gatos = 0;
    caes = 0;
    jogadas = 0;
    minimizar = false; // Gatos começam
    tamanhoCodificado = 2;
}

bool CGatosCaes::NaZonaCentral(int pos) {
    int linha = pos / N;
    int coluna = pos % N;
    return linha >= ((N / 2) - 1) && linha <= (N / 2) && coluna >= ((N / 2) - 1) && coluna <= (N / 2);
}

bool CGatosCaes::AdjacenteDiferente(int pos, bool isGato) {
    static const int offsets[] = { -N, +N, -1, +1 };
    for (int k = 0; k < 4; k++) {
        int adj = pos + offsets[k];
        if (adj < 0 || adj >= (N * N)) continue; // Garante casa Norte e casa Sul
        if ((pos % N == 0 && offsets[k] == -1) || (pos % N == (N - 1) && offsets[k] == 1)) continue; // Garante casa Oeste e Este
        bool adjGato = (gatos >> adj) & 1;
        bool adjCao = (caes >> adj) & 1;
        if (isGato && adjCao) return true;
        if (!isGato && adjGato) return true;
    }
    return false;
}

bool CGatosCaes::ValidaPosicao(int pos, bool isGato) {
    if (((gatos | caes) >> pos) & 1) return false;
    if (jogadas == 0 && !NaZonaCentral(pos)) return false;
    if (jogadas == 1 && NaZonaCentral(pos)) return false;
    if (AdjacenteDiferente(pos, isGato)) return false;
    return true;
}

void CGatosCaes::Sucessores(TVector<TNo>& sucessores) {
    if (!SolucaoCompleta()) {
        for (int i = 0; i < (N * N); i++) {
            if (ValidaPosicao(i, !minimizar)) {
                CGatosCaes* novo = (CGatosCaes*)Duplicar();
                if (novo == NULL) return;
                if (!minimizar)
                    novo->gatos |= ((uint64_t)1 << i);
                else
                    novo->caes |= ((uint64_t)1 << i);
                novo->minimizar = !minimizar;
                novo->jogadas++;
                sucessores.Add(novo);
            }
        }
        TProcuraAdversa::Sucessores(sucessores);
    }
}

bool CGatosCaes::SolucaoCompleta() {
    return jogadas >= (N * N);
}

const char* CGatosCaes::Acao(TProcuraConstrutiva* suc) {
    static char str[10];
    CGatosCaes* s = (CGatosCaes*)suc;
    uint64_t dif = (gatos ^ s->gatos) | (caes ^ s->caes);
    int count = 0;
    for (int i = 0; i < (N * N); i++)
        if ((dif >> i) & 1) count++;
    int pos = 0;
    while (((dif >> pos) & 1) == 0 && pos < (N * N)) pos++;
    sprintf(str, "%c%d", 'a' + pos % N, 1 + pos / N);
    return str;
}

bool CGatosCaes::Acao(const char* acao) {
    char col;
    int lin;
    if (sscanf(acao, "%c%d", &col, &lin) == 2) {
        int pos = (lin - 1) * N + (col - 'a');
        if (ValidaPosicao(pos, !minimizar)) {
            if (!minimizar) {
                gatos |= ((uint64_t)1 << pos);
            }
            else {
                caes |= ((uint64_t)1 << pos);
            }
            minimizar = !minimizar;
            jogadas++;
            return true;
        }
    }
    return false;
}

void CGatosCaes::Debug() {
    NovaLinha();
    printf("  ");
    for (int j = 0; j < N; j++) printf(" %c", 'A' + j);
    for (int i = 0; i < N; i++) {
        NovaLinha();
        printf("%d ", i + 1);
        for (int j = 0; j < N; j++) {
            int pos = Indice(i, j);

            if ((gatos >> pos) & 1) printf(" g");
            else if ((caes >> pos) & 1) printf(" c");
            else printf(" .");
        }
        printf(" %d", i + 1);
    }
    NovaLinha();
    printf("  ");
    for (int j = 0; j < N; j++) printf(" %c", 'A' + j);
}

void CGatosCaes::TesteManual(const char* nome) {
    instancia = { NULL, 4, 4, 8, NULL, NULL };
    TProcuraAdversa::TesteManual(nome);
}

void CGatosCaes::ResetParametros() {
    static const char* heuristicaGatos[] = {
        "Sem heuristica",
        "Heurística Casas",
        "Heurística Ponderacao" };

    TProcuraAdversa::ResetParametros();
    /* Nível 1: limite=2 limiteTempo=1s heurGatos=1 (profundidade 1)
    *  Nivel 2: limite=3 limiteTempo=1s heurGatos=1 (profundidade 2)
    *  Nivel 3: limite=0 limiteTempo=2s heurGatos=1  (iterativo) --- base
    *  Nivel 4: limite=0 limiteTempo=5s heurGatos=1
    *  Nível 5: limite=0 limiteTempo=10s heurGatos=1
    */

    parametro[algoritmo].valor = 2;
    parametro[estadosRepetidos].valor = ignorados;
    parametro[limiteTempo].valor = 2;
    parametro[limite].valor = 0; // profundidade 1 - teste heurísticas
    parametro[ordenarSucessores].valor = 2;
    parametro[baralharSuc].valor = 1;
    parametro[ruidoHeur].valor = 0;
    parametro[podaHeuristica].valor = 0;
    parametro[podaCega].valor = 0;

    // heuristicaGatos
    parametro.Add({ "Heuristica",1,0,2, "Possibilidades para a heurística", heuristicaGatos });
}

int CGatosCaes::Heuristica() {
    heuristica = 0;

    if (ExisteHeuritica())
        return heuristica;

    int casasSeguras = 0;
    int casasPerdidas = 0;
    int casasDisputadas = 0;

    uint64_t ocupadas = gatos | caes;

    for (int i = 0; i < (N * N); i++) {
        if ((ocupadas >> i) & 1) continue;

        bool euPosso = !AdjacenteDiferente(i, minimizar);
        bool adversarioPode = !AdjacenteDiferente(i, !minimizar);

        if (euPosso && !adversarioPode)
            casasSeguras++;
        else if (!euPosso && adversarioPode)
            casasPerdidas++;
        else if (euPosso && adversarioPode)
            casasDisputadas++;
    }

    if (casasDisputadas == 0) {
        if (casasSeguras > casasPerdidas)
            heuristica = infinito; // vitória garantida
        else if (casasSeguras < casasPerdidas)
            heuristica = -infinito; // derrota garantida
    }
    else {
        if (parametro[heurGatos].valor == 1) { // Heurística Casas
            heuristica = ((casasSeguras - casasPerdidas) * infinito) / (1 + casasDisputadas);
        }
        else if (parametro[heurGatos].valor == 2) { //Heurística Ponderacao
            // pesos ajustáveis
            const int PESO_SEGURAS = 20;
            const int PESO_PERDIDAS = 10;
            const int PENAL_DISPUTA = 1;

            heuristica = (casasSeguras * PESO_SEGURAS)
                        - (casasPerdidas * PESO_PERDIDAS)
                        - (casasDisputadas * PENAL_DISPUTA);
        }
    }

    return TProcuraAdversa::Heuristica();
}

void CGatosCaes::Codifica(uint64_t estado[OBJETO_HASHTABLE]) {
    TProcuraConstrutiva::Codifica(estado);

    estado[0] = gatos;
    estado[1] = caes;
}

