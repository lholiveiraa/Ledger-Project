# WorkOps Platform (v2 - Control Plane)

Plataforma de WorkOps e Delivery com Control Plane centralizado, suportando ambientes (dev/hml/prod), releases versionados e deploy multi-cloud (simulado via GCP Cloud Run).

## Estrutura Atualizada
- **Control Plane (`control-plane/`)**: API central e Banco de Dados (SQLite) que gerencia o estado do sistema.
- **CLI (`cli/`)**: Ferramenta de linha de comando atualizada para interagir com o Control Plane (`release`, `deploy`).
- **UI (`ui/`)**: Dashboard Web (NexusFlow Template) para visualização de Apps, Environments e Releases.
- **Agent (`agent/`)**: Daemon local para execução de containers (mantido da v1).
- **Spec (`spec/`)**: Definições do App Spec v1.

## Pré-requisitos
- Go 1.21+
- Docker
- Node.js 18+

## Funcionalidades
- **WorkOps Flow**: Gestão de itens de trabalho (Feature, Bug, Chore, Incident) integrada ao ciclo de release.
- **Multi-Cloud**: Suporte a GCP Cloud Run, Azure Container Apps e AWS App Runner (via interface Provider unificada).
- **Secrets Management**: Gestão de segredos por ambiente com suporte a referências externas (Secret Manager/Key Vault) e mascaramento.
- **Governança**: Logs de auditoria para deploys e alterações de segredos; suporte a ambientes restritos.
- **Control Plane**: API REST centralizada com persistência em SQLite (local) ou PostgreSQL (prod).

## Como Rodar

### 1. Buildar os Binários
```bash
go mod tidy
go build -o cp.exe ./control-plane
go build -o workops.exe ./cli
```

### 2. Iniciar a Plataforma
Você precisará de 3 terminais:

**Terminal 1 (Control Plane):**
```bash
./cp.exe
# Roda em http://localhost:8081
# Cria workops.db com dados de exemplo (Seed)
```

**Terminal 2 (UI):**
```bash
cd ui
npm install
npm run dev
# Acessível em http://localhost:5173
```

**Terminal 3 (CLI & Uso):**

### Guia de Uso (Cheat Sheet)

#### 1. Gestão de Trabalho (WorkOps)
```bash
# Criar um item de trabalho
./workops.exe work create "Implementar Login" --type feature

# Listar itens
./workops.exe work list

# Criar uma Release (registra versão)
./workops.exe release create v1.0.0

# Vincular trabalho à release
./workops.exe work link <work_item_id> <release_id>
```

#### 2. Deploy & Multi-Cloud
```bash
# Deploy para DEV (Local/Container)
./workops.exe deploy dev <release_id>

# Promoção para HML (GCP Cloud Run)
./workops.exe deploy hml <release_id>
# Nota: O provider GCP injeta segredos automaticamente
```

#### 3. Gestão de Secrets
```bash
# Listar segredos (valores mascarados)
./workops.exe secrets get <env_id>

# Definir um segredo simples
./workops.exe secrets set <env_id> API_KEY=12345

# Importar de arquivo .env
./workops.exe secrets import <env_id> .env

# Linkar segredo externo (Cloud Secret Manager / Key Vault)
./workops.exe secrets link <env_id> DB_PASS projects/my-proj/secrets/db-pass
```

### Arquitetura
- **Control Plane**: Go + GORM + SQLite/Postgres.
- **UI**: React + Vite + Tailwind (NexusFlow).
- **Providers**:
  - **GCP**: Cloud Run + Secret Manager.
  - **Azure**: Container Apps + Key Vault (esqueleto).
  - **AWS**: App Runner + Secrets Manager (esqueleto).
