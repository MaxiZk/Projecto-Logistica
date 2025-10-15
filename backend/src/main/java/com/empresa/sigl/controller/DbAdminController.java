package com.empresa.sigl.controller;

@RestController
@RequestMapping("/db-admin")
public class DbAdminController {

    private final JdbcTemplate jdbc;

    public DbAdminController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @PostMapping("/create-remote-user")
    public ResponseEntity<String> createRemoteUser(@RequestParam String token) {
        if (!"1234".equals(token)) return ResponseEntity.status(403).body("Token inválido");

        try {
            jdbc.execute("CREATE USER 'maxi'@'%' IDENTIFIED BY 'TuClaveSegura123!'");
            jdbc.execute("GRANT ALL PRIVILEGES ON *.* TO 'maxi'@'%' WITH GRANT OPTION");
            jdbc.execute("FLUSH PRIVILEGES");
            return ResponseEntity.ok("Usuario remoto creado correctamente.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
