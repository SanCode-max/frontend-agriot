/**
 * setupProxy.js
 * Floating multilingual chat widget for the Knowledge Management project.
 * Communicates with the backend via POST /api/chat.
 * Displays a Persona Transhumana welcome message on first load.
 * Supports Spanish and English responses automatically.
 *
 * CRA dev-server proxy: forwards /api/* to the local backend (default port 3000).
 */

const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:3000",
      changeOrigin: true,
    })
  );
};
