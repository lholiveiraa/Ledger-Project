# App Spec v1 (YAML)

O arquivo `app.yaml` (ou `workops.yaml`) na raiz do repositório define a estrutura da aplicação.

## Estrutura

```yaml
version: "1.0"
name: "minha-plataforma-ecommerce"

# Definição dos Serviços (Workloads)
services:
  frontend:
    type: web
    build:
      context: ./frontend
      dockerfile: Dockerfile
    image: myregistry.com/frontend # Opcional se usar build
    ports:
      - 80:3000
    routes:
      - path: /
        strip_prefix: false
    env:
      API_URL: "${API_URL}" # Referência a variável ou outro serviço
    healthcheck:
      path: /health
      interval: 30s

  backend-api:
    type: api
    build:
      context: ./backend
    ports:
      - 8080:8080
    depends_on:
      - main-db
      - cache-redis
    env:
      DB_HOST: "${main-db.host}"
      DB_USER: "${main-db.user}"
      DB_PASS: "${secrets.DB_PASSWORD}" # Referência a secret
    resources:
      cpu: 500m
      memory: 1Gi

  worker-email:
    type: worker
    build:
      context: ./worker
    depends_on:
      - email-queue

# Definição dos Recursos (Infraestrutura)
resources:
  main-db:
    type: db
    engine: postgres
    version: "14"
    # Configuração específica por ambiente via overrides abaixo ou defaults aqui
  
  cache-redis:
    type: cache
    engine: redis
    version: "6"

  email-queue:
    type: queue
    engine: rabbitmq

# Overrides por Ambiente
environments:
  dev:
    # Em DEV, recursos rodam como containers locais (sidecars/docker-compose style)
    resources:
      main-db:
        mode: local-container
      cache-redis:
        mode: local-container
    services:
      frontend:
        replicas: 1

  hml:
    # Em HML, usamos recursos gerenciados mas menores
    resources:
      main-db:
        mode: managed
        instance_class: db.t3.small
    services:
      backend-api:
        replicas: 2

  prod:
    # Em PROD, recursos robustos
    resources:
      main-db:
        mode: managed
        instance_class: db.r5.large
        multi_az: true
    services:
      frontend:
        replicas: 5
        autoscaling:
          min: 5
          max: 20
```

## Seções Principais

1. **`services`**: Define o que roda.
   - `type`: `web`, `api`, `worker`, `cron`, `internal`.
   - `build`/`image`: Origem do código.
   - `ports`/`routes`: Exposição de rede.
   - `env`: Variáveis de ambiente (suporta interpolação).
   - `depends_on`: Ordem de inicialização e dependências.

2. **`resources`**: Define o que armazena/processa dados.
   - `type`: `db`, `cache`, `queue`.
   - `engine`: Tecnologia específica (postgres, redis, etc).
   - `mode`: `local-container` (efêmero) ou `managed` (persistente/externo).

3. **`environments`**: Especializações da spec base.
   - Permite sobrescrever qualquer chave definida em services ou resources.
   - Define comportamento específico de infraestrutura (tamanho, réplicas, modo de recurso).
