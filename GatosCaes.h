#pragma once
#include "TProcuraAdversa/TProcuraAdversa.h"

enum EParametrosGatos { heurGatos = parametrosAdversas };

class CGatosCaes : public TProcuraAdversa {
public:
    CGatosCaes(void);
    ~CGatosCaes(void);

    // Utilização de inteiros de 64 bits para representar o estado do tabuleiro
    uint64_t gatos; // bits a 1 representam peças de gatos
    uint64_t caes;  // bits a 1 representam peças de cães
    int jogadas;

    // variáveis da instância
    static int N; // dimensão do tabuleiro: 4,6,8

    TProcuraConstrutiva* Duplicar();
    void Copiar(TProcuraConstrutiva* obj);
    void SolucaoVazia();
    void Sucessores(TVector<TNo>& sucessores);
    bool SolucaoCompleta();
    void Debug();
    const char* Acao(TProcuraConstrutiva* suc);
    bool Acao(const char* acao);
    void TesteManual(const char* nome);
    void Codifica(uint64_t estado[OBJETO_HASHTABLE]);
    int Heuristica();
    void ResetParametros();

private:
    int Indice(int i, int j) { return i * N + j; }
    bool ValidaPosicao(int pos, bool isGato);
    bool AdjacenteDiferente(int pos, bool isGato);
    bool NaZonaCentral(int pos);
};