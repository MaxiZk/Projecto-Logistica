const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
const enviosRoutes = require("./routes/envios");
const proveedoresRoutes = require("./routes/proveedores");

app.use("/api/envios", enviosRoutes);
app.use("/api/proveedores", proveedoresRoutes);

// Servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
