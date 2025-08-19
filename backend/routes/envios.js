const express = require("express");
const router = express.Router();
const envios = require("../models/envios.json");

// GET todos los envíos
router.get("/", (req, res) => {
    res.json(envios);
});

// GET envío por ID
router.get("/:id", (req, res) => {
    const envio = envios.find(e => e.id == req.params.id);
    envio ? res.json(envio) : res.status(404).json({ error: "Envío no encontrado" });
});

module.exports = router;
