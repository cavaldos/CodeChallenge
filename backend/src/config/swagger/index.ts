import swaggerJsdoc, { Options } from "swagger-jsdoc";

const swaggerOptions: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Email Campaign API",
      version: "2.1.0",
      description: "API for managing email campaigns and recipients",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5001",
        description: "Development server",
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
      schemas: {
        User: {
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", format: "password" },
            name: { type: "string" },
          },
        },
        Campaign: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            subject: { type: "string" },
            body: { type: "string" },
            status: { type: "string", enum: ["draft", "scheduled", "sent"] },
            scheduledAt: { type: "string", format: "date-time" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Recipient: {
          type: "object",
          properties: {
            id: { type: "integer" },
            email: { type: "string", format: "email" },
            name: { type: "string" },
            campaignId: { type: "integer" },
            status: { type: "string", enum: ["pending", "sent", "failed"] },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            accessToken: { type: "string" },
            refreshToken: { type: "string" },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: { type: "string" },
            statusCode: { type: "integer" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] } as { bearerAuth: string[] }],
  },
  apis: ["./src/api/routes/*.ts", "./src/api/controllers/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);

export const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Email Campaign API Docs",
};