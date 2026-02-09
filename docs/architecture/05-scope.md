# Limites do Escopo (O que NÃO fazer)

Para garantir o foco na experiência de entrega e operação ("WorkOps"), definimos explicitamente o que está fora do escopo inicial da plataforma.

## 1. Não é um Project Management Tool Completo (Jira/Linear)
- **Escopo:** A plataforma gerencia "Work Items" apenas como referência (link, título, status básico).
- **Fora do Escopo:** Quadros Kanban complexos, gestão de sprints, relatórios de velocidade, comentários em tickets.
- **Integração:** A plataforma deve integrar com ferramentas existentes (Jira, Linear, GitHub Issues) para sincronizar status, não substituí-las.

## 2. Não é um Orquestrador de Containers Genérico (Kubernetes)
- **Escopo:** A plataforma abstrai a execução. Pode usar Docker/K8s por baixo, mas não expõe primitivas complexas (Pods, Ingress, PVs) diretamente ao usuário final no `app.yaml`.
- **Fora do Escopo:** Service Mesh customizável pelo usuário, CRDs arbitrários, gestão de nós do cluster.
- **Foco:** PaaS opinionado (Platform as a Service), não IaaS/CaaS.

## 3. Não é uma Ferramenta de Monitoramento Profundo (Datadog/New Relic/Prometheus)
- **Escopo:** Observabilidade orientada a Release (logs de deploy, health checks básicos, métricas RED - Rate, Errors, Duration - de alto nível).
- **Fora do Escopo:** APM detalhado (tracing de código linha a linha), profiling de memória, gestão de alertas complexos de infraestrutura.
- **Integração:** Deve permitir exportar métricas para ferramentas dedicadas.

## 4. Não é um Provisionador de Infraestrutura Cloud (Terraform)
- **Escopo:** Solicita recursos gerenciados (ex: "preciso de um Postgres") via interfaces padronizadas.
- **Fora do Escopo:** Gerenciar VPCs, Subnets, Peering, IAM Roles complexas da AWS/GCP/Azure.
- **Abordagem:** Assume que a infraestrutura base (rede, cluster, contas cloud) já foi provisionada previamente ou usa drivers simples para serviços gerenciados.

## 5. Não é um CI Build System (Jenkins/GitHub Actions)
- **Escopo:** Orquestra o *Deploy* e a *Promoção*.
- **Fora do Escopo:** Compilar código, rodar testes unitários, construir imagens Docker.
- **Fluxo:** O CI existente constrói a imagem e chama o `workops release create`. A plataforma assume a partir daí.
