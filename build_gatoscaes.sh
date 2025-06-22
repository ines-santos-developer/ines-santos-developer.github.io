#!/bin/bash
# Build Nex para WebAssembly utilizando emcc.
# Certifique-se de ter o Emscripten SDK instalado e o ambiente configurado.
# Se ainda n�o instalou, siga as instru��es em: https://emscripten.org/docs/getting_started/downloads.html

# Verifica se o emcc est� instalado
if ! command -v emcc &> /dev/null; then
    echo "Erro: 'emcc' n�o encontrado. Instale o Emscripten SDK e execute 'source /caminho/para/emsdk_env.sh'."
    exit 1
fi

echo "Compilando GatosCaes para WebAssembly..."

emcc -O3 -s WASM=1 -s ALLOW_MEMORY_GROWTH=1 \
-s EXPORTED_FUNCTIONS="['_Inicializar','_ExecutarLance','_Parametros','_SetParametro','_GetParametro','_Executar','_malloc','_free']" \
-s EXPORTED_RUNTIME_METHODS="['ccall', 'cwrap', 'UTF8ToString', 'getValue']" \
-o gatoscaes.js gatoscaes_em.cpp

if [ $? -eq 0 ]; then
    echo "Compila��o conclu�da com sucesso."
else
    echo "Falha na compila��o."
fi
