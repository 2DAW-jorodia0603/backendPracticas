import svgCaptcha from "svg-captcha";
import captchas from "../middleware/captchaStore.js";

export default function captchaRoutes(app) {
  app.get("/captcha", (req, res) => {
    const captcha = svgCaptcha.create({
      size: 5,
      noise: 3,
      color: true,
      background: "#f2f2f2"
    });

    const captchaId = Date.now().toString();

    captchas.set(captchaId, captcha.text);

    // Expira en 2 minutos
    setTimeout(() => captchas.delete(captchaId), 120000);

    res.json({
      captchaId,
      image: captcha.data
    });
  });
}
