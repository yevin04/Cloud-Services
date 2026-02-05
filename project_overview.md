# Project Overview: CloudYevin

## 1. High-Level Architecture
This project uses a **Cloud-Native Microservices Architecture** contained within a monorepo. It separates the frontend application from multiple backend services, all deployed to AWS.

### Key Components:
- **Frontend**: Single Page Application (SPA) hosted on S3.
- **Backend**: Microservices running on AWS ECS (Elastic Container Service).
- **Database**: Primary usage of AWS DynamoDB, with some traces of MongoDB (Mongoose) configuration.
- **CI/CD**: Automated deployments via GitHub Actions.

---

## 2. Technology Stack

### Frontend (`/frontend`)
- **Framework**: React 19 + Vite
- **Language**: JavaScript (ES Modules)
- **Deployment target**: AWS S3 Bucket (Static Website Hosting)
- **Key Dependencies**: `react-router-dom`

### Backend Services (`/services`)
The backend is split into domain-specific microservices:
1.  **auth-service**
2.  **inventory-service**
3.  **order-service**
4.  **product-service**

**Common Stack per Service:**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Containerization**: Docker (each service has its own `Dockerfile`)
- **Database Clients**: `@aws-sdk/client-dynamodb` (DynamoDB), `mongoose` (MongoDB - *Note: Mixed usage observed*)

---

## 3. AWS Services Used

| Service | Purpose | Evidence |
| :--- | :--- | :--- |
| **AWS ECS (Elastic Container Service)** | Orchestrates and runs the backend microservices containers. | `.github/workflows/deploy-ecs.yml` |
| **AWS ECR (Elastic Container Registry)** | Stores the Docker images for each service (`auth`, `inventory`, `order`, `product`). | `.github/workflows/deploy-ecs.yml` |
| **AWS DynamoDB** | NoSQL database used for data storage (e.g., Users table in `auth-service`). | `auth-service/src/models/User.js` imports `DynamoDBClient` |
| **AWS S3 (Simple Storage Service)** | Hosts the static frontend assets. | `frontend/.github/workflows/deploy.yml` |
| **IAM (Identity and Access Management)** | Manages permissions for GitHub Actions to deploy to AWS. | Workflow uses `aws-actions/configure-aws-credentials` |

---

## 4. Deployment Pipelines (CI/CD)

### Services Pipeline (`deploy-ecs.yml`)
- Sits in `services/.github/workflows/`
- **Trigger**: Push to `main` branch.
- **Logic**:
    1.  Detects which services changed (`auth-service`, `product-service`, etc.).
    2.  Builds Docker image for changed services.
    3.  Pushes image to **Amazon ECR**.
    4.  Updates the **ECS Task Definition** with the new image.
    5.  Updates the **ECS Service** to trigger a rolling deployment.

### Frontend Pipeline (`deploy.yml`)
- Sits in `frontend/.github/workflows/`
- **Trigger**: Push or PR to `main`.
- **Logic**:
    1.  Installs dependencies (`npm ci`).
    2.  Builds the Vite project (`npm run build`).
    3.  Syncs the `dist/` folder to an S3 bucket.

---

## 5. Observations & Potential Improvements
- **Database Ambiguity**: The `auth-service` has code for both **MongoDB** (`mongoose.connect` in `db.js`) and **DynamoDB** (`DynamoDBClient` in `User.js`).
    - *Risk*: It's unclear which DB is the source of truth for all workflows. `User.js` explicitly uses DynamoDB, but `server.js` might be importing `db.js` which connects to Mongo. This should be cleaned up.
- **Monitoring**: No obvious logging (CloudWatch integration is implicit with ECS) or tracing (X-Ray) setup visible in the code scanned so far.
