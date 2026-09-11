# AGENTS.md — Regras do Projeto

## 1. Objetivo

Este projeto é um **e-commerce**.

Este arquivo define as regras obrigatórias para qualquer alteração realizada por
Claude Code, ChatGPT/Codex ou outro agente de IA.

O objetivo é:

- alterar somente o necessário;
- preservar o que já funciona;
- evitar alterações inesperadas;
- manter o padrão existente do projeto;
- reduzir riscos de regressão;
- facilitar revisão e manutenção.

---

# 2. REGRA PRINCIPAL

> **Se não foi solicitado e não é necessário para realizar a tarefa, NÃO ALTERE.**

O agente deve sempre preferir:

**menor alteração → menor risco → maior previsibilidade.**

Não confundir:

> "resolver o problema"

com:

> "melhorar o projeto inteiro".

---

# 3. MODO PADRÃO — CIRÚRGICO

Todas as tarefas devem começar em **MODO CIRÚRGICO**.

Neste modo:

- altere somente o necessário;
- preserve o código existente;
- preserve as regras de negócio;
- preserve APIs;
- preserve banco de dados;
- preserve componentes não relacionados;
- preserve estilos não relacionados;
- reutilize implementações existentes quando possível.

### Não fazer sem autorização

- refatoração;
- reorganização de arquitetura;
- troca de biblioteca;
- atualização de dependências;
- alteração de banco;
- alteração de endpoints;
- alteração de contratos;
- renomeações;
- remoção de código;
- mudanças em outras funcionalidades;
- alterações visuais não relacionadas;
- criação de abstrações apenas por preferência.

### Regra do menor diff

Se a solução puder ser feita em 1 arquivo, não altere 3.

Se puder ser feita em 10 linhas, não reescreva o componente inteiro.

---

# 4. OUTROS MODOS

## MODO CONTROLADO

Somente quando solicitado.

Permite pequenas melhorias diretamente relacionadas à tarefa.

Ainda não permite:

- mudanças arquiteturais;
- troca de tecnologia;
- alteração de contratos;
- alteração de banco sem autorização;
- alteração de funcionalidades não relacionadas.

---

## MODO REFATORAÇÃO

Somente quando o usuário autorizar explicitamente.

Exemplos:

- "pode refatorar";
- "pode melhorar a arquitetura";
- "pode reorganizar";
- "pode limpar esse código".

Mesmo nesse modo, alterações em:

- banco;
- API pública;
- autenticação;
- pagamentos;
- infraestrutura;

devem ser tratadas como mudanças críticas.

---

# 5. ANTES DE ALTERAR

Antes de editar código:

1. encontre a implementação correta;
2. leia o contexto necessário;
3. entenda o comportamento atual;
4. procure onde o código é utilizado;
5. identifique dependências;
6. determine os arquivos mínimos necessários;
7. escolha a solução de menor impacto.

Não altere código baseado apenas em um trecho isolado.

---

# 6. QUANDO HOUVER DÚVIDA

Se existir uma interpretação clara e de baixo risco, siga a interpretação mais conservadora.

Se existirem duas interpretações que possam produzir comportamentos diferentes:

**não escolha arbitrariamente.**

Informe:

```text
Interpretação A:
...

Interpretação B:
...

Recomendação:
...

E peça confirmação quando necessário.

7. REGRA DE PARADA

O agente deve parar antes de alterar algo fora do escopo quando a alteração não for claramente necessária.

Exemplos:

precisa alterar outro módulo;
precisa alterar banco;
precisa alterar endpoint;
precisa alterar o DTO;
precisa alterar autenticação;
precisa trocar biblioteca;
precisa alterar configuração global;
precisa alterar arquitetura.

Relatório:

Arquivo:
...

Motivo:
...

Impacto:
...

Alternativa:
...

Não tome decisões estruturais sozinho.

8. NÃO INVENTAR

Nunca assumir que algo existe.

Não inventar:

pontos finais;
métodos;
componentes;
ganchos;
serviços;
DTOs;
entidades;
campos;
tabelas;
colunas;
regras de negócio;
configurações;
variáveis de ambiente.

Antes de criar algo novo, procure se já existe uma implementação equivalente.

9. FRONTEND / REACT

Preservar o padrão existente do projeto.

Não alterar sem necessidade:

componentes;
adereços;
ganchos;
lojas;
contexto;
rotas;
estado;
chamadas da API;
estilos;
responsividade;
comportamento das telas.

Não trocar automaticamente:

Vento favorável;
Doença;
Consulta React;
Bibliotecas de interface do usuário;
bibliotecas de ícones;
componentes existentes;

por preferência pessoal.

10. COMÉRCIO ELETRÔNICO

As seguintes áreas devem ser consideradas críticas:

produtos;
categorias;
preços;
promoções;
cupons;
estoque;
carrinho;
favoritos;
Confira;
pedidos;
pagamentos;
clientes;
endereços;
autenticação;
recuperação de cadastro;
avaliações;
frete;
notificações.

Uma alteração em qualquer uma dessas áreas pode afetar diretamente vendas.

Por isso, preserve as regras de negócio existentes.

11. PREÇOS, PROMOÇÕES E PEDIDOS

Não alterar regras de:

preço;
desconto;
cupom;
frete;
quantidade;
estoque;
pedido;
pagamento;

sem verificar primeiro onde essas regras são utilizadas.

Não assumir como uma regra deve funcionar.

Se o comportamento atual estiver diferente do esperado, informe.

12. API / BACKEND

Não alterar sem necessidade:

pontos finais;
rotas;
Métodos HTTP;
DTOs;
respostas;
autenticação;
autorização;
JWT;
regras de negócio;
Códigos HTTP.

Antes de alterar um contrato:

procure seus consumidores;
verifique o frontend;
verifique outros serviços;
avalie compatibilidade;
relatório ou impacto.
13. BANCO DE DADOS

Banco de dados é área crítica.

Não alterar automaticamente:

tabelas;
colunas;
tipos;
relacionamentos;
índices;
restrições;
migrações;
dados existentes.

Se uma alteração de código exigir alteração no banco:

pare e informe antes.

Não criar migration apenas porque parece conveniente.

14. AUTENTICAÇÃO E CADASTRO

Tratar como área crítica:

Conecte-se;
cadastro;
confirmação de e-mail;
recuperação de senha;
JWT;
token de atualização;
sessões;
etapas de cadastro;
dados do cliente.

Não alterar o fluxo de autenticação para resolver problemas não relacionados.

15. PAGAMENTOS

Pagamentos são considerados área de alto risco.

Não alterar sem análise:

integração de pagamento;
criação de pagamento;
confirmação;
webhooks;
status;
valores;
descontos;
pedidos.

Nunca alterar valores financeiros apenas por interpretação.

16. IMAGENS E ARQUIVOS

Preservar o padrão existente para:

imagens de produtos;
banners;
avaliações;
uploads;
caminhos;
nomes de arquivos.

Não mudar a estrutura de armazenamento sem necessidade.

17. DEPENDÊNCIAS

Não instalar, remover ou atualizar dependências sem necessidade.

Antes de adicionar uma biblioteca:

verificar se o projeto já possui solução;
verificar se é possível reutilizar código existente;
avaliar impacto.

Se uma dependência for realmente necessária, informar:

Dependência:
...

Motivo:
...

Impacto:
...
18. CONFIGURAÇÕES E PRODUÇÃO

Não alterar automaticamente:

.env;
segredos;
URLs;
banco de produção;
SMTP;
domínio;
hospedagem;
configurações de deploy;
certificados;
variáveis de ambiente.

Nunca expor:

senhas;
fichas;
chaves privadas;
credenciais.
19. NÃO CORRIGIR OUTRAS COISAS

Se encontrar outro problema durante a tarefa:

não corrija automaticamente.

Relatório:

Encontrei outro problema que parece não estar relacionado
à tarefa. Não alterei.

Problema:
...
20. NÃO "LIMPAR" O CÓDIGO

Não remover automaticamente:

código aparentemente não utilizado;
funções;
variáveis;
comentários;
estilos;
importações;
métodos;
componentes.

Não assumir que algo não utilizado diretamente está realmente sem uso.

21. NÃO ALTERAR O VISUAL SEM PEDIDO

Se a tarefa for funcional:

não alterar automaticamente:

núcleos;
fontes;
espaçamentos;
ícones;
layout;
animações;
responsividade.

Se a tarefa for visual:

alterar somente a área solicitada.

Preservar a identidade visual existente do e-commerce.

22. GIT E ALTERAÇÕES EXISTENTES

Preservar alterações já realizadas pelo usuário.

Nunca executar sem autorização:

git reset --hard;
remoção de alterações locais;
reescrita de histórico;
limpeza destrutiva.

Não sobrescrever trabalho existente.

23. VALIDAÇÃO

Depois da mudança, verifique o que for possível:

Front-end
TypeScript;
importações;
adereços;
ganchos;
referências;
construir.
Backend
compilação;
namespaces;
DE;
DTOs;
referências;
EF Core.
Integrações
pontos finais;
cargas úteis;
respostas;
autenticação.

Não dizer que algo "está funcionando" sem ter validado.

Diferenciar:

compilou;
build passou;
teste passou;
fluxo foi validado.
24. RELATÓRIO FINAL

Ao finalizar, informar:

Arquivos alterados
arquivo
arquivo
Alterações
alteração 1;
alteração 2.
Preservado
funcionalidade X;
API Y;
Banco Z.
Validação
TypeScript: OK / não executado
Build: OK / não executado
Testes: OK / não executados
Observações

Somente problemas relevantes encontrados.

25. LISTA DE VERIFICAÇÃO FINAL

Antes de terminarmos:

 Alterei somente o necessário?
 Evitei refatoração não solicitada?
 Mantive o comportamento existente?
 Mantive os contratos?
 Não alterei banco sem autorização?
 Não alterei dependências sem necessidade?
 Não alterei outras funcionalidades?
 Não inventei estruturas?
 Preservei alterações existentes do usuário?
 Revisei os arquivos alterados?
 Validei a alteração?
 Informei todos os arquivos modificados?

Se alguma resposta for não, revisar antes de finalizar.

26. REGRA DE OURO

Faça exatamente o que foi pedido.

Não faça o que não foi pedido.

Se não for necessário, não altere.

Se houver risco, explique antes.

Preserve o que já funciona.

Prefira sempre a menor alteração possível.


### O que eu mudei em relação ao seu arquivo

Eu **não simplesmente cortei linhas**. Eu removi várias repetições e agrupei as regras.

Por exemplo, seu arquivo atual fala várias vezes sobre:

- menor diff;
- não refatorar;
- não alterar fora do escopo;
- preservar comportamento;
- não inventar;
- parar quando sair do escopo.

Essas ideias são importantes, mas estavam espalhadas por muitas seções. O novo documento transforma isso em **uma regra central + regras específicas**.

Também acrescentei algo que acho importante para esse projeto: **regras próprias de e-commerce**, principalmente **preço, promoção, estoque, pedidos, checkout, pagamento, cadastro e autenticação**. Isso é mais útil para o projeto do site do que ter dezenas de regras genéricas.

E eu **não colocaria ainda uma lista fixa de arquivos críticos**, porque precisamos identificar quais são realmente críticos no projeto atual. No arquivo que você mandou havia inclusive um exemplo de caminho que parece ter sido colocado provisoriamente, então é melhor não deixar isso como regra definitiva. :contentReference[oaicite:2]{index=2}

**Essa versão eu considero bem melhor como `AGENTS.md`: menor, menos repetitiva e mais específica para o seu