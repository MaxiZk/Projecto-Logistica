const express = require("express");
const router = express.Router();

router.post("/login", (req, res) => {
    const { usuario, password } = req.body;

    if (usuario === "admin" && password === "1234") {
        return res.json({ success: true, rol: "admin" });
    } else if (usuario === "cliente" && password === "1234") {
        return res.json({ success: true, rol: "cliente" });
    }

    return res.status(401).json({ success: false, message: "Credenciales inválidas" });
});

module.exports = router;
