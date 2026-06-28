# Narainsons CRM Backend API

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/narainsons_crm
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret-key
```

3. Start MongoDB locally or use MongoDB Atlas

4. Seed database with sample data:
```bash
npm run seed
```

5. Start server:
```bash
npm run dev    # Development with nodemon
npm start      # Production
```

## API Endpoints

### Dashboard
- `GET /api/dashboard` - Dashboard KPIs and stats

### Customers
- `GET /api/customers` - List customers (pagination, search, filter)
- `GET /api/customers/stats` - Customer statistics
- `GET /api/customers/:id` - Get single customer
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `POST /api/customers/bulk` - Bulk create from array

### Loans
- `GET /api/loans` - List loans
- `POST /api/loans` - Create loan
- `PUT /api/loans/:id` - Update loan
- `DELETE /api/loans/:id` - Delete loan

### EMI Plans
- `GET /api/emi` - List EMI plans
- `GET /api/emi/stats` - EMI statistics
- `POST /api/emi` - Create EMI plan
- `PUT /api/emi/:id` - Update EMI plan
- `DELETE /api/emi/:id` - Delete EMI plan
- `POST /api/emi/bulk` - Bulk create EMI plans

### Top-up
- `GET /api/topup` - List top-ups
- `POST /api/topup` - Create top-up
- `POST /api/topup/bulk` - Bulk create top-ups

### Moratorium
- `GET /api/moratorium` - List moratoria
- `POST /api/moratorium` - Create moratorium
- `POST /api/moratorium/bulk` - Bulk create moratoria

### Payments
- `GET /api/payments` - List payments
- `GET /api/payments/stats` - Payment statistics
- `POST /api/payments` - Record payment

### Collections
- `GET /api/collections` - Overdue accounts
- `GET /api/collections/stats` - Collection statistics

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Reports
- `GET /api/reports/portfolio` - Portfolio summary
- `GET /api/reports/overdue` - Overdue report
- `GET /api/reports/collection` - Collection report
- `GET /api/reports/emi-due` - EMI due report

### Upload (CSV)
- `POST /api/upload/customers` - Upload customer CSV
- `POST /api/upload/emi` - Upload EMI CSV
- `POST /api/upload/topup` - Upload top-up CSV
- `POST /api/upload/moratorium` - Upload moratorium CSV

## CSV Upload Format

### Customers
```csv
name,pan_card,phone_no,acc_no,disbursed_date,disbursed_amt,overdue,status
Rahul Sharma,ABCDE1234F,9876543210,LN10001,2024-01-15,500000,25000,active
```

### EMI Plans
```csv
name,dob,pan_card,mobile,address,acc_no,emi_start_date,emi_end_date,total_emi,total_paid_emi,total_amt,amt_left
Rahul Sharma,1990-05-15,ABCDE1234F,9876543210,Delhi,LN10001,2024-02-01,2026-01-31,24,8,500000,350000
```
