#!/bin/bash

# Configuration
SERVICES=(
  "auth-service"
  "users-service"
  "aadhar-service"
  "account-service"
  "transactions-service"
  "company-service"
  "payment-gateway-service"
  "credit-cards-service"
  "loan-service"
  "ai-assistant-service"
  "bank-statements-service"
)

LOG_DIR="logs"
mkdir -p "$LOG_DIR"

echo "===================================================="
echo "Starting Core microservices (excluding extra services) + Frontend"
echo "===================================================="

# Trap ctrl-c and call cleanup()
trap cleanup INT

PID_LIST=()

cleanup() {
  echo ""
  echo "===================================================="
  echo "Stopping all microservices and frontend..."
  echo "===================================================="
  for pid in "${PID_LIST[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      echo "Killing process $pid..."
      kill "$pid"
    fi
  done
  exit 0
}

# Build and start each backend service
for service in "${SERVICES[@]}"; do
  if [ -d "$service" ]; then
    echo "----------------------------------------------------"
    echo "Building service: $service..."
    echo "----------------------------------------------------"
    (cd "$service" && mvn clean install -DskipTests)
    
    if [ $? -ne 0 ]; then
      echo "Error: Build failed for $service. Aborting."
      cleanup
    fi

    echo "Starting service: $service in background..."
    log_file="$LOG_DIR/${service}.log"
    (cd "$service" && mvn spring-boot:run) > "$log_file" 2>&1 &
    service_pid=$!
    PID_LIST+=($service_pid)
    echo "Service $service started with PID: $service_pid. Logs: $log_file"
  else
    echo "Warning: Service directory $service not found. Skipping."
  fi
done

# Start the React Frontend
if [ -d "frontend" ]; then
  echo "----------------------------------------------------"
  echo "Setting up and starting Frontend..."
  echo "----------------------------------------------------"
  
  # Ensure env file exists
  if [ ! -f "frontend/.env" ] && [ -f "frontend/.env.example" ]; then
    echo "Copying .env.example to .env..."
    cp frontend/.env.example frontend/.env
  fi

  # Install frontend dependencies if node_modules does not exist
  if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend node dependencies..."
    (cd frontend && npm install)
  fi

  echo "Starting Frontend in background..."
  log_file="$LOG_DIR/frontend.log"
  (cd frontend && npm run dev) > "$log_file" 2>&1 &
  frontend_pid=$!
  PID_LIST+=($frontend_pid)
  echo "Frontend started with PID: $frontend_pid. Logs: $log_file"
else
  echo "Warning: frontend directory not found. Skipping."
fi

echo "===================================================="
echo "All services and frontend started successfully!"
echo "Press Ctrl+C to stop everything."
echo "===================================================="

# Keep script running to allow graceful shutdown with Ctrl+C
while true; do
  sleep 1
done
