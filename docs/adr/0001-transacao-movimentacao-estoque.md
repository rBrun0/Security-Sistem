# ADR-0001: Aplicar movimentação de estoque de forma transacional

- Status: Aceito
- Data: 2026-02-28
- Decisores: Time SGS-PRO
- Contexto relacionado: módulo controle de EPIs/estoque

## Contexto

O módulo de estoque de EPIs exigia consistência forte entre duas operações que, no modelo anterior, podiam ocorrer de forma separada:

1. alterar o saldo do EPI (`quantity`),
2. registrar o histórico em `epi_movements`.

Quando essas operações não são atômicas, surgem riscos de inconsistência (saldo sem histórico ou histórico sem saldo), especialmente sob falhas intermediárias e concorrência.

Além disso, regras de negócio de transferência (merge/split) e validações de origem/destino estavam espalhadas no front, dificultando manutenção e escalabilidade.

## Decisão

Centralizar a aplicação de movimentações no serviço `applyEPIMovement`, implementado com transação Firestore (`runTransaction`), incluindo:

- validações de negócio para `entrada`, `saida` e `transferencia`;
- atualização de saldo no(s) EPI(s) impactado(s);
- registro da movimentação em `epi_movements` na mesma transação;
- retorno de erro de domínio padronizado (`StockMovementError`) para feedback no front.

Também decidimos que novos fluxos que alterem saldo devem usar esse caminho transacional.

## Alternativas consideradas

### A) Manter lógica no front com múltiplas mutações

- Prós:
  - implementação rápida no curto prazo.
- Contras:
  - alto risco de inconsistência;
  - duplicação de regras de negócio em telas diferentes;
  - maior chance de regressão em evolução futura.

### B) Usar atualização simples em serviço sem transação

- Prós:
  - simplifica código inicial.
- Contras:
  - não garante atomicidade entre saldo e histórico;
  - vulnerável a condições de corrida.

### C) Decisão adotada: transação centralizada no serviço

- Prós:
  - consistência transacional;
  - regras de negócio centralizadas;
  - melhor base para escalar o domínio.
- Contras:
  - serviço mais complexo;
  - exige disciplina para não criar “atalhos” fora do serviço.

## Consequências

### Positivas

- Redução do risco de divergência entre saldo e histórico.
- Regras de negócio com ponto único de manutenção.
- Fluxos de movimentação, entrega e reposição mais previsíveis.

### Negativas / Trade-offs

- Complexidade maior no módulo de serviço.
- Dependência de cobertura documental e revisão de PR para manter padrão.

## Plano de adoção

- [x] Implementar `applyEPIMovement` no módulo de movimentações.
- [x] Expor hook `useApplyEPIMovement` com invalidação de cache relevante.
- [x] Migrar tela de movimentações para o fluxo transacional.
- [x] Migrar entregas para usar saída transacional.
- [x] Ajustar importação de estoque para reposição transacional.
- [ ] Introduzir `operationId` para idempotência em retries/import.

## Critérios de revisão futura

Revisar esta decisão quando:

- houver necessidade de processamento em lote com throughput maior;
- surgirem requisitos de auditoria mais detalhada por usuário/tenant;
- o modelo evoluir para separar catálogo de EPI e saldo por localização (`EPIStock`).

## Histórico

- 2026-02-28: ADR criada e aceita.
