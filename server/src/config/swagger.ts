import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Store Admin System API',
      version: '1.0.0',
      description: 'REST API for managing customers, products, and purchases',
      contact: {
        name: 'Store Admin',
        url: 'http://localhost:3000',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Customer: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            id: {
              type: 'integer',
              description: 'Customer ID',
            },
            name: {
              type: 'string',
              description: 'Customer name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Customer email address',
            },
            phone: {
              type: 'string',
              nullable: true,
              description: 'Customer phone number',
            },
            address: {
              type: 'string',
              nullable: true,
              description: 'Customer address',
            },
            city: {
              type: 'string',
              nullable: true,
              description: 'Customer city',
            },
            state: {
              type: 'string',
              nullable: true,
              description: 'Customer state',
            },
            zipCode: {
              type: 'string',
              nullable: true,
              description: 'Customer zip code',
            },
            country: {
              type: 'string',
              nullable: true,
              description: 'Customer country',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        Product: {
          type: 'object',
          required: ['sku', 'name', 'description', 'price'],
          properties: {
            id: {
              type: 'integer',
              description: 'Product ID',
            },
            sku: {
              type: 'string',
              description: 'Product SKU (unique)',
            },
            name: {
              type: 'string',
              description: 'Product name',
            },
            description: {
              type: 'string',
              description: 'Product description',
            },
            price: {
              type: 'number',
              format: 'decimal',
              description: 'Product price',
            },
            stock: {
              type: 'object',
              properties: {
                id: {
                  type: 'integer',
                },
                quantity: {
                  type: 'integer',
                  description: 'Available quantity',
                },
                createdAt: {
                  type: 'string',
                  format: 'date-time',
                },
                updatedAt: {
                  type: 'string',
                  format: 'date-time',
                },
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        PurchaseItem: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
            },
            quantity: {
              type: 'integer',
              description: 'Quantity purchased',
            },
            priceAtPurchase: {
              type: 'number',
              format: 'decimal',
              description: 'Price at the time of purchase',
            },
            product: {
              $ref: '#/components/schemas/Product',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Purchase: {
          type: 'object',
          required: ['customerId', 'items'],
          properties: {
            id: {
              type: 'integer',
              description: 'Purchase ID',
            },
            customerId: {
              type: 'integer',
              description: 'Customer ID',
            },
            customer: {
              $ref: '#/components/schemas/Customer',
            },
            totalAmount: {
              type: 'number',
              format: 'decimal',
              description: 'Total purchase amount',
            },
            status: {
              type: 'string',
              enum: ['pending', 'completed', 'cancelled'],
              description: 'Purchase status',
            },
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/PurchaseItem',
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
