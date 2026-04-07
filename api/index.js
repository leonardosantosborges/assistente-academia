const fs = require("fs");
const path = require("path");

module.exports = async function handler(req, res) {
  try {
    const htmlPath = path.join(process.cwd(), "index.html");
    const html = fs.readFileSync(htmlPath, "utf8");

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(html);
  } catch (error) {
    console.error("Erro ao renderizar landing page:", error);
    return res.status(500).send("Erro ao carregar a landing page.");
  }
};
