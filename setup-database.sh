#!/bin/bash

# CopilotKit State Machine - Supabase Database Setup Script
# This script creates all necessary tables for the car sales state machine

echo "🚗 CopilotKit State Machine - Database Setup"
echo "============================================"

# Database connection details
DB_HOST="db.fyqdlfdthkkslbwtsvmq.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"
DB_PASSWORD="Torontoauto1000#"

# Connection string with URL-encoded password
CONNECTION_STRING="postgresql://${DB_USER}:${DB_PASSWORD//#/%23}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo "📊 Connecting to Supabase database..."

# Function to execute SQL file
execute_sql_file() {
    local file=$1
    local description=$2
    
    echo "⚙️  Executing: $description"
    psql "$CONNECTION_STRING" -f "$file" -v ON_ERROR_STOP=1
    
    if [ $? -eq 0 ]; then
        echo "✅ $description completed successfully"
    else
        echo "❌ Error executing $description"
        exit 1
    fi
}

# Execute migration files in order
echo ""
echo "🔄 Running migrations..."
echo ""

execute_sql_file "supabase/migrations/001_create_sessions.sql" "Creating sessions table"
execute_sql_file "supabase/migrations/002_create_contact_and_cars.sql" "Creating contact and cars tables"
execute_sql_file "supabase/migrations/003_insert_cars.sql" "Inserting sample car data"
execute_sql_file "supabase/migrations/004_create_selections_financing.sql" "Creating selections and financing tables"
execute_sql_file "supabase/migrations/005_create_payment_orders.sql" "Creating payment and orders tables"
execute_sql_file "supabase/migrations/006_create_chat_and_transitions.sql" "Creating chat and transitions tables"

echo ""
echo "🎉 Database setup completed successfully!"
echo ""
echo "📋 Created tables:"
echo "  ✅ car_sales_sessions - Main state machine tracker"
echo "  ✅ contact_information - Customer contact details"
echo "  ✅ cars_inventory - Available cars (with 7 sample cars)"
echo "  ✅ car_selections - Customer car choices"
echo "  ✅ financing_decisions - Financing vs direct payment"
echo "  ✅ financing_information - Loan details"
echo "  ✅ payment_information - Card payment details"
echo "  ✅ orders - Confirmed orders"
echo "  ✅ chat_messages - Conversation history"
echo "  ✅ state_transitions - State machine audit log"
echo ""
echo "🚀 Your CopilotKit State Machine database is ready!"
