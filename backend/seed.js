const mongoose = require('mongoose');
const { Customer, EmiPlan, Topup, Moratorium, Payment, Task } = require('./models');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/narainsons_crm';

const sampleCustomers = [
  { name: 'Rahul Sharma', panCard: 'ABCDE1234F', phoneNo: '9876543210', accNo: 'LN10001', disbursedDate: '2024-01-15', disbursedAmt: 500000, overdue: 25000, status: 'active' },
  { name: 'Priya Patel', panCard: 'FGHIJ5678K', phoneNo: '9876543211', accNo: 'LN10002', disbursedDate: '2024-02-20', disbursedAmt: 300000, overdue: 0, status: 'active' },
  { name: 'Amit Kumar', panCard: 'KLMNO9012P', phoneNo: '9876543212', accNo: 'LN10003', disbursedDate: '2023-11-10', disbursedAmt: 750000, overdue: 45000, status: 'overdue' },
  { name: 'Sneha Gupta', panCard: 'PQRST3456U', phoneNo: '9876543213', accNo: 'LN10004', disbursedDate: '2024-03-05', disbursedAmt: 200000, overdue: 0, status: 'active' },
  { name: 'Vikram Singh', panCard: 'UVWXY7890Z', phoneNo: '9876543214', accNo: 'LN10005', disbursedDate: '2023-08-15', disbursedAmt: 1000000, overdue: 120000, status: 'overdue' },
  { name: 'Neha Reddy', panCard: 'BCDEF2345G', phoneNo: '9876543215', accNo: 'LN10006', disbursedDate: '2024-04-01', disbursedAmt: 400000, overdue: 0, status: 'active' },
  { name: 'Rajesh Mehta', panCard: 'CDEFG6789H', phoneNo: '9876543216', accNo: 'LN10007', disbursedDate: '2023-12-20', disbursedAmt: 600000, overdue: 30000, status: 'overdue' },
  { name: 'Anita Desai', panCard: 'DEFGH0123I', phoneNo: '9876543217', accNo: 'LN10008', disbursedDate: '2024-05-10', disbursedAmt: 150000, overdue: 0, status: 'closed' },
];

const sampleEmiPlans = [
  { name: 'Rahul Sharma', accNo: 'LN10001', emiStartDate: '2024-02-01', emiEndDate: '2026-01-31', totalEmi: 24, totalPaidEmi: 8, totalAmt: 500000, amtLeft: 350000, monthlyEmi: 24500 },
  { name: 'Priya Patel', accNo: 'LN10002', emiStartDate: '2024-03-01', emiEndDate: '2026-02-28', totalEmi: 24, totalPaidEmi: 6, totalAmt: 300000, amtLeft: 225000, monthlyEmi: 14700 },
  { name: 'Amit Kumar', accNo: 'LN10003', emiStartDate: '2023-12-01', emiEndDate: '2025-11-30', totalEmi: 24, totalPaidEmi: 12, totalAmt: 750000, amtLeft: 375000, monthlyEmi: 36750 },
];

const samplePayments = [
  { name: 'Rahul Sharma', accNo: 'LN10001', amount: 24500, type: 'EMI Payment', date: new Date('2024-06-01'), mode: 'bank_transfer' },
  { name: 'Priya Patel', accNo: 'LN10002', amount: 14700, type: 'EMI Payment', date: new Date('2024-06-02'), mode: 'upi' },
  { name: 'Amit Kumar', accNo: 'LN10003', amount: 20000, type: 'Overdue Payment', date: new Date('2024-06-05'), mode: 'cash' },
  { name: 'Rahul Sharma', accNo: 'LN10001', amount: 24500, type: 'EMI Payment', date: new Date('2024-05-01'), mode: 'auto_debit' },
  { name: 'Priya Patel', accNo: 'LN10002', amount: 14700, type: 'EMI Payment', date: new Date('2024-05-01'), mode: 'auto_debit' },
];

const sampleTasks = [
  { title: 'Follow up with Amit Kumar for overdue payment', dueDate: new Date('2024-06-30'), priority: 'High', status: 'pending' },
  { title: 'Verify documents for Neha Reddy', dueDate: new Date('2024-06-28'), priority: 'Medium', status: 'pending' },
  { title: 'Send EMI reminder to Rahul Sharma', dueDate: new Date('2024-06-27'), priority: 'High', status: 'pending' },
  { title: 'Review Vikram Singh NPA case', dueDate: new Date('2024-07-01'), priority: 'High', status: 'pending' },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Customer.deleteMany({});
    await EmiPlan.deleteMany({});
    await Payment.deleteMany({});
    await Task.deleteMany({});
    await Topup.deleteMany({});
    await Moratorium.deleteMany({});

    console.log('Cleared existing data');

    // Insert sample data
    await Customer.insertMany(sampleCustomers);
    console.log(`✅ Inserted ${sampleCustomers.length} customers`);

    await EmiPlan.insertMany(sampleEmiPlans);
    console.log(`✅ Inserted ${sampleEmiPlans.length} EMI plans`);

    await Payment.insertMany(samplePayments);
    console.log(`✅ Inserted ${samplePayments.length} payments`);

    await Task.insertMany(sampleTasks);
    console.log(`✅ Inserted ${sampleTasks.length} tasks`);

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
