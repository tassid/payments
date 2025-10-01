# 1. Usa uma imagem base Java leve (Alpine)
FROM eclipse-temurin:21-jdk-alpine

# Instala o Maven
# apk é o gerenciador de pacotes do Alpine Linux
RUN apk add --no-cache maven

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia o arquivo Maven POM para cachear as dependências
COPY pom.xml .

# Copia o código fonte
COPY src ./src

# Empacota a aplicação Spring Boot (agora o comando mvn funcionará)
# O JAR resultante estará em target/payments-0.0.1-SNAPSHOT.jar
# NOTE: O cache do Maven é crucial aqui para builds rápidas.
RUN --mount=type=cache,target=/root/.m2 mvn clean install -DskipTests

# Define o comando de execução para iniciar a aplicação
ENTRYPOINT ["java", "-jar", "target/payments-0.0.1-SNAPSHOT.jar"]

# Expõe a porta padrão do Spring Boot
EXPOSE 8080