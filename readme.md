
# Payments API

Sistema de gerenciamento de contas bancárias desenvolvido com Spring Boot.

---

## Tecnologias Utilizadas

| Componente        | Tecnologia                                    | Descrição                                                        |
|-------------------|-----------------------------------------------|------------------------------------------------------------------|
| Backend           | Java 21, Spring Boot 3, Spring Data JPA, Maven| Lógica de negócio e API REST.                                    |
| Banco de Dados    | SQL Server (Docker)                           | Persistência relacional para contas, pessoas e transações.        |
| Containerização   | Docker & Docker Compose                       | Setup reprodutível para backend e banco de dados.                 |
| Documentação      | SpringDoc OpenAPI (Swagger UI)                | Documentação interativa dos endpoints.                            |
| Testes            | JUnit 5 & Mockito                             | Testes unitários da lógica principal.                             |

---

## Endpoints Implementados

Todos os requisitos obrigatórios foram implementados e expostos via REST em `/api/v1/accounts`.

| Funcionalidade     | Método | Endpoint                                 | Status        |
|--------------------|--------|------------------------------------------|---------------|
| Criar Conta        | POST   | `/api/v1/accounts`                       | Obrigatório   |
| Depósito           | POST   | `/api/v1/accounts/{accountId}/deposit`   | Obrigatório   |
| Saque              | POST   | `/api/v1/accounts/{accountId}/withdraw`  | Obrigatório   |
| Consulta Saldo     | GET    | `/api/v1/accounts/{accountId}/balance`   | Obrigatório   |
| Bloquear Conta     | PATCH  | `/api/v1/accounts/{accountId}/block`     | Obrigatório   |
| Extrato Completo   | GET    | `/api/v1/accounts/{accountId}/statement` | Obrigatório   |
| Documentação API   | GET    | `/swagger-ui.html`                       | Diferencial   |

---

## Como Executar o Projeto (Docker Compose)

Este projeto foi projetado para rodar via Docker, evitando problemas de configuração de ambiente.

### Pré-requisitos

- Docker Desktop (ou Docker Engine) instalado e em execução
- Docker Compose (normalmente incluso no Docker Desktop)

### Passo a Passo

1. **Build e inicialização dos containers:**
	```powershell
	docker compose up --build -d
	```

2. **Monitorar logs do banco de dados:**
	```powershell
	docker compose logs -f db
	```
	Aguarde até aparecer:
	`SQL Server is now ready for client connections.`

3. **Configuração do banco de dados:**
	Como a aplicação usa `ddl-auto=none`, o schema deve ser criado manualmente:
	- Host: `localhost`
	- Porta: `1433`
	- Login: `sa`
	- Senha: definida no `docker-compose.yml` (ex: `Password!123`)

	Scripts necessários:
	- Criar o banco `payments_db`
	- Criar tabelas: `PEOPLE`, `ACCOUNTS`, `TRANSACTIONS`
	- Inserir o registro inicial obrigatório: `id_person = 101`

4. **Testar a API:**
	- Acesse a documentação interativa em: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

5. **Rodar testes unitários:**
	```powershell
	mvn test
	```

6. **Encerrar containers e remover volumes:**
	```powershell
	docker compose down -v
	```

