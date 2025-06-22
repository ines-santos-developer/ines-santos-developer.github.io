# TProcuraAdversa

[![GitHub issues](https://img.shields.io/github/issues/jcoelho72/TProcuraAdversa.svg)](https://github.com/jcoelho72/TProcuraAdversa/issues)
[![GitHub forks](https://img.shields.io/github/forks/jcoelho72/TProcuraAdversa.svg)](https://github.com/jcoelho72/TProcuraAdversa/network)
[![GitHub stars](https://img.shields.io/github/stars/jcoelho72/TProcuraAdversa.svg)](https://github.com/jcoelho72/TProcuraAdversa/stargazers)
[![GitHub license](https://img.shields.io/github/license/jcoelho72/TProcuraAdversa.svg)](https://jcoelho72.github.io/TProcuraAdversa/LICENSE.txt)

Uma coleção de algoritmos e implementações para **procuras adversas**.

A documentação completa está disponível em:  
👉 [TProcuraAdversa - Documentação](https://jcoelho72.github.io/TProcuraAdversa/index.html)
👉 [TProcuraConstrutiva - Documentação](https://jcoelho72.github.io/TProcuraConstrutiva/index.html)

## Sumário

- [Sobre o Projeto](#s1)
- [Estado do Projeto](#s2)
- [Funcionalidades](#s3)
- [Instalação](#s4)
- [Uso](#s5)
- [Exemplos](#s6)
- [Licença](#s7)

\anchor s1
## Sobre o Projeto

Uma coleção de algoritmos e implementações para [procuras adversas](#), 
criada como ponto de partida para a implementação de novos jogos e estratégias de procura. 
Esse repositório serve como base para explorar e desenvolver soluções em problemas de múltiplos agentes.

Recursos utilizados na UC de [Introdução à Inteligência Artificial](https://guiadoscursos.uab.pt/ucs/introducao-a-inteligencia-artificial/), 
da [Licenciatura em Engenharia Informática](https://guiadoscursos.uab.pt/ucs/introducao-a-inteligencia-artificial/) da [Universidade Aberta](https://portal.uab.pt/)

Bibliografia da UC, e base teórica para o projeto: 
Russell, S. J., & Norvig, P. (2021). Artificial Intelligence: A Modern Approach (4th ed.). Pearson.

\anchor s2
## Estado do Projeto

> :warning: Este projeto ainda está em desenvolvimento.  
> Atualizações frequentes e melhorias estão sendo implementadas.

\anchor s3
## Funcionalidades

- Implementação de algoritmos de procura adversa na superclasse.
- Exploração do espaço de estados de forma manual
- Execução de Minimax, com ou sem cortes alfa/beta, com ou sem versão iterativa
- Utilização de estados já explorados.

\anchor s4
## Instalação e Execução

Clonar o projeto, compilar e executar. 

### Opção 1 - Clonar o Repositório 

```bash
git clone https://github.com/jcoelho72/TProcuraAdversa.git
```
ou

Aceder a [página do repositório](https://github.com/jcoelho72/TProcuraAdversa/) e clique em **"Code" → "Open with Visual Studio"**.

### Opção 2 - Download Manual

Aceder a [página do repositório](https://github.com/jcoelho72/TProcuraAdversa/) e clique em **"Code" → "Download ZIP"**.

Extraia os arquivos. Em seguida, aceda ao [repositório TProcuraConstrutiva](https://github.com/jcoelho72/TProcuraConstrutiva/) e clique em **"Code" → "Download ZIP"**.

Extraia os arquivos do TProcuraConstrutiva para uma subpasta dentro do diretório extraído do TProcuraAdversa, 
de forma que os arquivos do submódulo fiquem acessíveis para a compilação.

Siga as instruções de compilação disponíveis (por exemplo, via Makefile, Visual Studio etc., conforme o seu ambiente).


### Opção 3 - Utilizar como Submódulo

Para integrar o TProcuraAdversa como parte de outro projeto, utilize um submódulo:

```bash
git submodule add https://github.com/jcoelho72/TProcuraAdversa.git
```
Essa opção é útil se pretender manter o código atualizado.

Teste a classe com problemas implementados. 

\anchor s5
## Uso

Para implementar um novo problema utilizando o TProcuraAdversa, pode:
- redefinir a superclasse TProcuraAdversa de raiz;
- readaptar um problema similar.

### Redefinição Mandatória

A redefinição mandatória de métodos de TProcuraConstrutiva mantém-se: 

Ao redefinir a superclasse, é essencial que sejam implementados os seguintes métodos: 
- Duplicar(): Cria um objecto que é uma cópia deste.
- Copiar(): Fica com uma cópia do objecto.
- SolucaoVazia(): Coloca o objecto no estado inicial da procura.
- Sucessores(): Coloca em sucessores a lista de estados sucessores.
- SolucaoCompleta(): Verifica se o estado actual é objectivo (é uma solução completa)
- TesteManual(): Inicializa a interação com o utilizador.

[Documentação dos métodos de Redefinição Mandatória](https://jcoelho72.github.io/TProcuraConstrutiva/group__RedefinicaoMandatoria.html):

..(identificar )..


\anchor s6
## Exemplos

Alguns problemas estão implementados para demonstrar o funcionamento da classe TProcuraConstrutiva:
1. [Jogo do Galo](teste_jogo_do_galo.html)
2. [Jogo Em Linha](teste_jogo_em_linha.html)

Esses exemplos servem tanto para testar o repositório quanto para servir de base para novas implementações.

\anchor s7
## Licença
Distribuído sob a licença MIT. Veja o arquivo [LICENSE](https://jcoelho72.github.io/TProcuraAdversa/LICENSE.txt) para mais informações.

