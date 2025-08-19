const express = require("express");
const router = express.Router();
const proveedores = require("../models/proveedores.json");

// GET todos los proveedores
router.get("/", (req, res) => {
    res.json(proveedores);
});

// GET proveedor por ID
router.get("/:id", (req, res) => {
    const proveedor = proveedores.find(p => p.id == req.params.id);
    proveedor ? res.json(proveedor) : res.status(404).json({ error: "Proveedor no encontrado" });
});

module.exports = router;
