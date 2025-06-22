@echo off
echo Atualizando submódulos...
git submodule update --remote 
git add TProcuraConstrutiva
git commit -m "Atualização automática do submódulo TProcuraConstrutiva"
git push
echo Submódulo atualizado com sucesso!

