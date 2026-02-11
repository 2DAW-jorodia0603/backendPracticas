import dotenv from "dotenv";

dotenv.config();

import app from "./config/app.js";
import authRoutes from "./routes/auth.js";
import captchaRoutes from "./routes/captcha.js";

// Registrar rutas
authRoutes(app);
captchaRoutes(app);

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
