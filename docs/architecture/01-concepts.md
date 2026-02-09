# Conceitos Centrais - WorkOps + Delivery

Este documento define os conceitos fundamentais da plataforma.

## Entidades Principais

### App (Aplicação)
Unidade lógica de negócio. Um App agrupa serviços e recursos que trabalham juntos para entregar uma funcionalidade. É a fronteira de deploy e versionamento.
- **Composição:** 1 ou mais Serviços + 0 ou mais Resources.

### Service (Serviço)
Unidade computacional executável.
- **Tipos:**
  - `web`: Frontend ou aplicação que serve HTML (porta pública exposta).
  - `api`: Backend HTTP/gRPC (porta pública ou interna exposta).
  - `worker`: Processamento assíncrono (consumidor de fila), sem porta exposta.
  - `cron`: Job agendado recorrente (execução efêmera).
  - `internal`: Serviço auxiliar acessível apenas dentro do App (ex: sidecar).

### Resource (Recurso)
Infraestrutura necessária para o App funcionar, com estado persistente ou efêmero.
- **Tipos:**
  - `db`: Banco de dados relacional (Postgres, MySQL, SQL Server).
  - `cache`: Armazenamento em memória (Redis).
  - `queue`: Sistema de filas (opcional, ex: RabbitMQ, SQS).
- **Modos:**
  - `local-container`: Container efêmero para desenvolvimento.
  - `managed/external`: Link para serviço gerenciado (RDS, ElastiCache) em ambientes produtivos.

### Environment (Ambiente)
Contexto isolado de execução com configurações específicas.
- **Padrões:** `dev` (desenvolvimento), `hml` (homologação/staging), `prod` (produção).
- **Propriedades:** Segredos, Variáveis de Ambiente, Domínios, Histórico de Deploys.

### Release (Versão de Entrega)
Um snapshot imutável de um App pronto para ser implantado.
- **Vínculos:**
  - Commit SHA (código fonte).
  - Imagem Docker (artefato buildado).
  - Configuração do App Spec no momento do release.
  - Lista de Work Items incluídos.

### Work Item (Item de Trabalho)
Unidade de valor ou correção entregue.
- **Tipos:** `feature` (nova funcionalidade), `bug` (correção), `chore` (tarefa técnica), `incident` (problema em produção).
- **Status:** Acompanha o ciclo de vida (ex: `todo`, `in_progress`, `deployed_dev`, `deployed_prod`).
- **Rastreabilidade:** Conecta o planejamento (Jira/Linear) à entrega (Release).

### Secret (Segredo)
Informação sensível (senhas, chaves de API) criptografada e injetada em tempo de execução.
- Escopo: Por App e Por Ambiente. Nunca armazenado em texto plano no repositório.

### Event (Evento)
Registro de auditoria e observabilidade de alto nível.
- Exemplos: "Deploy iniciado", "Rollback executado", "Health check falhou", "Secret atualizado".
- Contexto: Sempre associado a um Release e Ambiente.

### Incident (Incidente)
Um tipo especial de Work Item ou Evento crítico que bloqueia releases ou exige hotfix imediato.
