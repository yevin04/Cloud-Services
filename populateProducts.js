// Script to populate DynamoDB with sample products
// Run this with: node populateProducts.js

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const client = new DynamoDBClient({ region: "ap-south-1" });
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = "Products";

const sampleProducts = [
    {
        productId: randomUUID(),
        name: "Air Max 90",
        category: "Shoes",
        description: "The Nike Air Max 90 stays true to its OG running roots with the iconic Waffle sole, stitched overlays and classic TPU accents.",
        price: 120,
        images: [
            "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/99486859-0ff3-46b4-949b-2d16af2ad421/custom-nike-air-max-90-by-you-shoes.png"
        ],
        spotlight: true,
        variants: [
            { variant: "Size 8", stock: 10 },
            { variant: "Size 9", stock: 15 },
            { variant: "Size 10", stock: 8 }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        productId: randomUUID(),
        name: "Dri-FIT Training Tee",
        category: "Tees",
        description: "Nike Dri-FIT technology moves sweat away from your skin for quicker evaporation, helping you stay dry and comfortable.",
        price: 35,
        images: [
            "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/e7c5c5b5-5e5c-4b5e-9b5e-5e5c5b5e5c5b/dri-fit-training-t-shirt.png"
        ],
        spotlight: true,
        variants: [
            { variant: "Small", stock: 20 },
            { variant: "Medium", stock: 25 },
            { variant: "Large", stock: 18 }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        productId: randomUUID(),
        name: "Heritage Backpack",
        category: "Bags",
        description: "The Nike Heritage Backpack features a large main compartment with a sleeve that fits up to a 15-inch laptop.",
        price: 45,
        images: [
            "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/a7d3c5b5-5e5c-4b5e-9b5e-5e5c5b5e5c5b/heritage-backpack.png"
        ],
        spotlight: false,
        variants: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        productId: randomUUID(),
        name: "Tech Fleece Joggers",
        category: "Pants",
        description: "Premium, lightweight fleece—smooth both inside and out—gives you plenty of warmth without adding bulk.",
        price: 100,
        images: [
            "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/b8d3c5b5-5e5c-4b5e-9b5e-5e5c5b5e5c5b/tech-fleece-joggers.png"
        ],
        spotlight: true,
        variants: [
            { variant: "Small", stock: 12 },
            { variant: "Medium", stock: 15 },
            { variant: "Large", stock: 10 }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        productId: randomUUID(),
        name: "Classic Cap",
        category: "Other",
        description: "The Nike Sportswear Heritage86 Cap is made from soft cotton twill with an adjustable closure for a comfortable fit.",
        price: 25,
        images: [
            "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/c9d3c5b5-5e5c-4b5e-9b5e-5e5c5b5e5c5b/sportswear-heritage86-cap.png"
        ],
        spotlight: false,
        variants: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

async function populateProducts() {
    console.log(`Populating ${TABLE_NAME} table with sample products...`);

    for (const product of sampleProducts) {
        try {
            await docClient.send(new PutCommand({
                TableName: TABLE_NAME,
                Item: product
            }));
            console.log(`✓ Added: ${product.name} (${product.category})`);
        } catch (error) {
            console.error(`✗ Failed to add ${product.name}:`, error.message);
        }
    }

    console.log("\nDone! Products have been added to DynamoDB.");
}

populateProducts().catch(console.error);
