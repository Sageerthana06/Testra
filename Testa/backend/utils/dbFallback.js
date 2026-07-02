const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, '..', 'db_fallback.json');

// Initial Mock Data
const defaultData = {
  users: [
    {
      _id: "u_superadmin",
      name: "Super Admin Owner",
      email: "superadmin@erp.com",
      password: "1234", // bcrypt hash for 'admin123'
      role: "super_admin",
      branchId: "b_colombo",
      commissionRate: 5,
      salary: 150000,
      status: "active",
      gpsLocation: { lat: 6.9271, lng: 79.8612, updatedAt: new Date() }
    },
    {
      _id: "u_admin",
      name: "Admin Manager",
      email: "admin@erp.com",
      password: "$2a$10$Xm5WkR8fM/h6oO7FwQfG8O5s1g8X9p3k.o/xM7KzYq4uJbA6c6hKa", // bcrypt hash for 'admin123'
      role: "admin",
      branchId: "b_colombo",
      commissionRate: 2,
      salary: 80000,
      status: "active",
      gpsLocation: { lat: 6.9272, lng: 79.8613, updatedAt: new Date() }
    },
    {
      _id: "u_manager",
      name: "Colombo Branch Manager",
      email: "manager@erp.com",
      password: "$2a$10$Xm5WkR8fM/h6oO7FwQfG8O5s1g8X9p3k.o/xM7KzYq4uJbA6c6hKa", // bcrypt hash for 'admin123'
      role: "branch_manager",
      branchId: "b_colombo",
      commissionRate: 3,
      salary: 95000,
      status: "active",
      gpsLocation: { lat: 6.9275, lng: 79.8618, updatedAt: new Date() }
    },
    {
      _id: "u_marketing",
      name: "Marketing Officer",
      email: "marketing@erp.com",
      password: "$2a$10$Xm5WkR8fM/h6oO7FwQfG8O5s1g8X9p3k.o/xM7KzYq4uJbA6c6hKa", // bcrypt hash for 'admin123'
      role: "marketing",
      branchId: "b_colombo",
      commissionRate: 10, // high sales commission
      salary: 45000,
      status: "active",
      gpsLocation: { lat: 6.9280, lng: 79.8625, updatedAt: new Date() }
    }
  ],
  branches: [
    { _id: "b_colombo", name: "Colombo Head Office", code: "COL-01", location: "Colombo, Sri Lanka", managerId: "u_manager", status: "active" },
    { _id: "b_galle", name: "Galle Southern Branch", code: "GAL-02", location: "Galle, Sri Lanka", managerId: "", status: "active" },
    { _id: "b_kandy", name: "Kandy Hill Branch", code: "KAN-03", location: "Kandy, Sri Lanka", managerId: "", status: "active" }
  ],
  products: [
    { _id: "p_tea", name: "Premium Ceylon Tea (1kg)", sku: "PRD-TEA-001", currentStock: 1500, buyPrice: 8.5, sellPrice: 15.0, lowStockThreshold: 100, category: "Agriculture" },
    { _id: "p_cinnamon", name: "Organic Cinnamon Quills (500g)", sku: "PRD-CIN-002", currentStock: 80, buyPrice: 12.0, sellPrice: 22.0, lowStockThreshold: 100, category: "Spices" },
    { _id: "p_pepper", name: "Black Pepper Whole (1kg)", sku: "PRD-PEP-003", currentStock: 450, buyPrice: 6.0, sellPrice: 11.5, lowStockThreshold: 50, category: "Spices" },
    { _id: "p_cardamom", name: "Green Cardamom Pods (250g)", sku: "PRD-CAR-004", currentStock: 30, buyPrice: 18.0, sellPrice: 35.0, lowStockThreshold: 50, category: "Spices" }
  ],
  customers: [
    { _id: "c_goldex", name: "Goldex Global Imports LLC", mobile: "+14155552671", address: "San Francisco, CA, USA", businessType: "Wholesaler", outstandingBalance: 4500, branchId: "b_colombo", createdBy: "u_marketing" },
    { _id: "c_eurofoods", name: "EuroFoods Hamburg Gmbh", mobile: "+49405559812", address: "Hamburg, Germany", businessType: "Distributor", outstandingBalance: 0, branchId: "b_colombo", createdBy: "u_marketing" },
    { _id: "c_asiafood", name: "AsiaFood Import KK", mobile: "+81355556290", address: "Tokyo, Japan", businessType: "Retailer", outstandingBalance: 1200, branchId: "b_colombo", createdBy: "u_marketing" }
  ],
  sales: [
    {
      _id: "s_01",
      invoiceNumber: "INV-20260615-001",
      customerId: "c_goldex",
      branchId: "b_colombo",
      products: [{ productId: "p_tea", productName: "Premium Ceylon Tea (1kg)", quantity: 500, unitPrice: 15.0, amount: 7500 }],
      totalAmount: 7500,
      paidAmount: 3000,
      outstandingAmount: 4500,
      deliveryStatus: "completed",
      paymentStatus: "partially_paid",
      createdBy: "u_marketing",
      createdAt: new Date("2026-06-15T10:00:00Z")
    },
    {
      _id: "s_02",
      invoiceNumber: "INV-20260618-002",
      customerId: "c_eurofoods",
      branchId: "b_colombo",
      products: [{ productId: "p_cinnamon", productName: "Organic Cinnamon Quills (500g)", quantity: 200, unitPrice: 22.0, amount: 4400 }],
      totalAmount: 4400,
      paidAmount: 4400,
      outstandingAmount: 0,
      deliveryStatus: "delivered",
      paymentStatus: "paid",
      createdBy: "u_marketing",
      createdAt: new Date("2026-06-18T14:30:00Z")
    },
    {
      _id: "s_03",
      invoiceNumber: "INV-20260620-003",
      customerId: "c_asiafood",
      branchId: "b_colombo",
      products: [{ productId: "p_pepper", productName: "Black Pepper Whole (1kg)", quantity: 150, unitPrice: 11.5, amount: 1725 }],
      totalAmount: 1725,
      paidAmount: 525,
      outstandingAmount: 1200,
      deliveryStatus: "on_going",
      paymentStatus: "partially_paid",
      createdBy: "u_marketing",
      createdAt: new Date("2026-06-20T09:15:00Z")
    }
  ],
  purchases: [
    {
      _id: "po_01",
      poNumber: "PO-20260610-001",
      supplierName: "Nuwara Eliya Tea Estates",
      products: [{ productName: "Premium Ceylon Tea (1kg)", quantity: 2000, costPrice: 8.5, amount: 17000 }],
      totalAmount: 17000,
      paymentStatus: "paid",
      createdAt: new Date("2026-06-10T08:00:00Z")
    },
    {
      _id: "po_02",
      poNumber: "PO-20260612-002",
      supplierName: "Matale Spice Farmers Coop",
      products: [{ productName: "Organic Cinnamon Quills (500g)", quantity: 100, costPrice: 12.0, amount: 1200 }],
      totalAmount: 1200,
      paymentStatus: "paid",
      createdAt: new Date("2026-06-12T11:00:00Z")
    },
    {
      _id: "po_03",
      poNumber: "PO-20260614-003",
      supplierName: "Matale Spice Farmers Coop",
      products: [{ productName: "Black Pepper Whole (1kg)", quantity: 500, costPrice: 6.0, amount: 3000 }],
      totalAmount: 3000,
      paymentStatus: "paid",
      createdAt: new Date("2026-06-14T15:00:00Z")
    }
  ],
  expenses: [
    { _id: "e_01", date: new Date("2026-06-16T12:00:00Z"), description: "Vehicle fuel for marketing trip", category: "fuel", amount: 350, branchId: "b_colombo", addedBy: "u_marketing" },
    { _id: "e_02", date: new Date("2026-06-17T09:00:00Z"), description: "Office electricity bill June", category: "electricity", amount: 650, branchId: "b_colombo", addedBy: "u_admin" },
    { _id: "e_03", date: new Date("2026-06-19T10:00:00Z"), description: "Office stationary supplies", category: "office", amount: 150, branchId: "b_colombo", addedBy: "u_admin" },
    { _id: "e_04", date: new Date("2026-06-20T17:00:00Z"), description: "Staff salary advance", category: "salary", amount: 2000, branchId: "b_colombo", addedBy: "u_superadmin" }
  ],
  payments: [
    { _id: "pay_01", invoiceNumber: "INV-20260615-001", customerId: "c_goldex", amountReceived: 3000, paymentMethod: "bank_transfer", date: new Date("2026-06-15T11:00:00Z"), receivedBy: "u_marketing" },
    { _id: "pay_02", invoiceNumber: "INV-20260618-002", customerId: "c_eurofoods", amountReceived: 4400, paymentMethod: "bank_transfer", date: new Date("2026-06-18T15:00:00Z"), receivedBy: "u_marketing" },
    { _id: "pay_03", invoiceNumber: "INV-20260620-003", customerId: "c_asiafood", amountReceived: 525, paymentMethod: "cash", date: new Date("2026-06-20T10:00:00Z"), receivedBy: "u_marketing" }
  ]
};

const loadData = () => {
  try {
    if (!fs.existsSync(FILE_PATH)) {
      fs.writeFileSync(FILE_PATH, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    const content = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error loading fallback data:', err);
    return defaultData;
  }
};

const saveData = (data) => {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error saving fallback data:', err);
  }
};

const db = {
  getCollection: (name) => {
    const data = loadData();
    return data[name] || [];
  },

  saveCollection: (name, items) => {
    const data = loadData();
    data[name] = items;
    saveData(data);
  },

  find: (collectionName, query = {}) => {
    const items = db.getCollection(collectionName);
    return items.filter(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  },

  findOne: (collectionName, query = {}) => {
    const items = db.getCollection(collectionName);
    return items.find(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  },

  findById: (collectionName, id) => {
    const items = db.getCollection(collectionName);
    return items.find(item => item._id === id);
  },

  insertOne: (collectionName, doc) => {
    const items = db.getCollection(collectionName);
    const newDoc = {
      _id: doc._id || Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      ...doc
    };
    items.push(newDoc);
    db.saveCollection(collectionName, items);
    return newDoc;
  },

  updateOne: (collectionName, query, update) => {
    const items = db.getCollection(collectionName);
    const index = items.findIndex(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
    if (index === -1) return null;

    // Apply basic $set modifications if structure is {$set: {...}} or direct properties
    const setObj = update.$set ? update.$set : update;
    items[index] = { ...items[index], ...setObj, updatedAt: new Date() };
    db.saveCollection(collectionName, items);
    return items[index];
  },

  updateById: (collectionName, id, update) => {
    return db.updateOne(collectionName, { _id: id }, update);
  },

  deleteOne: (collectionName, query) => {
    const items = db.getCollection(collectionName);
    const index = items.findIndex(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
    if (index === -1) return false;
    items.splice(index, 1);
    db.saveCollection(collectionName, items);
    return true;
  },

  deleteById: (collectionName, id) => {
    return db.deleteOne(collectionName, { _id: id });
  }
};

module.exports = db;
