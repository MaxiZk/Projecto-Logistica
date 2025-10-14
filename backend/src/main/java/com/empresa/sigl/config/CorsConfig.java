package com.empresa.sigl.config;

import java.util.Arrays;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration cfg = new CorsConfiguration();

        // Si usás cookies/sesión y querés enviarlas, dejá esto en true.
        cfg.setAllowCredentials(true);

        // Usar allowedOriginPatterns para dominios exactos o comodines
        cfg.setAllowedOriginPatterns(Arrays.asList(
                "https://max.zuidnet.online"
                // si más adelante usás subdominios: "https://*.zuidnet.online"
        ));

        cfg.setAllowedMethods(Arrays.asList("GET","POST","PUT","DELETE","OPTIONS"));
        cfg.setAllowedHeaders(Arrays.asList("*"));
        // Opcional: cabeceras que querés exponer al front
        // cfg.setExposedHeaders(Arrays.asList("Location"));

        // Aplica a todos los endpoints (o cámbialo a "/api/**" si querés)
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return new CorsFilter(source);
    }
}

