@echo off

set EMSDK_PATH=C:\UAb\git\emsdk
call "%EMSDK_PATH%\emsdk_env.bat"

REM ----------------------------------------------------------------
REM Compila o c�digo com otimiza��o e gera��o de WebAssembly
REM A flag -O3 ativa otimiza��es, -O0 para incluir informa��o de debug
REM A op��o -s WASM=1 gera o .wasm; o EXPORTED_FUNCTIONS indica quais fun��es exportar
REM EXTRA_EXPORTED_RUNTIME_METHODS inclui m�todos �teis, como cwrap e ccall.
REM Certifique-se de usar as aspas corretas para o seu shell.
REM ----------------------------------------------------------------

emcc -O3 -s WASM=1 -s ALLOW_MEMORY_GROWTH=1 ^
-s EXPORTED_FUNCTIONS="['_Inicializar','_ExecutarLance','_Parametros','_SetParametro','_GetParametro','_Executar','_malloc','_free']" ^
-s EXPORTED_RUNTIME_METHODS="['ccall', 'cwrap', 'UTF8ToString', 'getValue']" ^
-o gatoscaes.js gatoscaes_em.cpp


pause
