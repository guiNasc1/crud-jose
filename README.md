# Trabalho Jose

Projeto CRUD com backend em Spring Boot e frontend (em construcao).

## Estrutura

```
backend/crud   -> API REST em Spring Boot (Java + Maven)
frontend       -> aplicacao web (em construcao)
```

## Como rodar o backend

Pre-requisitos: Java 17+, Maven (ou use o wrapper `mvnw`) e PostgreSQL rodando.

1. Crie o banco de dados:

```sql
CREATE DATABASE crud;
```

2. Configure as credenciais do banco em variaveis de ambiente:

```bash
set DB_URL=jdbc:postgresql://localhost:5432/crud
set DB_USERNAME=postgres
set DB_PASSWORD=sua_senha
```

3. Rode a aplicacao:

```bash
cd backend/crud
mvnw spring-boot:run
```

A API sobe em http://localhost:8080
