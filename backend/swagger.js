// backend/swagger.js
import swaggerJsdoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "VoidShop API",
    version: "1.0.0",
    description:
      "API de VoidShop (productos, cupones, órdenes, auth) — Demo mejorada con JWT real.",
  },
  servers: [
    {
      url: "https://voidshop-backend.onrender.com/api",
      description: "Servidor de producción",
    },
    {
      url: "http://localhost:3000/api",
      description: "Servidor de desarrollo",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: [
    "./index.js",
    "./productRoutes.js",
    "./orderRoutes.js",
    "./couponRoutes.js",
    "./authRoutes.js",
    "./userRoutes.js",
    "./paymentRoutes.js",
    "./cartRoutes.js",
    "./favoriteRoutes.js",
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
