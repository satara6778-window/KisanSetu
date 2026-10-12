# Build the Spring Boot application
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

# Run the application
FROM eclipse-temurin:17-jre

WORKDIR /app

# Run as non-root user where practical and ensure H2 data directory exists
RUN groupadd -r spring && useradd -r -g spring spring \
    && mkdir -p /app/data \
    && chown -R spring:spring /app

COPY --from=build --chown=spring:spring /app/target/kisansetu-backend-*.jar app.jar

USER spring:spring

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]
