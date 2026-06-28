const { createClient } = require("@libsql/client");

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const sampleCustomers = [
  {
    id: "CUST001",
    name: "Rahul Sharma",
    panCard: "ABCDE1234F",
    phoneNo: "9876543210",
    accNo: "LN10001",
    disbursedDate: "2024-01-15",
    disbursedAmt: 500000,
    overdue: 25000,
    status: "active",
  },
  {
    id: "CUST002",
    name: "Priya Patel",
    panCard: "FGHIJ5678K",
    phoneNo: "9876543211",
    accNo: "LN10002",
    disbursedDate: "2024-02-20",
    disbursedAmt: 300000,
    overdue: 0,
    status: "active",
  },
  {
    id: "CUST003",
    name: "Amit Kumar",
    panCard: "KLMNO9012P",
    phoneNo: "9876543212",
    accNo: "LN10003",
    disbursedDate: "2023-11-10",
    disbursedAmt: 750000,
    overdue: 45000,
    status: "overdue",
  },
];

async function seed() {
  try {
    console.log("🚀 Connecting to Turso...");

    // 1. Create table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT,
        panCard TEXT,
        phoneNo TEXT,
        accNo TEXT,
        disbursedDate TEXT,
        disbursedAmt INTEGER,
        overdue INTEGER,
        status TEXT
      )
    `);

    console.log("✅ Table created / verified");

    // 2. Clean old data
    await client.execute(`DELETE FROM customers`);
    console.log("🧹 Old data cleared");

    // 3. Insert data one by one (SAFE for Turso)
    for (const c of sampleCustomers) {
      await client.execute({
        sql: `
          INSERT INTO customers 
          (id, name, panCard, phoneNo, accNo, disbursedDate, disbursedAmt, overdue, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          c.id,
          c.name,
          c.panCard,
          c.phoneNo,
          c.accNo,
          c.disbursedDate,
          c.disbursedAmt,
          c.overdue,
          c.status,
        ],
      });
    }

    console.log(`🎉 Seed completed: ${sampleCustomers.length} customers inserted`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

seed();
