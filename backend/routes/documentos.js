const express = require("express");
const router = express.Router();

let documentos = [
    { id: 1, tipo: "Factura", cliente: "Empresa A", fecha: "2025-08-10" },
    { id: 2, tipo: "Remito", cliente: "Empresa B", fecha: "2025-08-15" }
];

router.get("/", (req, res) => {
    res.json(documentos);
});

module.exports = router;
