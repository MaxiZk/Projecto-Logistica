# Etapa de build
FROM eclipse-temurin:17-jdk AS build
WORKDIR /workspace
COPY . .
# usa el wrapper si está; si no está, cambia a: RUN mvn -DskipTests clean package
RUN ./mvnw -DskipTests=true clean package

# Etapa de runtime
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /workspace/target/*.jar app.jar

# Railway/Heroku ponen PORT en env; Spring lo toma por application.properties
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]

