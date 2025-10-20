# Message Queue Example with RabbitMQ

This microservices project showcases event-driven communication between multiple Node.js services and demostrate the usage of RabbitMQ message broker for realible async communication between mivroservices.



## 🏗️ Architecture Overview

This project consists of **6 microservices** communicating through RabbitMQ:

| Service | Port | Queue Name | Routing Key | Description |
|---------|------|------------|-------------|-------------|
| **Order Service** | 3000 | `order.complete.queue` | `order.complete` | Handles order placement (REST API) |
| **Inventory Service** | - | `inventory.queue` | `inventory.update` | Manages inventory updates |
| **Payment Service** | - | `payment.queue` | `payment.process` | Processes payments |
| **Email Service** | - | `email.queue` | `email.send` | Sends email notifications |
| **SMS Service** | - | `sms.queue` | `sms.send` | Sends SMS notifications |
| **Logger Service** | - | `logger.queue` | `#` (all messages) | Logs all system events |

**Exchange:** `order-process-exchange` (Direct)



## 📁 Project Structure

```
MessageQueue-example/
├── order-service/          # REST API + Order processing
├── inventory-service/      # Inventory management
├── payment-service/        # Payment processing
├── email-service/          # Email notifications
├── sms-service/           # SMS notifications
├── logger-service/        # System-wide logging
└── README.md
```

## ✅ Prerequisites

- **Node.js** (v14 or higher)
- **Docker** (for RabbitMQ)
- **npm**

## 🚀 Installation

### Option 1: Quick Start with Docker Compose (Recommended)

If you want to run everything with Docker, switch to the Docker branch:

```bash
git checkout run-with-docker-compose
docker compose up
```

### Option 2: Manual Setup

#### Step 1: Install and Start RabbitMQ

```bash
# Pull RabbitMQ image with management UI
docker pull rabbitmq:3-management

# Run RabbitMQ container
docker run -d --name rabbitmq \ -p 5672:5672 \ -p 15672:15672 \ rabbitmq:3-management
```

**Access RabbitMQ Management UI:**
- URL: http://localhost:15672
- Username: `guest`
- Password: `guest`

#### Step 2: Install Dependencies for Each Service

**Ex - For Order Service:**
```bash
cd order-service
npm install
npm install -g nodemon
```

**For Other Services (Inventory, Payment, Email, SMS, Logger):**
```bash
cd <service-name>
npm install
npm install -g nodemon
```

### 📦 Package Details

| Package | Purpose |
|---------|---------|
| `amqplib` | RabbitMQ client for Node.js |
| `express` | Web framework for REST API |
| `body-parser` | Parse incoming request bodies |
| `nodemon` | Auto-restart server during development |

## 🏃 Running the Application

### Start All Services (Manual)

Open **6 separate terminal windows** and run each service:

```bash
# Terminal 1: Order Service (REST API on port 3000)
cd order-service
nodemon index

# Terminal 2: Inventory Service
cd inventory-service
nodemon index

# Terminal 3: Payment Service
cd payment-service
nodemon index

# Terminal 4: Email Service
cd email-service
nodemon index

# Terminal 5: SMS Service
cd sms-service
nodemon index

# Terminal 6: Logger Service
cd logger-service
nodemon index
```

✅ All services should connect to RabbitMQ and start listening to their respective queues.

## 🧪 Testing the System

### Place an Order via REST API

```bash
curl --location 'http://localhost:3000/place-order' \
--header 'Content-Type: application/json' \
--data '{
    "orderId": "35454",
    "name": "Mechanical Mouse",
    "price": 100,
    "userId": "user-001"
}'
```

### Expected Behavior

1. **Order Service** receives the request and publishes a message
2. **Inventory Service** updates stock
3. **Payment Service** processes payment
4. **Email Service** sends confirmation email
5. **SMS Service** sends SMS notification
6. **Logger Service** logs all events

### Monitor Messages

Check RabbitMQ Management UI (http://localhost:15672) to see:
- Message flow through exchanges
- Queue statistics
- Consumer connections

## 📚 Resources

- **📺 Demo Video:** [Watch on YouTube](https://www.youtube.com/watch?v=TZsEX9YtMew)
- **📝 Blog Post:** [Understanding Message Queues](https://medium.com/@kavindamadhuranga74/what-are-message-queues-why-does-it-matter-4c016e95a8f8)

## 🔧 Troubleshooting

### RabbitMQ Connection Issues
```bash
# Check if RabbitMQ is running
docker ps

# Restart RabbitMQ
docker restart rabbitmq
```

### Port Conflicts
Make sure port `3000` (Order Service) and `5672`, `15672` (RabbitMQ) are available.

## 📄 License

MIT License

---

**💡 Tip:** For a faster setup without manual service configuration, use Docker Compose on the `run-with-docker-compose` branch!
