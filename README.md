
# ScriptAI

## 🚀 Project Overview
This project is a **microservices-based AI-powered Ad Content Generator**. It enables users to generate either a **video ad script using Gemini AI** or an **ad image using Clipdrop AI**. It is a **backend-only system** built using Node.js, Express, MongoDB, Kafka, and Docker.

## 🎯 Purpose
To provide a scalable and efficient backend platform where users can input some values in form and get **AI-generated ad content** (scripts or images). The platform includes a **token-based system**, offering users 50 free tokens on registration and deducting tokens based on the content generation service used.

## 🔑 Key Features and Flow

### 🔐 User Authentication & Token System
- JWT-based authentication  
- 50 free tokens granted on sign-up  
- Token deduction based on the service used (script/image)  

### 🤖 AI Integration
- **Gemini AI**: Generates ad scripts  
- **Clipdrop AI**: Generates ad images  

### 🧱 Microservices Architecture
- **Services**:
  - User Service
  - AdScript Service (AI Content (Gemini & Clipdrop))
  - Token Service
  - Payment Service
  - ApiGateway Service
- **Communication**: All services communicate asynchronously via **Confluent Kafka**

### 🌐 API Gateway
- Acts as a reverse proxy to route incoming requests to appropriate microservices

### 📜 Winston Logging
- Logs are written to separate files by level (`info.log`, `error.log`)  
- Includes request flow, response status, and AI generation outcomes  

## 🛠️ Tech Stack
- **Node.js + Express**
- **MongoDB** for data persistence
- **Kafka** for asynchronous inter-service communication
- **Docker & Docker Compose** for containerization and deployment
- **Winston** for logging
- **Gemini AI API** for script generation
- **Clipdrop AI API** for image generation
- **Razorpay** for Payment gateway integration

## 🧱 Architecture Overview

<div style="width:400px;">
  <img src="./architectureImage/archimage.png"/>
</div>

## 🧪 Getting Started

### 📥 Clone the Repository
```bash
git clone https://github.com/JAIMIN-6532/AdScriptAI.git
cd AdScriptAI
```

---

### 🐳 Run with Docker Compose

Make sure you have **Docker** and **Docker Compose** installed on your system.

1. **Build and Start All Services**:
```bash
docker-compose up --build
```

2. **Run in Detached Mode**:
```bash
docker-compose up -d 
```


3. **Stop All Containers**:
```bash
docker-compose down
```

4. **Rebuild Specific Service (Optional)**:
```bash
docker-compose build service-name
```

5. **Check logs for any service**:
```bash
    docker logs -f service-name
```

Replace `service-name` with one of:
- `userservice`
- `adscriptservice`
- `tokenservice`
- `paymentservice`
- `apigatewayservice`

---

## 📁 Folder Structure Overview

```
project-root/
│
├── userservice/
├── adscriptservice/
├── tokenservice/
├── paymentservice/
├── apigatewayservice/
│
├── docker-compose.yml
├── README.md
```

## 💰 Token System Logic
- Each content-generation service deducts tokens after validating user balance  
- MongoDB stores and tracks token balances  
- If tokens are insufficient, the request is rejected with a meaningful response  

## 📦 Deployment Strategy
- All services are containerized using Docker  
- A single `docker-compose.yml` file manages the full stack:
  - Kafka
  - Zookeeper
  - MongoDB
  - API Gateway
  - All microservices  

## 🧾 Logging
- Implemented via **Winston** logger  
- Logs include:
  - API request and response lifecycle  
  - Success/failure of AI operations  
  - Kafka message flow across services  

## 📡 Kafka Communication
- Requests from API Gateway are published to Kafka topics (e.g., `adscript.requests`, `token.requests`)  
- Corresponding services consume messages, perform actions, and send responses asynchronously  
- Promotes **decoupled and scalable architecture**  

## 🧠 Key Takeaways
- Gained expertise in building **microservices architecture** using Node.js and Kafka  
- Learned to integrate **AI APIs** into backend workflows  
- Designed a secure token economy and user authentication  
- Developed a production-ready system with Docker and detailed logging  



---

