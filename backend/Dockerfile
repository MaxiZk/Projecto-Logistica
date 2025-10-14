# syntax=docker/dockerfile:1
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Copio wrapper y pom desde backend
COPY backend/.mvn .mvn
COPY backend/mvnw .
COPY backend/pom.xml .
COPY backend/src ./src

RUN chmod +x ./mvnw
RUN ./mvnw -DskipTests=true clean package

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENV JAVA_OPTS=""
CMD ["sh","-c","java $JAVA_OPTS -Dserver.port=$PORT -jar app.jar"]
