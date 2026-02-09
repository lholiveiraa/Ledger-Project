# Relações e Invariantes

Este documento define como as entidades interagem e as regras imutáveis do sistema.

## Relações Principais

### App vs Componentes
- Um **App** POSSUI N **Services**.
- Um **App** POSSUI N **Resources**.
- **Services** podem depender de **Resources** (ex: API depende de DB) ou de outros **Services** (ex: Frontend depende de API).

### Release vs Work Items
- Um **Release** AGREGA N **Work Items**.
- Um **Work Item** pode estar associado a M **Releases** (embora idealmente a apenas um por ambiente num dado momento, pode "viajar" entre releases até ser concluído).
- A relação define o "O Quê" está sendo entregue.

### Environment vs Deploy
- Um **Deploy** é a materialização de um **Release** em um **Environment**.
- Um **Environment** contém a configuração específica (vars, secrets) aplicada ao **Release**.

## Invariantes (Regras Rígidas)

1. **Imutabilidade do Release**
   - Uma vez criado, um Release (artefato + spec) NUNCA muda.
   - Configurações de ambiente mudam, o Release não.
   - Correções exigem um novo Release (Roll-forward) ou volta a um anterior (Rollback).

2. **Persistência de Resources**
   - Um Release **NÃO** recria Resources persistentes (DB, Storage).
   - Resources são provisionados/migrados de forma idempotente, mas seus dados sobrevivem a destruição dos serviços.
   - `drop database` é proibido em operações automáticas de release.

3. **Fluxo de Promoção**
   - Um Work Item não pode estar com status `deployed_prod` sem haver um Release ativo em Prod que o contenha.
   - A promoção de artefatos segue preferencialmente o fluxo: Build -> Dev -> Hml -> Prod.
   - Em caso de hotfix, o fluxo pode ser acelerado, mas nunca ignora a criação de um Release.

4. **Segurança de Secrets**
   - Secrets NUNCA são commitados no repositório (Git).
   - Secrets são injetados apenas no momento do deploy/execução pelo Control Plane/Agent.
   - Desenvolvedores não devem ter acesso de leitura a secrets de Prod (apenas escrita/update cego ou via admin).

5. **Observabilidade Vinculada**
   - Todo log, métrica ou evento deve conter metadados do `release_id` e `environment`.
   - É proibido "log solto" sem contexto de origem.

6. **Isolamento de Ambientes**
   - O ambiente de `prod` nunca deve acessar recursos de `dev` ou `hml`.
   - Dados de `prod` não devem vazar para ambientes inferiores sem anonimização (sanitização).
