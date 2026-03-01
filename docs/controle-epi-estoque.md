# Controle de EPIs e Estoque

## Objetivo

Padronizar o entendimento técnico e funcional do módulo de EPIs para que o time consiga evoluir o produto com segurança.

Este documento explica:

- como o saldo de estoque é calculado,
- quais regras de negócio são obrigatórias,
- onde cada responsabilidade está no código,
- e como escalar a arquitetura sem quebrar consistência.

## Decisões arquiteturais relacionadas

- ADR índice: [adr/README.md](adr/README.md)
- ADR da transação de movimentação: [adr/0001-transacao-movimentacao-estoque.md](adr/0001-transacao-movimentacao-estoque.md)

---

## Princípios do domínio

### 1) Movimentação é a fonte de verdade operacional

Toda alteração de saldo deve passar por movimentação (`entrada`, `saida`, `transferencia`).

Motivo:

- evita ajustes manuais não auditáveis,
- mantém histórico confiável,
- reduz divergência entre saldo e histórico.

### 2) EPI não deve ser recriado sem necessidade

Se o EPI já existe no mesmo estoque (mesma identidade), a reposição deve ser `entrada`, não novo cadastro.

Motivo:

- evita duplicidade,
- preserva histórico do item,
- simplifica conferência de estoque.

### 3) Operação de estoque precisa ser atômica

Aplicar saldo e registrar movimentação deve acontecer dentro da mesma transação.

Motivo:

- impede estados parciais (ex.: saldo alterado sem movimento, ou movimento sem saldo).

---

## Modelo conceitual

### Entidades

- `EPI`: item de estoque em um depósito/estoque central.
- `EPIMovement`: evento de movimentação (entrada, saída, transferência).

### Identidade do EPI

A identidade de negócio usada para evitar duplicidade por estoque é:

`centralWarehouseId + name + ca` (normalizados)

Implementação: `buildEPIIdentityKey` em `src/app/modules/epis/identity.ts`.

Observação:

- normalização remove acentos e diferenças de caixa para comparação estável.

---

## Regras de negócio implementadas

### Entrada (`entrada`)

- exige estoque de destino;
- não permite entrada para estoque diferente quando o EPI já está vinculado a outro estoque (nesse caso é transferência);
- soma quantidade ao saldo atual;
- registra movimentação com data e metadados.

### Saída (`saida`)

- exige estoque de origem;
- não permite saída acima do saldo;
- reduz saldo;
- registra movimentação.

### Transferência (`transferencia`)

- exige origem e destino;
- origem e destino não podem ser iguais;
- não permite transferência acima do saldo;
- se já existe EPI idêntico no destino: faz merge (soma no destino e reduz na origem);
- se transferência for total e não existir idêntico no destino: move o próprio registro para o destino;
- se transferência for parcial e não existir idêntico no destino: reduz origem e cria novo registro no destino;
- registra movimentação.

### Importação de planilha

- linhas de EPI importadas são comparadas por identidade no estoque atual;
- se existir, vira reposição (`entrada`);
- se não existir, cria EPI novo;
- mantém feedback de quantos foram criados x repostos.

---

## Arquitetura e responsabilidades

### Serviço transacional de movimentações

Arquivo: `src/app/modules/epi-movements/service.ts`

Responsável por:

- validar regras de negócio de movimentação,
- aplicar mudanças no(s) EPI(s),
- persistir o evento em `epi_movements`,
- garantir atomicidade com `runTransaction`.

Funções principais:

- `applyEPIMovement`: caminho recomendado para alterar saldo + histórico;
- `createEPIMovement`: legado para gravação simples de movimento (sem alterar saldo);
- `isStockMovementError`: type guard para feedback de erro de negócio no front.

### Hooks de integração

Arquivo: `src/app/modules/epi-movements/hooks.ts`

- `useApplyEPIMovement`: usa `applyEPIMovement` e invalida caches de movimento e EPI;
- `useCreateEPIMovement`: mantido por compatibilidade com fluxos legados.

### Identidade de EPI

Arquivo: `src/app/modules/epis/identity.ts`

- `buildEPIIdentityKey`: padroniza comparação de identidade de EPI por estoque.

### Telas já acopladas ao fluxo transacional

- `src/app/controledeepi/movimentacoes/content.tsx`
- `src/app/controledeepi/entregas/content.tsx`
- `src/app/controledeepi/estoques/formDialog.tsx` (reposição por import)

---

## Fluxos principais (alto nível)

### 1) Nova movimentação manual

1. Usuário abre modal em Movimentações.
2. Front valida campos básicos.
3. Front chama `useApplyEPIMovement`.
4. Serviço valida regra de negócio e aplica transação.
5. Query cache é invalidado e UI reflete saldo atualizado.

### 2) Entrega de EPI

1. Usuário cria entrega (documento de entrega).
2. Para cada item da entrega, front chama `useApplyEPIMovement` com `saida`.
3. Serviço reduz saldo e grava movimentação de saída.

### 3) Importação no estoque

1. Planilha é normalizada e validada.
2. Para item já existente por identidade: `entrada` transacional.
3. Para item novo: cria EPI.
4. Front mostra resumo de importação (criados/reposições).

---

## Convenções para desenvolvimento

- Qualquer novo fluxo que altere `quantity` deve usar `applyEPIMovement`.
- Evitar `updateEPI` direto para saldo, exceto manutenção pontual controlada.
- Erros de domínio devem ser propagados como `StockMovementError` para mensagens claras no front.
- Comparações de duplicidade devem usar `buildEPIIdentityKey`.

---

## Escalabilidade (próximos passos recomendados)

### Curto prazo

- Introduzir `operationId` nas movimentações para idempotência (retries/import em lote).
- Marcar `createEPIMovement` como legado em todos os pontos de uso.

### Médio prazo

- Criar serviço de aplicação em lote (`applyEPIMovementBatch`) para importações grandes.
- Adicionar logs de auditoria com contexto de usuário/ação.

### Longo prazo

- Separar `EPI` (catálogo) de `EPIStock` (saldo por estoque), caso o domínio passe a exigir multi-localidade avançada e rastreabilidade mais fina.

---

## Riscos e limites atuais

- Operações em lote ainda são sequenciais no front para alguns fluxos.
- Sem idempotência formal, retries de rede podem duplicar eventos em cenários extremos.
- Convém manter disciplina de uso do serviço transacional até consolidar lint/regra arquitetural.

---

## Checklist para PRs nesse domínio

- Altera saldo? → usar `applyEPIMovement`.
- Há possibilidade de duplicidade? → validar identidade por estoque.
- A regra de negócio foi tratada no serviço (não só no front)?
- Erro de negócio possui mensagem clara para o usuário?
- Cache de `epis` e `epi-movements` está sendo invalidado?
