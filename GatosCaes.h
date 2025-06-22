#pragma once
#include "TProcuraAdversa/TProcuraAdversa.h"

enum EParametrosGatos { heurGatos = parametrosAdversas };

class CGatosCaes : public TProcuraAdversa {
public:
    CGatosCaes(void);
    ~CGatosCaes(void);

    // Utiliza��o de inteiros de 64 bits para representar o estado do tabuleiro
    uint64_t gatos; // bits a 1 representam pe�as de gatos
    uint64_t caes;  // bits a 1 representam pe�as de c�es
    int jogadas;

    // vari�veis da inst�ncia
    static int N; // dimens�o do tabuleiro: 4,6,8

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