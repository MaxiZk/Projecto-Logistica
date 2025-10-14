# ===== Etapa de build =====
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Copiamos Maven Wrapper y configuración
COPY mvnw .
COPY .mvn .mvn

# Copiamos pom.xml y código fuente
COPY pom.xml .
COPY src ./src

# Damos permisos al wrapper y construimos el jar
RUN chmod +x mvnw
RUN ./mvnw -DskipTests=true clean package


# ===== Etapa de runtime =====
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copiamos el jar generado desde la etapa anterior
COPY --from=build /app/target/*.jar app.jar

# Expone el puerto (Render usa PORT automáticamente)
EXPOSE 10000

# Comando de arranque
CMD ["java", "-jar", "app.jar"]

