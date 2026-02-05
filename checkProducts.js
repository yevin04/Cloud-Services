import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "ap-south-1" });
const docClient = DynamoDBDocumentClient.from(client);

async function checkProducts() {
    try {
        console.log("Checking Products table...");

        const result = await docClient.send(new ScanCommand({
            TableName: "Products",
            Limit: 5
        }));

        console.log(`\n✓ Successfully connected to DynamoDB`);
        console.log(`✓ Products table exists`);
        console.log(`✓ Found ${result.Items?.length || 0} products (showing first 5)`);

        if (result.Items && result.Items.length > 0) {
            console.log("\nSample products:");
            result.Items.forEach((item, index) => {
                console.log(`${index + 1}. ${item.name} (${item.category}) - $${item.price}`);
            });
        } else {
            console.log("\n⚠ WARNING: Products table is EMPTY!");
            console.log("You need to add products using the populateProducts.js script or the admin dashboard.");
        }

    } catch (error) {
        console.error("\n✗ Error:", error.message);

        if (error.name === "ResourceNotFoundException") {
            console.log("\n⚠ The 'Products' table does not exist in DynamoDB!");
            console.log("You need to create it in the AWS Console.");
        } else if (error.name === "AccessDeniedException") {
            console.log("\n⚠ Access denied to DynamoDB!");
            console.log("Check your AWS credentials.");
        }
    }
}

checkProducts();
