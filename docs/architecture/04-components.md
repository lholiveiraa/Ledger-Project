# Arquitetura por Componentes

A plataforma é composta por 4 componentes principais que interagem entre si.

## 1. CLI (Command Line Interface)
Ponto de entrada para desenvolvedores.
- **Funções:**
  - `workops init`: Cria o `app.yaml` inicial.
  - `workops up`: Sobe o ambiente local (Dev) usando Docker localmente.
  - `workops release create`: Cria um novo release a partir do diretório atual.
  - `workops deploy <env> <release-id>`: Promove um release para um ambiente.
  - `workops logs`: Stream de logs.
- **Interação:** Fala diretamente com o Docker local (ambiente Dev) ou com a API do Control Plane (ambientes remotos).

## 2. Agent (Local & Remote Runner)
O executor de tarefas.
- **Local (Dev):** Embutido na CLI ou rodando como daemon na máquina do dev. Gerencia containers Docker locais.
- **Remoto (Cluster):** Roda dentro dos servidores/clusters de HML/Prod.
- **Responsabilidades:**
  - Baixar imagens/artefatos.
  - Aplicar configurações (Environment Variables, Secrets).
  - Executar healthchecks locais.
  - Reportar status e logs para o Control Plane.
  - Gerenciar ciclo de vida dos processos (start/stop/restart).

## 3. Control Plane (API Central)
O cérebro da plataforma.
- **Funções:**
  - **Catálogo:** Armazena definições de Apps, Releases e Environments.
  - **Orquestrador:** Recebe comandos de deploy e instrui os Agents remotos.
  - **Secret Store:** Gerencia chaves de criptografia e acesso a secrets.
  - **Observability Hub:** Agrega status, eventos e metadados de logs enviados pelos Agents.
- **Database:** Postgres para metadados relacionais.

## 4. UI (Web Dashboard)
Interface visual para gestão e observabilidade.
- **Visões:**
  - **Pipeline:** Visualização do fluxo de releases (Dev -> Hml -> Prod).
  - **Environment Status:** Saúde dos serviços e recursos em tempo real.
  - **Release Detail:** Changelog, Work Items incluídos, diff de configuração.
  - **Audit Log:** Quem fez o quê e quando.
- **Tecnologia:** SPA (React/Vue) consumindo a API do Control Plane.

## Diagrama de Fluxo (Simplificado)

1. **Dev** commit code -> CI cria Docker Image.
2. **Dev** usa CLI/CI: `workops release create`. Control Plane registra Release.
3. **Dev** usa CLI/UI: `workops deploy hml`.
4. **Control Plane** notifica **Agent HML**.
5. **Agent HML** baixa imagem, injeta secrets, sobe containers.
6. **Agent HML** reporta "Healthy".
7. **UI** atualiza status para verde.
