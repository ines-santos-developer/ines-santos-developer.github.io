// ProcuraEngine.cpp : Defines the entry point for the console application.
//

#include <stdio.h>
#include <locale>

#include "GatosCaes.h"

int main(int argc, char* argv[])
{
	CGatosCaes gatosCaes;

	std::locale::global(std::locale(""));

	gatosCaes.TesteManual("Jogo dos Gatos e Caes");
}
