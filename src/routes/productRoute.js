const express = require("express");

const productController = require("../controllers/productController");
const authenticateToken = require("../../middleware/auth");

const router = express.Router();

router.use(authenticateToken);

router.get("/", productController.getAllProducts);

router.get("/:id", productController.getProductById);

router.post("/", productController.createProduct);

router.put("/:id", productController.updateProduct);

router.delete("/:id", productController.deleteProduct);

module.exports = router;
