var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  default: () => server_default
});
module.exports = __toCommonJS(server_exports);
var import_express11 = __toESM(require("express"), 1);
var import_path2 = __toESM(require("path"), 1);

// src/api/index.ts
var import_express10 = __toESM(require("express"), 1);

// src/api/auth.ts
var import_express = __toESM(require("express"), 1);
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"), 1);

// src/lib/firebase-db.ts
var import_app = require("firebase/app");
var import_firestore = require("firebase/firestore");
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
async function withTimeout(promise, timeoutMs = 3500) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Firestore operation timeout")), timeoutMs);
  });
  promise.catch((err) => {
    console.warn("[Database] Background Firestore operation failed or timed out:", err.message || err);
  });
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}
var firestoreDb = null;
var isFirebaseAvailable = false;
try {
  let firebaseConfig = {
    apiKey: "AIzaSyDHnlmY5BMs8yps7A0UaVO6WfY33Cbjvg0",
    authDomain: "mellodidatabase.firebaseapp.com",
    projectId: "mellodidatabase",
    storageBucket: "mellodidatabase.firebasestorage.app",
    messagingSenderId: "762274784498",
    appId: "1:762274784498:web:1b6fb8f376975069e31c6b",
    measurementId: "G-SZDNTTJSPS"
  };
  if (process.env.FIREBASE_API_KEY) {
    firebaseConfig = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      firestoreDatabaseId: process.env.FIREBASE_FIRESTORE_DATABASE_ID
    };
  }
  if (firebaseConfig && firebaseConfig.apiKey) {
    const app2 = (0, import_app.initializeApp)(firebaseConfig);
    firestoreDb = firebaseConfig.firestoreDatabaseId ? (0, import_firestore.getFirestore)(app2, firebaseConfig.firestoreDatabaseId) : (0, import_firestore.getFirestore)(app2);
    isFirebaseAvailable = true;
    console.log("[Database] Successfully connected to Google Cloud Firestore Environment");
  } else {
    console.log("[Database] Firebase configuration not found. Falling back to local file environment.");
  }
} catch (e) {
  console.warn("[Database] Firebase initialization skipped or failed. Falling back to local file environment.", e);
}
var localDbPath = import_path.default.join(process.cwd(), "local_db.json");
var DEFAULT_LOCAL_DB = {
  users: [
    {
      id: "u-admin",
      name: "Mellodi Admin",
      email: "admin@mellodi.com",
      phone: "0123456789",
      password: "$2b$10$CZ33M5295rSHKjGNPyrdnOxIOMIhMypsbzeek.E43tNtNCE9b8CTO",
      // Hashed "Abc@123"
      walletBalance: 1e6,
      lenPoints: 5e4,
      tier: "Gold",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  ],
  orders: [],
  transactions: [],
  redeemedGifts: [],
  educationConsultations: [],
  notifications: [
    {
      id: "notif-welcome",
      userId: "u-admin",
      title: {
        vi: "Ch\xE0o m\u1EEBng \u0111\u1EBFn v\u1EDBi Mellodi Loyalty!",
        en: "Welcome to Mellodi Loyalty!",
        ko: "\uBA5C\uB85C\uB514 \uB85C\uC5F4\uD2F0\uC5D0 \uC624\uC2E0 \uAC83\uC744 \uD658\uC601\uD569\uB2C8\uB2E4!"
      },
      message: {
        vi: "Ch\xE0o m\u1EEBng Admin \u0111\u1EBFn v\u1EDBi h\u1EC7 th\u1ED1ng Mellodi Coffee Loyalty.",
        en: "Welcome Admin to Mellodi Coffee Loyalty system.",
        ko: "\uBA5C\uB85C\uB514 \uCEE4\uD53C \uB85C\uC5F4\uD2F0 h\u1EC7 th\u1ED1ng\uC5D0 \uC624\uC2E0 \uAC83\uC744 \uD658\uC601\uD569\uB2C8\uB2E4."
      },
      type: "system",
      date: (/* @__PURE__ */ new Date()).toLocaleString(),
      isRead: false
    }
  ]
};
function readLocalDb() {
  try {
    if (import_fs.default.existsSync(localDbPath)) {
      const content = import_fs.default.readFileSync(localDbPath, "utf-8");
      const data = JSON.parse(content);
      if (!data.users) data.users = [];
      if (!data.orders) data.orders = [];
      if (!data.transactions) data.transactions = [];
      if (!data.redeemedGifts) data.redeemedGifts = [];
      if (!data.notifications) data.notifications = [];
      return data;
    }
  } catch (err) {
    console.error("[Database] Failed to read local_db.json file:", err);
  }
  writeLocalDb(DEFAULT_LOCAL_DB);
  return DEFAULT_LOCAL_DB;
}
function writeLocalDb(data) {
  try {
    import_fs.default.writeFileSync(localDbPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("[Database] Failed to write local_db.json file:", err);
  }
}
async function getUser(userId) {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      const userRef = (0, import_firestore.doc)(firestoreDb, "users", userId);
      const userSnap = await withTimeout((0, import_firestore.getDoc)(userRef));
      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() };
      }
      return null;
    } catch (e) {
      console.error("[Database] Error getting user from Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  return db.users.find((u) => u.id === userId) || null;
}
async function getUserByEmail(email) {
  const cleanEmail = email.toLowerCase().trim();
  if (isFirebaseAvailable && firestoreDb) {
    try {
      const q = (0, import_firestore.query)((0, import_firestore.collection)(firestoreDb, "users"), (0, import_firestore.where)("email", "==", cleanEmail));
      const querySnap = await withTimeout((0, import_firestore.getDocs)(q));
      if (!querySnap.empty) {
        const docSnap = querySnap.docs[0];
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (e) {
      console.error("[Database] Error getting user by email from Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  return db.users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
}
async function createUser(user) {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      await withTimeout((0, import_firestore.setDoc)((0, import_firestore.doc)(firestoreDb, "users", user.id), user));
      return;
    } catch (e) {
      console.error("[Database] Error creating user in Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  db.users.push(user);
  writeLocalDb(db);
}
async function updateUser(userId, updates) {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      const userRef = (0, import_firestore.doc)(firestoreDb, "users", userId);
      await withTimeout((0, import_firestore.updateDoc)(userRef, updates));
      const userSnap = await withTimeout((0, import_firestore.getDoc)(userRef));
      return { id: userSnap.id, ...userSnap.data() };
    } catch (e) {
      console.error("[Database] Error updating user in Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  const index = db.users.findIndex((u) => u.id === userId);
  if (index !== -1) {
    db.users[index] = { ...db.users[index], ...updates };
    writeLocalDb(db);
    return db.users[index];
  }
  return null;
}
async function createOrder(order) {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      await withTimeout((0, import_firestore.setDoc)((0, import_firestore.doc)(firestoreDb, "orders", order.id), order));
      return;
    } catch (e) {
      console.error("[Database] Error creating order in Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  db.orders.unshift(order);
  writeLocalDb(db);
}
async function getUserOrders(userId) {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      const q = (0, import_firestore.query)((0, import_firestore.collection)(firestoreDb, "orders"), (0, import_firestore.where)("userId", "==", userId));
      const querySnap = await withTimeout((0, import_firestore.getDocs)(q));
      const orders = querySnap.docs.map((doc2) => ({ id: doc2.id, ...doc2.data() }));
      return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e) {
      console.error("[Database] Error getting user orders from Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  return db.orders.filter((o) => o.userId === userId);
}
async function getOrder(orderId) {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      const orderRef = (0, import_firestore.doc)(firestoreDb, "orders", orderId);
      const orderSnap = await withTimeout((0, import_firestore.getDoc)(orderRef));
      if (orderSnap.exists()) {
        return { id: orderSnap.id, ...orderSnap.data() };
      }
      return null;
    } catch (e) {
      console.error("[Database] Error getting order from Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  return db.orders.find((o) => o.id === orderId) || null;
}
async function updateOrder(orderId, updates) {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      const orderRef = (0, import_firestore.doc)(firestoreDb, "orders", orderId);
      await withTimeout((0, import_firestore.updateDoc)(orderRef, updates));
      const orderSnap = await withTimeout((0, import_firestore.getDoc)(orderRef));
      return { id: orderSnap.id, ...orderSnap.data() };
    } catch (e) {
      console.error("[Database] Error updating order in Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  const index = db.orders.findIndex((o) => o.id === orderId);
  if (index !== -1) {
    db.orders[index] = { ...db.orders[index], ...updates };
    writeLocalDb(db);
    return db.orders[index];
  }
  return null;
}
async function createTransaction(tx) {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      await withTimeout((0, import_firestore.setDoc)((0, import_firestore.doc)(firestoreDb, "transactions", tx.id), tx));
      return;
    } catch (e) {
      console.error("[Database] Error creating transaction in Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  db.transactions.push(tx);
  writeLocalDb(db);
}
async function getUserTransactions(userId) {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      const q = (0, import_firestore.query)((0, import_firestore.collection)(firestoreDb, "transactions"), (0, import_firestore.where)("userId", "==", userId));
      const querySnap = await withTimeout((0, import_firestore.getDocs)(q));
      const txs = querySnap.docs.map((doc2) => ({ id: doc2.id, ...doc2.data() }));
      return txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e) {
      console.error("[Database] Error getting transactions from Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  return db.transactions.filter((t) => t.userId === userId);
}
async function createRedeemedGift(gift) {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      await withTimeout((0, import_firestore.setDoc)((0, import_firestore.doc)(firestoreDb, "redeemedGifts", gift.id), gift));
      return;
    } catch (e) {
      console.error("[Database] Error creating redeemed gift in Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  if (!db.redeemedGifts) db.redeemedGifts = [];
  db.redeemedGifts.unshift(gift);
  writeLocalDb(db);
}
async function getUserRedeemedGifts(userId) {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      const q = (0, import_firestore.query)((0, import_firestore.collection)(firestoreDb, "redeemedGifts"), (0, import_firestore.where)("userId", "==", userId));
      const querySnap = await withTimeout((0, import_firestore.getDocs)(q));
      const gifts = querySnap.docs.map((doc2) => ({ id: doc2.id, ...doc2.data() }));
      return gifts.sort((a, b) => new Date(b.redeemedDate).getTime() - new Date(a.redeemedDate).getTime());
    } catch (e) {
      console.error("[Database] Error getting user redeemed gifts from Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  return (db.redeemedGifts || []).filter((g) => g.userId === userId);
}
async function getRedeemedGift(giftId) {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      const giftRef = (0, import_firestore.doc)(firestoreDb, "redeemedGifts", giftId);
      const giftSnap = await withTimeout((0, import_firestore.getDoc)(giftRef));
      if (giftSnap.exists()) {
        return { id: giftSnap.id, ...giftSnap.data() };
      }
      return null;
    } catch (e) {
      console.error("[Database] Error getting redeemed gift from Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  return (db.redeemedGifts || []).find((g) => g.id === giftId) || null;
}
async function updateRedeemedGift(giftId, updates) {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      const giftRef = (0, import_firestore.doc)(firestoreDb, "redeemedGifts", giftId);
      await withTimeout((0, import_firestore.updateDoc)(giftRef, updates));
      const giftSnap = await withTimeout((0, import_firestore.getDoc)(giftRef));
      return { id: giftSnap.id, ...giftSnap.data() };
    } catch (e) {
      console.error("[Database] Error updating redeemed gift in Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  if (!db.redeemedGifts) db.redeemedGifts = [];
  const index = db.redeemedGifts.findIndex((g) => g.id === giftId);
  if (index !== -1) {
    db.redeemedGifts[index] = { ...db.redeemedGifts[index], ...updates };
    writeLocalDb(db);
    return db.redeemedGifts[index];
  }
  return null;
}
async function getUserNotifications(userId) {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      const q = (0, import_firestore.query)((0, import_firestore.collection)(firestoreDb, "notifications"), (0, import_firestore.where)("userId", "==", userId));
      const querySnap = await withTimeout((0, import_firestore.getDocs)(q));
      const notifs = querySnap.docs.map((doc2) => ({ id: doc2.id, ...doc2.data() }));
      return notifs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e) {
      console.error("[Database] Error getting user notifications from Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  return (db.notifications || []).filter((n) => n.userId === userId);
}
async function createNotification(notification) {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      await withTimeout((0, import_firestore.setDoc)((0, import_firestore.doc)(firestoreDb, "notifications", notification.id), notification));
      return;
    } catch (e) {
      console.error("[Database] Error creating notification in Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  if (!db.notifications) db.notifications = [];
  db.notifications.unshift(notification);
  writeLocalDb(db);
}
async function markNotificationRead(notificationId, userId) {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      const ref = (0, import_firestore.doc)(firestoreDb, "notifications", notificationId);
      await withTimeout((0, import_firestore.updateDoc)(ref, { isRead: true }));
      return;
    } catch (e) {
      console.error("[Database] Error marking notification read in Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  if (!db.notifications) db.notifications = [];
  const index = db.notifications.findIndex((n) => n.id === notificationId && n.userId === userId);
  if (index !== -1) {
    db.notifications[index].isRead = true;
    writeLocalDb(db);
  }
}
async function getTransaction(txId) {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      const txRef = (0, import_firestore.doc)(firestoreDb, "transactions", txId);
      const txSnap = await withTimeout((0, import_firestore.getDoc)(txRef));
      if (txSnap.exists()) {
        return { id: txSnap.id, ...txSnap.data() };
      }
      return null;
    } catch (e) {
      console.error("[Database] Error getting transaction from Firestore:", e);
    }
  }
  const db = readLocalDb();
  return db.transactions.find((t) => t.id === txId) || null;
}
async function updateTransaction(txId, updates) {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      const txRef = (0, import_firestore.doc)(firestoreDb, "transactions", txId);
      await withTimeout((0, import_firestore.updateDoc)(txRef, updates));
      const txSnap = await withTimeout((0, import_firestore.getDoc)(txRef));
      return { id: txSnap.id, ...txSnap.data() };
    } catch (e) {
      console.error("[Database] Error updating transaction in Firestore:", e);
    }
  }
  const db = readLocalDb();
  const index = db.transactions.findIndex((t) => t.id === txId);
  if (index !== -1) {
    db.transactions[index] = { ...db.transactions[index], ...updates };
    writeLocalDb(db);
    return db.transactions[index];
  }
  return null;
}
async function markAllNotificationsRead(userId) {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      const q = (0, import_firestore.query)(
        (0, import_firestore.collection)(firestoreDb, "notifications"),
        (0, import_firestore.where)("userId", "==", userId),
        (0, import_firestore.where)("isRead", "==", false)
      );
      const querySnap = await withTimeout((0, import_firestore.getDocs)(q));
      const promises = querySnap.docs.map((d) => withTimeout((0, import_firestore.updateDoc)((0, import_firestore.doc)(firestoreDb, "notifications", d.id), { isRead: true })));
      await Promise.all(promises);
      return;
    } catch (e) {
      console.error("[Database] Error marking all notifications read in Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  if (!db.notifications) db.notifications = [];
  db.notifications.forEach((n) => {
    if (n.userId === userId) {
      n.isRead = true;
    }
  });
  writeLocalDb(db);
}
async function deleteNotification(notificationId, userId) {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      await withTimeout((0, import_firestore.deleteDoc)((0, import_firestore.doc)(firestoreDb, "notifications", notificationId)));
      return;
    } catch (e) {
      console.error("[Database] Error deleting notification in Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  if (!db.notifications) db.notifications = [];
  db.notifications = db.notifications.filter((n) => !(n.id === notificationId && n.userId === userId));
  writeLocalDb(db);
}
async function getAllUsers() {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      const querySnap = await withTimeout((0, import_firestore.getDocs)((0, import_firestore.collection)(firestoreDb, "users")));
      return querySnap.docs.map((doc2) => ({ id: doc2.id, ...doc2.data() }));
    } catch (e) {
      console.error("[Database] Error getting all users from Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  return db.users;
}
async function getAllOrdersGlobal() {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      const querySnap = await withTimeout((0, import_firestore.getDocs)((0, import_firestore.collection)(firestoreDb, "orders")));
      const orders = querySnap.docs.map((doc2) => ({ id: doc2.id, ...doc2.data() }));
      return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e) {
      console.error("[Database] Error getting all orders from Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  return db.orders;
}
async function getAllTransactionsGlobal() {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      const querySnap = await withTimeout((0, import_firestore.getDocs)((0, import_firestore.collection)(firestoreDb, "transactions")));
      const txs = querySnap.docs.map((doc2) => ({ id: doc2.id, ...doc2.data() }));
      return txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e) {
      console.error("[Database] Error getting all transactions from Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  return db.transactions;
}
async function createEducationConsultation(consultation) {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      await withTimeout((0, import_firestore.setDoc)((0, import_firestore.doc)(firestoreDb, "educationConsultations", consultation.id), consultation));
      return;
    } catch (e) {
      console.error("[Database] Error creating education consultation in Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  if (!db.educationConsultations) db.educationConsultations = [];
  db.educationConsultations.push(consultation);
  writeLocalDb(db);
}
async function getAllEducationConsultationsGlobal() {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      const querySnap = await withTimeout((0, import_firestore.getDocs)((0, import_firestore.collection)(firestoreDb, "educationConsultations")));
      const consultations = querySnap.docs.map((doc2) => ({ id: doc2.id, ...doc2.data() }));
      return consultations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (e) {
      console.error("[Database] Error getting all education consultations from Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  return db.educationConsultations || [];
}

// src/api/sse.ts
var clients = /* @__PURE__ */ new Map();
function addClient(userId, res) {
  if (!clients.has(userId)) {
    clients.set(userId, []);
  }
  clients.get(userId).push(res);
  console.log(`[SSE] Client connected for user ${userId}. Total clients for user: ${clients.get(userId).length}`);
}
function removeClient(userId, res) {
  const userClients = clients.get(userId);
  if (userClients) {
    const index = userClients.indexOf(res);
    if (index !== -1) {
      userClients.splice(index, 1);
    }
    if (userClients.length === 0) {
      clients.delete(userId);
    }
    console.log(`[SSE] Client disconnected for user ${userId}. Remaining clients: ${userClients.length}`);
  }
}
function sendSSEEvent(userId, eventName, data) {
  const userClients = clients.get(userId);
  if (userClients && userClients.length > 0) {
    console.log(`[SSE] Sending event "${eventName}" to user ${userId} (${userClients.length} connections)`);
    userClients.forEach((res) => {
      try {
        res.write(`event: ${eventName}
`);
        res.write(`data: ${JSON.stringify(data)}

`);
      } catch (err) {
        console.error(`[SSE] Failed to write to client for user ${userId}:`, err);
      }
    });
    return true;
  }
  console.log(`[SSE] User ${userId} is offline. Event "${eventName}" not sent via SSE.`);
  return false;
}

// src/api/utils.ts
async function addNotification(userId, title, message, type) {
  const notif = {
    id: `notif-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    userId,
    title,
    message,
    type,
    date: (/* @__PURE__ */ new Date()).toLocaleString(),
    isRead: false
  };
  await createNotification(notif);
  sendSSEEvent(userId, "notification_received", { notification: notif });
  return notif;
}
async function updateUserPointsAndTier(userId, additionalPoints, additionalWalletBalance = 0) {
  try {
    const user = await getUser(userId);
    if (!user) return null;
    const newPoints = user.lenPoints + additionalPoints;
    const newBalance = user.walletBalance + additionalWalletBalance;
    let newTier = user.tier;
    if (newPoints >= 5e4) newTier = "Gold";
    else if (newPoints >= 2e4) newTier = "Green";
    else newTier = "Welcome";
    const isTierUpgraded = newTier !== user.tier && (user.tier === "Welcome" && (newTier === "Green" || newTier === "Gold") || user.tier === "Green" && newTier === "Gold");
    const updatedUser = await updateUser(userId, {
      lenPoints: newPoints,
      walletBalance: newBalance,
      tier: newTier
    });
    if (!updatedUser) return null;
    const { password: _, ...safeUser } = updatedUser;
    sendSSEEvent(userId, "wallet_updated", { user: safeUser });
    if (isTierUpgraded) {
      const voucherCode = newTier === "Gold" ? "WELCOMEGOLD" : "WELCOMEGREEN";
      const discountValue = newTier === "Gold" ? 50 : 30;
      const newVoucher = {
        id: `vc-tier-${newTier.toLowerCase()}-${Date.now()}`,
        code: voucherCode,
        title: {
          vi: `Ch\xE0o M\u1EEBng H\u1EA1ng ${newTier} - Gi\u1EA3m ${discountValue}%`,
          en: `${newTier} Tier Welcome - ${discountValue}% Off`,
          ko: `${newTier} \uB4F1\uAE09 \uD658\uC601 \uCFE0\uD3F0 - ${discountValue}% \uD560\uC778`
        },
        description: {
          vi: `Voucher \u0111\u1EB7c quy\u1EC1n khi th\u0103ng h\u1EA1ng ${newTier}. Gi\u1EA3m ${discountValue}% cho \u0111\u01A1n h\xE0ng ti\u1EBFp theo.`,
          en: `Exclusive reward voucher for upgrading to ${newTier} tier. Get ${discountValue}% off your next order.`,
          ko: `${newTier} \uB4F1\uAE09 \uC2B9\uAE09 \uCD95\uD558 \uC804\uC6A9 \uD61C\uD0DD. \uB2E4\uC74C \uC8FC\uBB38 \uC2DC ${discountValue}% \uD2B9\uBCC4 \uD560\uC778.`
        },
        discountType: "percent",
        value: discountValue,
        minOrderVND: 3e4,
        minOrderKRW: 2e3,
        minOrderUSD: 1.5,
        claimed: true,
        used: false,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0]
        // 90 days
      };
      sendSSEEvent(userId, "voucher_issued", { voucher: newVoucher });
      await addNotification(
        userId,
        {
          vi: `\u{1F389} Th\u0103ng h\u1EA1ng th\xE0nh vi\xEAn ${newTier}!`,
          en: `\u{1F389} Upgraded to ${newTier} Tier!`,
          ko: `\u{1F389} ${newTier} \uB4F1\uAE09 \uC2B9\uAE09 \uC644\uB8CC!`
        },
        {
          vi: `Ch\xFAc m\u1EEBng b\u1EA1n \u0111\xE3 \u0111\u1EA1t h\u1EA1ng th\xE0nh vi\xEAn ${newTier}. Mellodi \u0111\xE3 t\u1EB7ng b\u1EA1n m\u1ED9t Voucher \u01B0u \u0111\xE3i gi\u1EA3m ${discountValue}%!`,
          en: `Congratulations on reaching ${newTier} membership tier. We have added a ${discountValue}% discount Voucher to your wallet!`,
          ko: `\uADC0\uD558\uC758 \uACC4\uC815\uC774 ${newTier} \uB4F1\uAE09\uC73C\uB85C \uC2B9\uAE09\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uB4F1\uAE09 \uC2B9\uAE09 \uCD95\uD558 \uC120\uBB3C\uB85C ${discountValue}% \uD560\uC778 \uCFE0\uD3F0\uC774 \uBC1C\uAE09\uB418\uC5C8\uC2B5\uB2C8\uB2E4!`
        },
        "system"
      );
      sendSSEEvent(userId, "tier_upgraded", { tier: newTier, voucher: newVoucher });
    }
    return updatedUser;
  } catch (error) {
    console.error("[Database] Error in updateUserPointsAndTier:", error);
    return null;
  }
}

// src/api/middleware.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var JWT_SECRET = process.env.JWT_SECRET || "mellodi-premium-loyalty-secret-key";
async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Kh\xF4ng t\xECm th\u1EA5y m\xE3 token x\xE1c th\u1EF1c! Vui l\xF2ng \u0111\u0103ng nh\u1EADp." });
  }
  try {
    const decoded = import_jsonwebtoken.default.verify(token, JWT_SECRET);
    const user = await getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: "T\xE0i kho\u1EA3n li\xEAn k\u1EBFt v\u1EDBi token n\xE0y kh\xF4ng t\u1ED3n t\u1EA1i!" });
    }
    const { password: _, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (err) {
    return res.status(403).json({ error: "M\xE3 token x\xE1c th\u1EF1c \u0111\xE3 h\u1EBFt h\u1EA1n ho\u1EB7c kh\xF4ng h\u1EE3p l\u1EC7!" });
  }
}

// src/api/auth.ts
var router = import_express.default.Router();
function generateToken(user) {
  return import_jsonwebtoken2.default.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
    // Token valid for 7 days
  );
}
router.post("/register", async (req, res) => {
  let { name, email, phone, password } = req.body;
  if (typeof name !== "string" || typeof email !== "string" || typeof phone !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "D\u1EEF li\u1EC7u \u0111\u0103ng k\xFD kh\xF4ng h\u1EE3p l\u1EC7! C\xE1c tr\u01B0\u1EDDng b\u1EAFt bu\u1ED9c ph\u1EA3i l\xE0 d\u1EA1ng chu\u1ED7i." });
  }
  name = name.trim();
  email = email.trim().toLowerCase();
  phone = phone.trim();
  password = password.trim();
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ error: "Vui l\xF2ng nh\u1EADp \u0111\u1EA7y \u0111\u1EE7 c\xE1c tr\u01B0\u1EDDng th\xF4ng tin b\u1EAFt bu\u1ED9c!" });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "\u0110\u1ECBa ch\u1EC9 email kh\xF4ng h\u1EE3p l\u1EC7!" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "M\u1EADt kh\u1EA9u ph\u1EA3i ch\u1EE9a \xEDt nh\u1EA5t 6 k\xFD t\u1EF1!" });
  }
  try {
    const existing = await getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "Email n\xE0y \u0111\xE3 \u0111\u01B0\u1EE3c s\u1EED d\u1EE5ng \u0111\u1EC3 \u0111\u0103ng k\xFD th\xE0nh vi\xEAn!" });
    }
    const hashedPassword = await import_bcryptjs.default.hash(password, 10);
    const newUser = {
      id: `u-${Math.random().toString(36).substring(2, 9)}`,
      name,
      email,
      phone,
      password: hashedPassword,
      walletBalance: 0,
      lenPoints: 0,
      tier: "Welcome",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await createUser(newUser);
    await addNotification(
      newUser.id,
      {
        vi: "Ch\xE0o m\u1EEBng \u0111\u1EBFn v\u1EDBi Mellodi Loyalty!",
        en: "Welcome to Mellodi Loyalty!",
        ko: "\uBA5C\uB85C\uB514 \uB85C\uC5F4\uD2F0\uC5D0 \uC624\uC2E0 \uAC83\uC744 \uD658\uC601\uD569\uB2C8\uB2E4!"
      },
      {
        vi: `Ch\xE0o m\u1EEBng ${name} \u0111\u1EBFn v\u1EDBi Mellodi Coffee. H\xE3y tr\u1EA3i nghi\u1EC7m \u0111\u1EB7t m\xF3n, n\u1EA1p ti\u1EC1n v\xED nh\u1EADn 10% th\u01B0\u1EDFng LEN v\xE0 \u0111\u1ED5i nhi\u1EC1u qu\xE0 t\u1EB7ng gi\xE1 tr\u1ECB nh\xE9!`,
        en: `Welcome ${name} to Mellodi Coffee. Start placing orders, topping up your wallet to get 10% LEN rewards, and redeem exciting gifts!`,
        ko: `${name}\uB2D8, \uBA5C\uB85C\uB514 \uCEE4\uD53C\uC5D0 \uC624\uC2E0 \uAC83\uC744 \uD658\uC601\uD569\uB2C8\uB2E4. \uC8FC\uBB38\uD558\uACE0 \uCDA9\uC804\uD558\uC5EC 10% LEN \uD3EC\uC778\uD2B8\uB97C \uC801\uB9BD\uD558\uACE0 \uB2E4\uC591\uD55C \uC120\uBB3C\uC744 \uBC1B\uC544\uBCF4\uC138\uC694!`
      },
      "system"
    );
    const token = generateToken(newUser);
    const { password: _, ...safeUser } = newUser;
    res.json({ success: true, user: safeUser, token });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "L\u1ED7i h\u1EC7 th\u1ED1ng \u0111\u0103ng k\xFD t\xE0i kho\u1EA3n." });
  }
});
router.post("/login", async (req, res) => {
  let { email, password } = req.body;
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "D\u1EEF li\u1EC7u \u0111\u0103ng nh\u1EADp kh\xF4ng h\u1EE3p l\u1EC7!" });
  }
  email = email.trim().toLowerCase();
  password = password.trim();
  if (!email || !password) {
    return res.status(400).json({ error: "Vui l\xF2ng nh\u1EADp email v\xE0 m\u1EADt kh\u1EA9u!" });
  }
  try {
    const user = await getUserByEmail(email);
    if (!user || !user.password) {
      return res.status(401).json({ error: "Email ho\u1EB7c m\u1EADt kh\u1EA9u kh\xF4ng ch\xEDnh x\xE1c!" });
    }
    const isPasswordMatch = await import_bcryptjs.default.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: "Email ho\u1EB7c m\u1EADt kh\u1EA9u kh\xF4ng ch\xEDnh x\xE1c!" });
    }
    const token = generateToken(user);
    const { password: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "L\u1ED7i h\u1EC7 th\u1ED1ng \u0111\u0103ng nh\u1EADp." });
  }
});
router.post("/biometric-register", async (req, res) => {
  let { email } = req.body;
  if (typeof email !== "string") {
    return res.status(400).json({ error: "Y\xEAu c\u1EA7u \u0111\u1ECBa ch\u1EC9 email h\u1EE3p l\u1EC7!" });
  }
  email = email.trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ error: "Y\xEAu c\u1EA7u \u0111\u1ECBa ch\u1EC9 email!" });
  }
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y t\xE0i kho\u1EA3n th\xE0nh vi\xEAn v\u1EDBi email n\xE0y!" });
    }
    const biometricToken = "bio_" + Math.random().toString(36).substring(2, 12);
    const updatedUser = await updateUser(user.id, {
      biometricEnabled: true,
      biometricToken
    });
    if (!updatedUser) {
      return res.status(500).json({ error: "Kh\xF4ng th\u1EC3 c\u1EADp nh\u1EADt th\xF4ng tin sinh tr\u1EAFc h\u1ECDc." });
    }
    const { password: _, ...safeUser } = updatedUser;
    res.json({
      success: true,
      user: safeUser,
      token: biometricToken,
      message: "\u0110\u0103ng k\xFD sinh tr\u1EAFc h\u1ECDc th\xE0nh c\xF4ng tr\xEAn Mellodi Secure Enclave!"
    });
  } catch (error) {
    console.error("Biometric register error:", error);
    res.status(500).json({ error: "L\u1ED7i \u0111\u0103ng k\xFD sinh tr\u1EAFc h\u1ECDc." });
  }
});
router.post("/biometric-disable", async (req, res) => {
  let { email } = req.body;
  if (typeof email !== "string") {
    return res.status(400).json({ error: "Y\xEAu c\u1EA7u \u0111\u1ECBa ch\u1EC9 email h\u1EE3p l\u1EC7!" });
  }
  email = email.trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ error: "Y\xEAu c\u1EA7u \u0111\u1ECBa ch\u1EC9 email!" });
  }
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y t\xE0i kho\u1EA3n th\xE0nh vi\xEAn v\u1EDBi email n\xE0y!" });
    }
    const updatedUser = await updateUser(user.id, {
      biometricEnabled: false,
      biometricToken: void 0
    });
    if (!updatedUser) {
      return res.status(500).json({ error: "Kh\xF4ng th\u1EC3 c\u1EADp nh\u1EADt th\xF4ng tin sinh tr\u1EAFc h\u1ECDc." });
    }
    const { password: _, ...safeUser } = updatedUser;
    res.json({ success: true, user: safeUser, message: "\u0110\xE3 t\u1EAFt x\xE1c th\u1EF1c sinh tr\u1EAFc h\u1ECDc th\xE0nh c\xF4ng." });
  } catch (error) {
    console.error("Biometric disable error:", error);
    res.status(500).json({ error: "L\u1ED7i t\u1EAFt sinh tr\u1EAFc h\u1ECDc." });
  }
});
router.post("/biometric-login", async (req, res) => {
  let { email, biometricToken } = req.body;
  if (typeof email !== "string" || typeof biometricToken !== "string") {
    return res.status(400).json({ error: "D\u1EEF li\u1EC7u \u0111\u0103ng nh\u1EADp sinh tr\u1EAFc h\u1ECDc kh\xF4ng h\u1EE3p l\u1EC7!" });
  }
  email = email.trim().toLowerCase();
  biometricToken = biometricToken.trim();
  if (!email || !biometricToken) {
    return res.status(400).json({ error: "Vui l\xF2ng cung c\u1EA5p email v\xE0 m\xE3 x\xE1c th\u1EF1c sinh tr\u1EAFc h\u1ECDc!" });
  }
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y t\xE0i kho\u1EA3n th\xE0nh vi\xEAn li\xEAn k\u1EBFt!" });
    }
    if (!user.biometricEnabled || user.biometricToken !== biometricToken) {
      return res.status(401).json({ error: "X\xE1c th\u1EF1c sinh tr\u1EAFc h\u1ECDc kh\xF4ng kh\u1EDBp ho\u1EB7c \u0111\xE3 h\u1EBFt h\u1EA1n. Vui l\xF2ng \u0111\u0103ng nh\u1EADp l\u1EA1i b\u1EB1ng m\u1EADt kh\u1EA9u!" });
    }
    const jwtToken = generateToken(user);
    const { password: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser, token: jwtToken });
  } catch (error) {
    console.error("Biometric login error:", error);
    res.status(500).json({ error: "L\u1ED7i \u0111\u0103ng nh\u1EADp sinh tr\u1EAFc h\u1ECDc." });
  }
});
var auth_default = router;

// src/api/wallet.ts
var import_express4 = __toESM(require("express"), 1);

// src/api/webhook.ts
var import_express3 = __toESM(require("express"), 1);

// src/api/orders.ts
var import_express2 = __toESM(require("express"), 1);
var router2 = import_express2.default.Router();
var BANK_ID = process.env.BANK_ID || "MB";
var BANK_ACCOUNT = process.env.BANK_ACCOUNT || "090123456789";
var BANK_ACCOUNT_NAME = process.env.BANK_ACCOUNT_NAME || "MELLODI COFFEE";
function startOrderLifecycleSimulation(orderId) {
  setTimeout(async () => {
    try {
      const order = await getOrder(orderId);
      if (!order || order.status !== "preparing") return;
      await updateOrder(orderId, { status: "shipping" });
      sendSSEEvent(order.userId, "order_status_updated", { orderId, status: "shipping" });
      await addNotification(
        order.userId,
        {
          vi: "\u0110\u01A1n h\xE0ng \u0111ang tr\xEAn \u0111\u01B0\u1EDDng giao \u{1F6F5}",
          en: "Your order is on the way \u{1F6F5}",
          ko: "\uBC30\uB2EC b\u1EAFt \u0111\u1EA7u \u{1F6F5}"
        },
        {
          vi: `\u0110\u01A1n h\xE0ng ${order.id} \u0111ang \u0111\u01B0\u1EE3c giao t\u1EDBi b\u1EA1n b\u1EDFi Mellodi Express. Gi\u1EEF \u0111i\u1EC7n tho\u1EA1i nh\xE9!`,
          en: `Your order ${order.id} is heading your way with Mellodi Express. Keep your phone handy!`,
          ko: `Mellodi Express\uB97C \uD1B5\uD574 \uC8FC\uBB38 ${order.id} \uBC30\uB2EC\uC774 \uC2DC\uC791\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uC804\uD654\uB97C \uC798 \uBC1B\uC544\uC8FC\uC138\uC694!`
        },
        "order"
      );
      setTimeout(async () => {
        try {
          const finishedOrder = await getOrder(orderId);
          if (!finishedOrder || finishedOrder.status !== "shipping") return;
          const pointsEarned = finishedOrder.pointsEarned;
          const updatedUser = await updateUserPointsAndTier(finishedOrder.userId, pointsEarned, 0);
          await updateOrder(orderId, { status: "completed" });
          sendSSEEvent(finishedOrder.userId, "order_status_updated", { orderId, status: "completed" });
          await addNotification(
            finishedOrder.userId,
            {
              vi: "\u0110\u01A1n h\xE0ng ho\xE0n t\u1EA5t & T\xEDch \u0111i\u1EC3m th\xE0nh c\xF4ng \u{1F389}",
              en: "Order Completed & Points Awarded \u{1F389}",
              ko: "\uC8FC\uBB38 \uC644\uB8CC \uBC0F \uD3EC\uC778\uD2B8 \uC801\uB9BD \u{1F389}"
            },
            {
              vi: `\u0110\u01A1n h\xE0ng ${finishedOrder.id} \u0111\xE3 ho\xE0n t\u1EA5t th\xE0nh c\xF4ng! B\u1EA1n nh\u1EADn \u0111\u01B0\u1EE3c +${pointsEarned.toLocaleString("vi-VN")} \u0111i\u1EC3m th\u01B0\u1EDFng LEN (10% gi\xE1 tr\u1ECB h\xF3a \u0111\u01A1n). T\u1ED5ng \u0111i\u1EC3m LEN: ${updatedUser?.lenPoints.toLocaleString("vi-VN") || ""}.`,
              en: `Your order ${finishedOrder.id} is successfully completed! You have been awarded +${pointsEarned.toLocaleString()} LEN reward points (10% of bill). Total points: ${updatedUser?.lenPoints.toLocaleString() || ""} LEN.`,
              ko: `\uC8FC\uBB38 ${finishedOrder.id}\uC774 \uC131\uACF5\uC801\uC73C\uB85C \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4! \uCD1D \uACB0\uC81C \uAE08\uC561 c\u1EE7a 10%\uC778 +${pointsEarned.toLocaleString()} LEN \uD3EC\uC778\uD2B8\uAC00 \uC801\uB9BD\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uBCF4\uC720 \uD3EC\uC778\uD2B8: ${updatedUser?.lenPoints.toLocaleString() || ""} LEN.`
            },
            "order"
          );
        } catch (err) {
          console.error("Error in order completion simulation:", err);
        }
      }, 15e3);
    } catch (err) {
      console.error("Error in order shipping simulation:", err);
    }
  }, 15e3);
}
router2.get("/my-orders", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const userOrders = await getUserOrders(userId);
    res.json(userOrders);
  } catch (error) {
    res.status(500).json({ error: "L\u1ED7i t\u1EA3i l\u1ECBch s\u1EED \u0111\u01A1n h\xE0ng." });
  }
});
router2.post("/", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { items, totalPriceVND, paymentMethod, currency } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Gi\u1ECF h\xE0ng tr\u1ED1ng ho\u1EB7c th\xF4ng tin kh\xF4ng h\u1EE3p l\u1EC7!" });
  }
  try {
    const user = await getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y th\xF4ng tin th\xE0nh vi\xEAn!" });
    }
    if (paymentMethod === "wallet") {
      if (user.walletBalance < totalPriceVND) {
        return res.status(400).json({ error: "S\u1ED1 d\u01B0 v\xED kh\xF4ng \u0111\u1EE7 \u0111\u1EC3 thanh to\xE1n \u0111\u01A1n h\xE0ng n\xE0y!" });
      }
      await updateUser(userId, {
        walletBalance: user.walletBalance - totalPriceVND
      });
    }
    const orderId = `MEL-${Math.floor(1e5 + Math.random() * 9e5)}`;
    const pointsEarned = Math.round(totalPriceVND * 0.1);
    const initialStatus = paymentMethod === "wallet" || paymentMethod === "cash" ? "preparing" : "pending";
    const newOrder = {
      id: orderId,
      userId,
      items,
      totalPrice: totalPriceVND,
      currency: currency || "VND",
      pointsEarned,
      pointsUsed: 0,
      paymentMethod,
      status: initialStatus,
      date: (/* @__PURE__ */ new Date()).toLocaleString()
    };
    await createOrder(newOrder);
    await addNotification(
      userId,
      {
        vi: "\u0110\u1EB7t h\xE0ng th\xE0nh c\xF4ng",
        en: "Order Placed Successfully",
        ko: "\uC8FC\uBB38 \uC644\uB8CC"
      },
      {
        vi: `\u0110\u01A1n h\xE0ng ${orderId} tr\u1ECB gi\xE1 ${totalPriceVND.toLocaleString("vi-VN")}\u0111 \u0111\xE3 \u0111\u01B0\u1EE3c ti\u1EBFp nh\u1EADn qua ph\u01B0\u01A1ng th\u1EE9c ${paymentMethod}. Tr\u1EA1ng th\xE1i: ${initialStatus === "preparing" ? "\u0110ang pha ch\u1EBF" : "Ch\u1EDD thanh to\xE1n"}.`,
        en: `Order ${orderId} worth ${totalPriceVND.toLocaleString()}\u0111 has been received via ${paymentMethod}. Status: ${initialStatus === "preparing" ? "Preparing" : "Pending Payment"}.`,
        ko: `\uC8FC\uBB38 ${orderId}(\uAE08\uC561: ${totalPriceVND.toLocaleString()}\u0111)\uC774 ${paymentMethod} \uACB0\uC81C\uB85C \uC811\uC218\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uC0C1\uD0DC: ${initialStatus === "preparing" ? "\uC74C\uB8CC \uC81C\uC870 \uC911" : "\uB300\uAE30 \uC911"}.`
      },
      "order"
    );
    if (initialStatus === "preparing") {
      startOrderLifecycleSimulation(orderId);
    }
    if (paymentMethod === "vietqr") {
      const memo = `MELLODI ${orderId}`;
      const qrCodeUrl = `https://img.vietqr.io/image/${BANK_ID}-${BANK_ACCOUNT}-compact.png?amount=${totalPriceVND}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(BANK_ACCOUNT_NAME)}`;
      setTimeout(async () => {
        try {
          console.log(`[Automation] Simulating VietQR payment for Order: ${orderId}`);
          await processPayment(memo, totalPriceVND);
        } catch (err) {
          console.error(`[Automation] Failed to auto-process VietQR order payment ${orderId}:`, err);
        }
      }, 8e3);
      const updatedUser2 = await getUser(userId);
      const { password: _2, ...safeUser2 } = updatedUser2;
      return res.json({
        success: true,
        user: safeUser2,
        order: newOrder,
        qrCodeUrl,
        memo,
        bankInfo: {
          bankId: BANK_ID,
          accountNo: BANK_ACCOUNT,
          accountName: BANK_ACCOUNT_NAME
        },
        message: "\u0110\u01A1n h\xE0ng ch\u1EDD thanh to\xE1n. Vui l\xF2ng qu\xE9t m\xE3 VietQR \u0111\u1EC3 ho\xE0n t\u1EA5t."
      });
    }
    const updatedUser = await getUser(userId);
    const { password: _, ...safeUser } = updatedUser;
    res.json({ success: true, user: safeUser, order: newOrder });
  } catch (error) {
    console.error("Order checkout error:", error);
    res.status(500).json({ error: "L\u1ED7i x\u1EED l\xFD \u0111\u1EB7t h\xE0ng." });
  }
});
router2.post("/:orderId/status", async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  if (!["pending", "preparing", "shipping", "completed", "cancelled"].includes(status)) {
    return res.status(400).json({ error: "Tr\u1EA1ng th\xE1i \u0111\u01A1n h\xE0ng kh\xF4ng h\u1EE3p l\u1EC7!" });
  }
  try {
    const order = await getOrder(orderId);
    if (!order) {
      return res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y th\xF4ng tin \u0111\u01A1n h\xE0ng!" });
    }
    const previousStatus = order.status;
    if (previousStatus === status) {
      return res.json({ success: true, order });
    }
    let diffPoints = 0;
    let diffWalletBalance = 0;
    if (status === "completed") {
      if (previousStatus !== "completed") {
        diffPoints = order.pointsEarned;
      }
    } else if (status === "cancelled") {
      if (previousStatus === "completed") {
        diffPoints = -order.pointsEarned;
      }
      if (order.paymentMethod === "wallet") {
        diffWalletBalance = order.totalPrice;
      }
    } else {
      if (previousStatus === "completed") {
        diffPoints = -order.pointsEarned;
      }
    }
    const latestUser = await updateUserPointsAndTier(order.userId, diffPoints, diffWalletBalance);
    const updatedOrder = await updateOrder(orderId, { status });
    sendSSEEvent(order.userId, "order_status_updated", { orderId, status });
    let statusTitle = { vi: "C\u1EADp nh\u1EADt \u0111\u01A1n h\xE0ng", en: "Order Update", ko: "\uC8FC\uBB38 \uC5C5\uB370\uC774\uD2B8" };
    let statusMessage = { vi: `\u0110\u01A1n h\xE0ng ${order.id} \u0111\xE3 chuy\u1EC3n sang tr\u1EA1ng th\xE1i m\u1EDBi.`, en: `Order ${order.id} status updated.`, ko: `\uC8FC\uBB38 ${order.id}\uC758 \uC0C1\uD0DC\uAC00 \uC5C5\uB370\uC774\uD2B8\uB418\uC5C8\uC2B5\uB2C8\uB2E4.` };
    if (status === "preparing") {
      statusTitle = {
        vi: "\u0110\u01A1n h\xE0ng \u0111ang chu\u1EA9n b\u1ECB \u2615",
        en: "Your order is being prepared \u2615",
        ko: "\uC8FC\uBB38 \uC74C\uB8CC \uC81C\uC870 \uC911 \u2615"
      };
      statusMessage = {
        vi: `Barista t\u1EA1i Mellodi \u0111ang b\u1EAFt tay v\xE0o pha ch\u1EBF \u0111\u01A1n h\xE0ng ${order.id} c\u1EE7a b\u1EA1n. H\xE3y ch\u1EDD m\u1ED9t ch\xFAt nh\xE9!`,
        en: `Mellodi Baristas are crafting your order ${order.id}. Hang tight!`,
        ko: `\uBA5C\uB85C\uB514 \uBC14\uB9AC\uC2A4\uD0C0\uAC00 \uC8FC\uBB38 ${order.id} \uC74C\uB8CC\uB97C \uC81C\uC870\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC\uB9CC \uAE30\uB2E4\uB824 \uC8FC\uC138\uC694!`
      };
      startOrderLifecycleSimulation(orderId);
    } else if (status === "shipping") {
      statusTitle = {
        vi: "\u0110\u01A1n h\xE0ng \u0111ang tr\xEAn \u0111\u01B0\u1EDDng giao \u{1F6F5}",
        en: "Your order is on the way \u{1F6F5}",
        ko: "\uBC30\uB2EC b\u1EAFt \u0111\u1EA7u \u{1F6F5}"
      };
      statusMessage = {
        vi: `\u0110\u01A1n h\xE0ng ${order.id} \u0111ang \u0111\u01B0\u1EE3c giao t\u1EDBi b\u1EA1n b\u1EDFi Mellodi Express. Gi\u1EEF \u0111i\u1EC7n tho\u1EA1i nh\xE9!`,
        en: `Your order ${order.id} is heading your way with Mellodi Express. Keep your phone handy!`,
        ko: `Mellodi Express\uB97C \uD1B5\uD574 \uC8FC\uBB38 ${order.id} \uBC30\uB2EC\uC774 \uC2DC\uC791\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uC804\uD654\uB97C \uC798 \uBC1B\uC544\uC8FC\uC138\uC694!`
      };
    } else if (status === "completed") {
      statusTitle = {
        vi: "\u0110\u01A1n h\xE0ng ho\xE0n t\u1EA5t & T\xEDch \u0111i\u1EC3m th\xE0nh c\xF4ng \u{1F389}",
        en: "Order Completed & Points Awarded \u{1F389}",
        ko: "\uC8FC\uBB38 \uC644\uB8CC \uBC0F \uD3EC\uC778\uD2B8 \uC801\uB9BD \u{1F389}"
      };
      statusMessage = {
        vi: `\u0110\u01A1n h\xE0ng ${order.id} \u0111\xE3 ho\xE0n t\u1EA5t th\xE0nh c\xF4ng! B\u1EA1n nh\u1EADn \u0111\u01B0\u1EE3c +${order.pointsEarned.toLocaleString("vi-VN")} \u0111i\u1EC3m th\u01B0\u1EDFng LEN (10% gi\xE1 tr\u1ECB h\xF3a \u0111\u01A1n). T\u1ED5ng \u0111i\u1EC3m LEN: ${(latestUser?.lenPoints || 0).toLocaleString("vi-VN")}.`,
        en: `Your order ${order.id} is successfully completed! You have been awarded +${order.pointsEarned.toLocaleString()} LEN reward points (10% of bill). Total points: ${(latestUser?.lenPoints || 0).toLocaleString()} LEN.`,
        ko: `\uC8FC\uBB38 ${order.id}\uC774 \uC131\uACF5\uC801\uC73C\uB85C \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4! t\u1ED5ng k\u1EBFt t\u1EBF c\u1EE7a 10%\uC778 +${order.pointsEarned.toLocaleString()} LEN \uD3EC\uC778\uD2B8\uAC00 \uC801\uB9BD\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uBCF4\uC720 \u0111i\u1EC3m LEN: ${(latestUser?.lenPoints || 0).toLocaleString()} LEN.`
      };
    } else if (status === "cancelled") {
      statusTitle = {
        vi: "\u0110\u01A1n h\xE0ng \u0111\xE3 h\u1EE7y \u274C",
        en: "Order Cancelled \u274C",
        ko: "\uC8FC\uBB38 \uCDE8\uC18C \u274C"
      };
      statusMessage = {
        vi: `\u0110\u01A1n h\xE0ng ${order.id} \u0111\xE3 b\u1ECB h\u1EE7y. ${order.paymentMethod === "wallet" ? `Mellodi \u0111\xE3 ho\xE0n tr\u1EA3 ${order.totalPrice.toLocaleString("vi-VN")}\u0111 v\xE0o v\xED c\u1EE7a b\u1EA1n.` : ""}`,
        en: `Order ${order.id} has been cancelled. ${order.paymentMethod === "wallet" ? `Mellodi refunded ${order.totalPrice.toLocaleString()}\u0111 to your wallet.` : ""}`,
        ko: `\uC8FC\uBB38 ${order.id}\uC774 \uCDE8\uC18C\uB418\uC5C8\uC2B5\uB2C8\uB2E4. ${order.paymentMethod === "wallet" ? `\uBA5C\uB85C\uB514 e-\uD398\uC774\uB85C ${order.totalPrice.toLocaleString()}\u0111\uAC00 \uD658\uBD88\uB418\uC5C8\uC2B5\uB2C8\uB2E4.` : ""}`
      };
    }
    await addNotification(order.userId, statusTitle, statusMessage, "order");
    const { password: _, ...safeUser } = latestUser;
    res.json({ success: true, user: safeUser, order: updatedOrder });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ error: "L\u1ED7i h\u1EC7 th\u1ED1ng c\u1EADp nh\u1EADt \u0111\u01A1n h\xE0ng." });
  }
});
var orders_default = router2;

// src/api/webhook.ts
var router3 = import_express3.default.Router();
async function processPayment(description, amount) {
  const cleanDesc = description.toUpperCase();
  const txMatch = cleanDesc.match(/TX-[A-Z0-9]+/);
  if (txMatch) {
    const txId = txMatch[0];
    const tx = await getTransaction(txId);
    if (!tx) {
      return { success: false, message: `Kh\xF4ng t\xECm th\u1EA5y m\xE3 giao d\u1ECBch: ${txId}` };
    }
    if (tx.status === "success") {
      return { success: true, message: `Giao d\u1ECBch ${txId} \u0111\xE3 \u0111\u01B0\u1EE3c x\u1EED l\xFD tr\u01B0\u1EDBc \u0111\xF3.` };
    }
    const user = await getUser(tx.userId);
    if (!user) {
      return { success: false, message: "Kh\xF4ng t\xECm th\u1EA5y ng\u01B0\u1EDDi d\xF9ng s\u1EDF h\u1EEFu giao d\u1ECBch." };
    }
    await updateTransaction(txId, { status: "success" });
    const topUpAmount = amount || tx.amountVND;
    const bonusPoints = Math.round(topUpAmount * 0.1);
    const newBalance = user.walletBalance + topUpAmount;
    const newPoints = user.lenPoints + bonusPoints;
    let newTier = user.tier;
    if (newPoints >= 5e4) newTier = "Gold";
    else if (newPoints >= 2e4) newTier = "Green";
    await updateUser(user.id, {
      walletBalance: newBalance,
      lenPoints: newPoints,
      tier: newTier
    });
    await addNotification(
      user.id,
      {
        vi: "T\u1EF1 \u0111\u1ED9ng n\u1EA1p v\xED th\xE0nh c\xF4ng \u{1F4B0}",
        en: "Automatic Wallet Top-up Successful \u{1F4B0}",
        ko: "e-\uD398\uC774 \uC790\uB3D9 \uCDA9\uC804 \uC644\uB8CC \u{1F4B0}"
      },
      {
        vi: `H\u1EC7 th\u1ED1ng \u0111\xE3 ghi nh\u1EADn kho\u1EA3n chuy\u1EC3n kho\u1EA3n ${topUpAmount.toLocaleString("vi-VN")}\u0111 (M\xE3: ${txId}). S\u1ED1 d\u01B0 v\xED c\u1EE7a b\u1EA1n \u0111\xE3 \u0111\u01B0\u1EE3c c\u1EADp nh\u1EADt. Nh\u1EADn th\xEAm +${bonusPoints.toLocaleString("vi-VN")} \u0111i\u1EC3m LEN!`,
        en: `We received your bank transfer of ${topUpAmount.toLocaleString()}\u0111 (ID: ${txId}). Your wallet balance has been updated. Earned +${bonusPoints.toLocaleString()} bonus LEN points!`,
        ko: `\uC740\uD589 \uC774\uCCB4 ${topUpAmount.toLocaleString()}\u0111(ID: ${txId})\uAC00 \uD655\uC778\uB418\uC5C8\uC2B5\uB2C8\uB2E4. e-\uD398\uC774 \uC794\uC561\uC774 \uCDA9\uC804\uB418\uC5C8\uC73C\uBA70, +${bonusPoints.toLocaleString()} LEN \uD3EC\uC778\uD2B8\uAC00 \uC801\uB9BD\uB418\uC5C8\uC2B5\uB2C8\uB2E4!`
      },
      "wallet"
    );
    return { success: true, message: `N\u1EA1p v\xED th\xE0nh c\xF4ng cho ng\u01B0\u1EDDi d\xF9ng ${user.name}. Giao d\u1ECBch: ${txId}` };
  }
  const orderMatch = cleanDesc.match(/MEL-[0-9]+/);
  if (orderMatch) {
    const orderId = orderMatch[0];
    const order = await getOrder(orderId);
    if (!order) {
      return { success: false, message: `Kh\xF4ng t\xECm th\u1EA5y m\xE3 \u0111\u01A1n h\xE0ng: ${orderId}` };
    }
    if (order.status !== "pending") {
      return { success: true, message: `\u0110\u01A1n h\xE0ng ${orderId} \u0111\xE3 \u0111\u01B0\u1EE3c thanh to\xE1n ho\u1EB7c x\u1EED l\xFD.` };
    }
    await updateOrder(orderId, { status: "preparing" });
    await addNotification(
      order.userId,
      {
        vi: "Thanh to\xE1n \u0111\u01A1n h\xE0ng th\xE0nh c\xF4ng \u{1F389}",
        en: "Order Payment Received \u{1F389}",
        ko: "\uC8FC\uBB38 \uACB0\uC81C \uD655\uC778 \u{1F389}"
      },
      {
        vi: `Mellodi \u0111\xE3 nh\u1EADn \u0111\u01B0\u1EE3c thanh to\xE1n chuy\u1EC3n kho\u1EA3n cho \u0111\u01A1n h\xE0ng ${orderId}. Barista \u0111ang b\u1EAFt \u0111\u1EA7u pha ch\u1EBF m\xF3n n\u01B0\u1EDBc c\u1EE7a b\u1EA1n!`,
        en: `Mellodi has received your transfer payment for order ${orderId}. Our baristas are now crafting your drinks!`,
        ko: `\uC8FC\uBB38 ${orderId}\uC5D0 \uB300\uD55C \uC774\uCCB4 \uACB0\uC81C\uAC00 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uBC14\uB9AC\uC2A4\uD0C0\uAC00 \uC74C\uB8CC \uC81C\uC870\uB97C \uC2DC\uC791\uD569\uB2C8\uB2E4!`
      },
      "order"
    );
    startOrderLifecycleSimulation(orderId);
    return { success: true, message: `Thanh to\xE1n \u0111\u01A1n h\xE0ng ${orderId} th\xE0nh c\xF4ng. \u0110ang pha ch\u1EBF.` };
  }
  return { success: false, message: `N\u1ED9i dung chuy\u1EC3n kho\u1EA3n kh\xF4ng kh\u1EDBp c\u1EA5u tr\xFAc giao d\u1ECBch Mellodi: "${description}"` };
}
router3.post("/webhook", async (req, res) => {
  const body = req.body;
  const description = body.description || body.content || body.data?.description || "";
  const amount = Number(body.amount || body.transferAmount || body.data?.amount || 0);
  if (!description) {
    return res.status(400).json({ error: "Kh\xF4ng t\xECm th\u1EA5y n\u1ED9i dung chuy\u1EC3n kho\u1EA3n trong webhook payload!" });
  }
  try {
    const result = await processPayment(description, amount);
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    res.json({ status: "success", message: result.message });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ error: "L\u1ED7i x\u1EED l\xFD webhook thanh to\xE1n." });
  }
});
router3.post("/simulate", async (req, res) => {
  const { description, amount } = req.body;
  if (!description || !amount) {
    return res.status(400).json({ error: "Vui l\xF2ng nh\u1EADp n\u1ED9i dung chuy\u1EC3n kho\u1EA3n v\xE0 s\u1ED1 ti\u1EC1n!" });
  }
  try {
    const result = await processPayment(description, Number(amount));
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    res.json({ success: true, message: result.message });
  } catch (error) {
    console.error("Simulation error:", error);
    res.status(500).json({ error: "L\u1ED7i gi\u1EA3 l\u1EADp chuy\u1EC3n kho\u1EA3n." });
  }
});
var webhook_default = router3;

// src/api/wallet.ts
var router4 = import_express4.default.Router();
var BANK_ID2 = process.env.BANK_ID || "MB";
var BANK_ACCOUNT2 = process.env.BANK_ACCOUNT || "090123456789";
var BANK_ACCOUNT_NAME2 = process.env.BANK_ACCOUNT_NAME || "MELLODI COFFEE";
router4.get("/transactions", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const transactions = await getUserTransactions(userId);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: "L\u1ED7i t\u1EA3i l\u1ECBch s\u1EED giao d\u1ECBch." });
  }
});
router4.post("/topup", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { amountVND, paymentMethod } = req.body;
  if (!amountVND || isNaN(amountVND) || amountVND <= 0) {
    return res.status(400).json({ error: "S\u1ED1 ti\u1EC1n n\u1EA1p kh\xF4ng h\u1EE3p l\u1EC7!" });
  }
  try {
    const user = await getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y th\xF4ng tin th\xE0nh vi\xEAn!" });
    }
    const txId = `TX-${Math.floor(1e5 + Math.random() * 9e5)}`;
    const isVietQR = paymentMethod === "VietQR_Transfer";
    const newTransaction = {
      id: txId,
      userId,
      type: "topup",
      amountVND,
      paymentMethod: paymentMethod || "VietQR_Transfer",
      status: isVietQR ? "pending" : "success",
      // VietQR starts as pending, others (like mock card) succeed instantly
      date: (/* @__PURE__ */ new Date()).toLocaleString()
    };
    await createTransaction(newTransaction);
    if (isVietQR) {
      const memo = `MELLODI ${txId}`;
      const qrCodeUrl = `https://img.vietqr.io/image/${BANK_ID2}-${BANK_ACCOUNT2}-compact.png?amount=${amountVND}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(BANK_ACCOUNT_NAME2)}`;
      setTimeout(async () => {
        try {
          console.log(`[Automation] Simulating VietQR payment for Top-up: ${txId}`);
          await processPayment(memo, amountVND);
        } catch (err) {
          console.error(`[Automation] Failed to auto-process VietQR top-up ${txId}:`, err);
        }
      }, 8e3);
      return res.json({
        success: true,
        transaction: newTransaction,
        qrCodeUrl,
        memo,
        bankInfo: {
          bankId: BANK_ID2,
          accountNo: BANK_ACCOUNT2,
          accountName: BANK_ACCOUNT_NAME2
        },
        message: "M\xE3 chuy\u1EC3n kho\u1EA3n VietQR \u0111\xE3 \u0111\u01B0\u1EE3c t\u1EA1o. Vui l\xF2ng qu\xE9t \u0111\u1EC3 ho\xE0n t\u1EA5t thanh to\xE1n."
      });
    }
    const bonusPoints = Math.round(amountVND * 0.1);
    const updatedUser = await updateUserPointsAndTier(userId, bonusPoints, amountVND);
    await addNotification(
      userId,
      {
        vi: "N\u1EA1p ti\u1EC1n v\xE0o v\xED th\xE0nh c\xF4ng \u{1F4B0}",
        en: "Wallet Top-up Successful \u{1F4B0}",
        ko: "\uBA5C\uB85C\uB514 e-\uD398\uC774 \uCDA9\uC804 \uC644\uB8CC \u{1F4B0}"
      },
      {
        vi: `B\u1EA1n \u0111\xE3 n\u1EA1p th\xE0nh c\xF4ng ${amountVND.toLocaleString("vi-VN")}\u0111 v\xE0o v\xED Mellodi v\xE0 nh\u1EADn th\xEAm +${bonusPoints.toLocaleString("vi-VN")} \u0111i\u1EC3m LEN. H\u1EA1ng th\xE0nh vi\xEAn hi\u1EC7n t\u1EA1i: ${updatedUser?.tier}!`,
        en: `Successfully topped up ${amountVND.toLocaleString()}\u0111 to your Mellodi wallet and received +${bonusPoints.toLocaleString()} bonus LEN points. Current tier: ${updatedUser?.tier}!`,
        ko: `e-\uD398\uC774\uC5D0 ${amountVND.toLocaleString()}\u0111 \uCDA9\uC804\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uBCF4\uB108\uC2A4\uB85C +${bonusPoints.toLocaleString()} LEN \uD3EC\uC778\uD2B8\uAC00 \uC801\uB9BD\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uD68C\uC6D0 \uB4F1\uAE09: ${updatedUser?.tier}!`
      },
      "wallet"
    );
    const { password: _, ...safeUser } = updatedUser;
    res.json({ success: true, user: safeUser, transaction: newTransaction });
  } catch (error) {
    console.error("Topup error:", error);
    res.status(500).json({ error: "L\u1ED7i h\u1EC7 th\u1ED1ng n\u1EA1p ti\u1EC1n." });
  }
});
router4.post("/convert-points", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { amountVND } = req.body;
  if (!amountVND || isNaN(amountVND) || amountVND <= 0) {
    return res.status(400).json({ error: "S\u1ED1 ti\u1EC1n quy \u0111\u1ED5i kh\xF4ng h\u1EE3p l\u1EC7!" });
  }
  try {
    const user = await getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y th\xF4ng tin th\xE0nh vi\xEAn!" });
    }
    if (user.walletBalance < amountVND) {
      return res.status(400).json({ error: "S\u1ED1 d\u01B0 v\xED \u0111i\u1EC7n t\u1EED kh\xF4ng \u0111\u1EE7 \u0111\u1EC3 \u0111\u1ED5i \u0111i\u1EC3m LEN!" });
    }
    const updatedUser = await updateUserPointsAndTier(userId, amountVND, -amountVND);
    const txId = `TX-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const newTransaction = {
      id: txId,
      userId,
      type: "convert",
      amountVND,
      pointsAmount: amountVND,
      status: "success",
      date: (/* @__PURE__ */ new Date()).toLocaleString()
    };
    await createTransaction(newTransaction);
    await addNotification(
      userId,
      {
        vi: "Quy \u0111\u1ED5i \u0111i\u1EC3m LEN th\xE0nh c\xF4ng \u{1F504}",
        en: "LEN Points Conversion Successful \u{1F504}",
        ko: "LEN \uD3EC\uC778\uD2B8 \uC804\uD658 \uC644\uB8CC \u{1F504}"
      },
      {
        vi: `B\u1EA1n \u0111\xE3 \u0111\u1ED5i th\xE0nh c\xF4ng ${amountVND.toLocaleString("vi-VN")}\u0111 sang +${amountVND.toLocaleString("vi-VN")} \u0111i\u1EC3m LEN. H\u1EA1ng th\xE0nh vi\xEAn hi\u1EC7n t\u1EA1i: ${updatedUser?.tier}!`,
        en: `Successfully converted ${amountVND.toLocaleString()}\u0111 into +${amountVND.toLocaleString()} LEN points. Current tier: ${updatedUser?.tier}!`,
        ko: `e-\uD398\uC774 ${amountVND.toLocaleString()}\u0111\uC774 +${amountVND.toLocaleString()} LEN \uD3EC\uC778\uD2B8\uB85C \uC804\uD658\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uD68C\uC6D0 \uB4F1\uAE09: ${updatedUser?.tier}!`
      },
      "wallet"
    );
    const { password: _, ...safeUser } = updatedUser;
    res.json({ success: true, user: safeUser, transaction: newTransaction });
  } catch (error) {
    console.error("Convert points error:", error);
    res.status(500).json({ error: "L\u1ED7i h\u1EC7 th\u1ED1ng \u0111\u1ED5i \u0111i\u1EC3m." });
  }
});
var wallet_default = router4;

// src/api/gifts.ts
var import_express5 = __toESM(require("express"), 1);
var router5 = import_express5.default.Router();
var GIFTS = [
  {
    id: "gft-drink",
    name: {
      vi: "\u0110\u1EB7c s\u1EA3n \u1EE6 L\u1EA1nh Mellodi Cold Brew (Free Drink)",
      en: "Mellodi Cold Brew Special (Free Drink)",
      ko: "\uBA5C\uB85C\uB514 \uC2DC\uADF8\uB2C8\uCC98 \uCF5C\uB4DC\uBE0C\uB8E8 (\uC74C\uB8CC \uAD50\uD658\uAD8C)"
    },
    category: "drink",
    costPoints: 12e3,
    image: "\u{1F964}",
    description: {
      vi: "S\u1EED d\u1EE5ng h\u1EA1t Arabica h\u1EA3o h\u1EA1ng \u1EE7 l\u1EA1nh 18 gi\u1EDD mang l\u1EA1i v\u1ECB m\u01B0\u1EE3t m\xE0 tinh t\u1EBF.",
      en: "Crafted with premium Arabica beans slow-steeped for 18 hours for a clean profile.",
      ko: "18\uC2DC\uAC04 \uB3D9\uC548 \uC800\uC628\uC5D0\uC11C \uCC9C\uCC9C\uD788 \uCD94\uCD9C\uD55C \uAE54\uB054\uD558\uACE0 \uBD80\uB7EC\uC6B4 \uC2DC\uADF8\uB2C8\uCC98 \uCF5C\uB4DC\uBE0C\uB8E8."
    }
  },
  {
    id: "gft-pastry",
    name: {
      vi: "B\xE1nh S\u1EEBng B\xF2 B\u01A1 Ph\xE1p (French Butter Croissant)",
      en: "French Butter Croissant",
      ko: "\uD504\uB791\uC2A4\uC0B0 b\u01A1 b\xE1nh s\u1EEBng b\xF2"
    },
    category: "pastry",
    costPoints: 8e3,
    image: "\u{1F950}",
    description: {
      vi: "B\xE1nh s\u1EEBng b\xF2 ng\u1EADp b\u01A1 Ph\xE1p b\xE9o ng\u1EADy, n\u01B0\u1EDBng gi\xF2n n\xF3ng h\u1ED5i.",
      en: "Flaky French croissant baked with premium butter, served warm.",
      ko: "\uD504\uB791\uC2A4\uC0B0 \uACE0\uBA54 \uBC84\uD130\uB85C \uAD6C\uC6CC\uB0B4 \uAC89\uC740 \uBC14\uC0AD\uD558\uACE0 \uC18D\uC740 \uCD09\uCD09\uD55C \uD06C\uB85C\uC640\uC0C1."
    }
  },
  {
    id: "gft-voucher-50",
    name: {
      vi: "Voucher \u01AFu \u0110\xE3i Tr\u1ECB Gi\xE1 50.000\u0111",
      en: "50,000 VND Discount Voucher",
      ko: "50,000 VND \uD560\uC778 \uCFE0\uD3F0"
    },
    category: "voucher",
    costPoints: 2e4,
    image: "\u{1F3AB}",
    description: {
      vi: "Gi\u1EA3m tr\u1EF1c ti\u1EBFp 50.000\u0111 khi thanh to\xE1n m\u1ECDi h\xF3a \u0111\u01A1n n\u01B0\u1EDBc & b\xE1nh t\u1EA1i Mellodi.",
      en: "Flat 50,000 VND discount applicable to any direct orders at Mellodi.",
      ko: "\uBA5C\uB85C\uB514 \uB9E4\uC7A5 \uBC0F \uC2A4\uB9C8\uD2B8 \uC624\uB354\uC5D0\uC11C \uC0AC\uC6A9 \uAC00\uB2A5\uD55C 5\uB9CC\uB3D9 \uC989\uC2DC \uD560\uC778 \uCFE0\uD3F0."
    }
  },
  {
    id: "gft-tumbler",
    name: {
      vi: "B\xECnh Gi\u1EEF Nhi\u1EC7t Mellodi Signature Thermo Tumbler",
      en: "Mellodi Thermo Tumbler",
      ko: "\uBA5C\uB85C\uB514 \uC2DC\uADF8\uB2C8\uCC98 \uD140\uBE14\uB7EC"
    },
    category: "merchandise",
    costPoints: 5e4,
    image: "\u{1F95B}",
    description: {
      vi: "B\xECnh gi\u1EEF nhi\u1EC7t b\u1EB1ng th\xE9p kh\xF4ng g\u1EC9 cao c\u1EA5p 500ml, gi\u1EEF n\xF3ng 12h, l\u1EA1nh 24h.",
      en: "Premium 500ml stainless steel tumbler. Keeps hot 12h, cold 24h.",
      ko: "\uD504\uB9AC\uBBF8\uC5C4 500ml \uC2A4\uD14C\uC778\uB9AC\uC2A4 \uC774\uC911 \uC9C4\uACF5 \uD140\uBE14\uB7EC. \uB6F0\uC5B4\uB09C \uBCF4\uC628 \uBC0F \uBCF4\uB0C9\uB825."
    }
  },
  {
    id: "gft-birthday",
    name: {
      vi: "B\xE1nh Cupcake Sweet Strawberry (Qu\xE0 Sinh Nh\u1EADt)",
      en: "Sweet Strawberry Birthday Cupcake",
      ko: "\uC2A4\uC704\uD2B8 \uB538\uAE30 \uC0DD\uC77C \uCEF5\uCF00\uC774\uD06C"
    },
    category: "birthday",
    costPoints: 5e3,
    image: "\u{1F9C1}",
    description: {
      vi: "M\xF3n qu\xE0 ng\u1ECDt ng\xE0o \u0111\u1EB7c quy\u1EC1n d\xE0nh ri\xEAng cho kh\xE1ch h\xE0ng c\xF3 sinh nh\u1EADt th\xE1ng n\xE0y.",
      en: "Exclusive sweet treat reserved for members during their birthday month.",
      ko: "\uC0DD\uC77C\uC778 \uD68C\uC6D0\uB2D8\uC744 \uC704\uD574 \uC900\uBE44\uD55C \uBD80\uB4DC\uB7FD\uACE0 \uB2EC\uCF64\uD55C \uC2A4\uC704\uD2B8 \uB538\uAE30 \uCEF5\uCF00\uC774\uD06C."
    }
  },
  {
    id: "gft-seasonal",
    name: {
      vi: "Ly S\u1EE9 Cozy Gingerbread Mug (Qu\xE0 Theo M\xF9a)",
      en: "Cozy Gingerbread Ceramic Mug",
      ko: "\uCF54\uC9C0 \uC9C4\uC800\uBE0C\uB808\uB4DC \uB3C4\uC790\uAE30 \uBA38\uADF8\uCEF5"
    },
    category: "seasonal",
    costPoints: 3e4,
    image: "\u2615",
    description: {
      vi: "Ly s\u1EE9 phi\xEAn b\u1EA3n gi\u1EDBi h\u1EA1n thi\u1EBFt k\u1EBF \u1EA5m c\xFAng cho m\xF9a \u0111\xF4ng.",
      en: "Limited edition ceramic mug with a cute gingerbread holiday theme.",
      ko: "\uD640\uB9AC\uB370\uC774 \uC2DC\uC98C \uD55C\uC815\uD310 \uC544\uAE30\uC790\uAE30\uD55C \uC9C4\uC800\uBE0C\uB808\uB4DC \uBA38\uADF8\uCEF5."
    }
  },
  {
    id: "gft-vip",
    name: {
      vi: "T\u1EA5m L\xF3t Ly Da Th\u1EE7 C\xF4ng (VIP Leather Coaster Set)",
      en: "VIP Handcrafted Leather Coaster Set",
      ko: "VIP \uC218\uACF5\uC608 \uAC00\uC8FD \uCF54\uC2A4\uD130 \uC138\uD2B8"
    },
    category: "vip",
    costPoints: 4e4,
    image: "\u{1F397}\uFE0F",
    description: {
      vi: "T\u1EA5m l\xF3t ly b\u1EB1ng da th\u1EADt d\u1EADp ch\xECm logo Mellodi m\u1EA1 v\xE0ng cao c\u1EA5p d\xE0nh cho VIP.",
      en: "Genuine leather coaster set embossed with Mellodi gold foil logo.",
      ko: "\uBA5C\uB85C\uB514 \uB85C\uACE0\uAC00 \uACE0\uAE09\uC2A4\uB7FD\uAC8C \uAC01\uC778\uB41C \uCC9C\uC5F0 \uAC00\uC8FD \uCF54\uC2A4\uD130 \uC138\uD2B8 (VIP \uC804\uC6A9)."
    }
  }
];
router5.get("/", (req, res) => {
  res.json(GIFTS);
});
router5.get("/my-gifts", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const userGifts = await getUserRedeemedGifts(userId);
    res.json(userGifts);
  } catch (error) {
    res.status(500).json({ error: "L\u1ED7i t\u1EA3i l\u1ECBch s\u1EED nh\u1EADn qu\xE0." });
  }
});
router5.post("/redeem", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { giftId, recipientName, recipientPhone, recipientEmail, pickupBranch } = req.body;
  const gift = GIFTS.find((g) => g.id === giftId);
  if (!gift) {
    return res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y qu\xE0 t\u1EB7ng n\xE0y trong h\u1EC7 th\u1ED1ng!" });
  }
  try {
    const user = await getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y th\xF4ng tin th\xE0nh vi\xEAn!" });
    }
    if (user.lenPoints < gift.costPoints) {
      return res.status(400).json({ error: `S\u1ED1 d\u01B0 \u0111i\u1EC3m LEN kh\xF4ng \u0111\u1EE7! B\u1EA1n c\u1EA7n ${gift.costPoints.toLocaleString()} LEN (Hi\u1EC7n c\xF3: ${user.lenPoints.toLocaleString()} LEN).` });
    }
    const remainingPoints = user.lenPoints - gift.costPoints;
    let newTier = user.tier;
    if (remainingPoints >= 5e4) newTier = "Gold";
    else if (remainingPoints >= 2e4) newTier = "Green";
    else newTier = "Welcome";
    await updateUser(userId, {
      lenPoints: remainingPoints,
      tier: newTier
    });
    const claimCode = `GFT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newRedemption = {
      id: `rg-${Math.random().toString(36).substring(2, 9)}`,
      userId,
      giftId,
      giftName: gift.name,
      costPoints: gift.costPoints,
      redeemedDate: (/* @__PURE__ */ new Date()).toLocaleString(),
      claimCode,
      status: "active",
      recipientName: recipientName || user.name,
      recipientPhone: recipientPhone || user.phone,
      recipientEmail: recipientEmail || user.email,
      pickupBranch: pickupBranch || "Mellodi Nguy\u1EC5n Hu\u1EC7 (Qu\u1EADn 1)"
    };
    await createRedeemedGift(newRedemption);
    const txId = `TX-GFT-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    await createTransaction({
      id: txId,
      userId,
      type: "convert",
      amountVND: 0,
      pointsAmount: gift.costPoints,
      status: "success",
      date: (/* @__PURE__ */ new Date()).toLocaleString()
    });
    const finalEmail = recipientEmail || user.email;
    const finalBranch = pickupBranch || "Mellodi Nguy\u1EC5n Hu\u1EC7 (Qu\u1EADn 1)";
    await addNotification(
      userId,
      {
        vi: "\u0110\u1ED5i qu\xE0 th\xE0nh c\xF4ng! \u{1F381}",
        en: "Gift Redeemed Successfully! \u{1F381}",
        ko: "\uC120\uBB3C \uAD50\uD658 \uC131\uACF5! \u{1F381}"
      },
      {
        vi: `M\xE3 \u0111\u1ED5i qu\xE0 ${claimCode} \u0111\xE3 \u0111\u01B0\u1EE3c t\u1EA1o cho "${gift.name.vi}". Phi\u1EBFu x\xE1c nh\u1EADn nh\u1EADn qu\xE0 v\xE0 m\xE3 QR \u0111\xE3 \u0111\u01B0\u1EE3c g\u1EEDi \u0111\u1EBFn email ${finalEmail}. Nh\u1EADn qu\xE0 t\u1EA1i chi nh\xE1nh: ${finalBranch}.`,
        en: `Redemption code ${claimCode} created for "${gift.name.en}". The confirmation and QR code have been emailed to ${finalEmail}. Pick up at branch: ${finalBranch}.`,
        ko: `"${gift.name.ko || gift.name.en}"\uC5D0 \uB300\uD55C \uAD50\uD658 \uCF54\uB4DC ${claimCode}\uAC00 \uC0DD\uC131\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uC218\uB839\uC99D\uACFC QR \uCF54\uB4DC\uAC00 ${finalEmail} \uC8FC\uC18C\uB85C \uC774\uBA54\uC77C \uC804\uC1A1\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uC218\uB839 \uC9C0\uC810: ${finalBranch}.`
      },
      "gift"
    );
    const latestUser = await getUser(userId);
    const { password: _, ...safeUser } = latestUser;
    res.json({ success: true, user: safeUser, redemption: newRedemption });
  } catch (error) {
    console.error("Redeem gift error:", error);
    res.status(500).json({ error: "L\u1ED7i h\u1EC7 th\u1ED1ng \u0111\u1ED5i qu\xE0." });
  }
});
router5.post("/claim/:redeemedGiftId", async (req, res) => {
  const { redeemedGiftId } = req.params;
  try {
    const rg = await getRedeemedGift(redeemedGiftId);
    if (!rg) {
      return res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y m\xE3 \u0111\u1ED5i qu\xE0 t\u1EB7ng!" });
    }
    if (rg.status === "claimed") {
      return res.status(400).json({ error: "M\xE3 qu\xE0 t\u1EB7ng n\xE0y \u0111\xE3 \u0111\u01B0\u1EE3c s\u1EED d\u1EE5ng t\u1EEB tr\u01B0\u1EDBc!" });
    }
    const updatedRedemption = await updateRedeemedGift(redeemedGiftId, { status: "claimed" });
    await addNotification(
      rg.userId,
      {
        vi: "\u0110\xE3 nh\u1EADn qu\xE0 t\u1EA1i qu\u1EA7y th\xE0nh c\xF4ng! \u{1F389}",
        en: "Gift Claimed Successfully! \u{1F389}",
        ko: "\uC120\uBB3C \uC218\uB839 \uC644\uB8CC! \u{1F389}"
      },
      {
        vi: `M\xF3n qu\xE0 "${rg.giftName.vi || rg.giftName.en}" \u0111\xE3 \u0111\u01B0\u1EE3c trao th\xE0nh c\xF4ng t\u1EA1i chi nh\xE1nh "${rg.pickupBranch || "Mellodi Nguy\u1EC5n Hu\u1EC7 (Qu\u1EADn 1)"}" cho ng\u01B0\u1EDDi nh\u1EADn ${rg.recipientName || "b\u1EA1n"}. C\u1EA3m \u01A1n b\u1EA1n!`,
        en: `The reward "${rg.giftName.en}" has been successfully claimed at branch "${rg.pickupBranch || "Mellodi Nguy\u1EC5n Hu\u1EC7 (Qu\u1EADn 1)"}" by ${rg.recipientName || "you"}. Thank you!`,
        ko: `\uC120\uBB3C "${rg.giftName.ko || rg.giftName.en}"\uC774 "${rg.pickupBranch || "Mellodi Nguy\u1EC5n Hu\u1EC7 (Qu\u1EADn 1)"}" \uC9C0\uC810\uC5D0\uC11C ${rg.recipientName || "\uD68C\uC6D0"}\uB2D8\uAED8 \uC815\uC0C1\uC801\uC73C\uB85C \uC804\uB2EC\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uAC10\uC0AC\uD569\uB2C8\uB2E4!`
      },
      "gift"
    );
    res.json({ success: true, redemption: updatedRedemption });
  } catch (error) {
    console.error("Claim gift error:", error);
    res.status(500).json({ error: "L\u1ED7i h\u1EC7 th\u1ED1ng nh\u1EADn qu\xE0 t\u1EB7ng." });
  }
});
var gifts_default = router5;

// src/api/notifications.ts
var import_express6 = __toESM(require("express"), 1);
var router6 = import_express6.default.Router();
router6.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const notifications = await getUserNotifications(userId);
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ error: "L\u1ED7i t\u1EA3i th\xF4ng b\xE1o." });
  }
});
router6.post("/read", async (req, res) => {
  const { notificationId, userId } = req.body;
  try {
    await markNotificationRead(notificationId, userId);
    const notifications = await getUserNotifications(userId);
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ error: "L\u1ED7i \u0111\u1ECDc th\xF4ng b\xE1o." });
  }
});
router6.post("/read-all", async (req, res) => {
  const { userId } = req.body;
  try {
    await markAllNotificationsRead(userId);
    const notifications = await getUserNotifications(userId);
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ error: "L\u1ED7i \u0111\u1ECDc t\u1EA5t c\u1EA3 th\xF4ng b\xE1o." });
  }
});
router6.post("/delete", async (req, res) => {
  const { notificationId, userId } = req.body;
  try {
    await deleteNotification(notificationId, userId);
    const notifications = await getUserNotifications(userId);
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ error: "L\u1ED7i x\xF3a th\xF4ng b\xE1o." });
  }
});
var notifications_default = router6;

// src/api/users.ts
var import_express7 = __toESM(require("express"), 1);
var router7 = import_express7.default.Router();
router7.get("/:id", async (req, res) => {
  try {
    const user = await getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y th\xF4ng tin th\xE0nh vi\xEAn!" });
    }
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ error: "L\u1ED7i t\u1EA3i th\xF4ng tin th\xE0nh vi\xEAn." });
  }
});
var users_default = router7;

// src/api/admin.ts
var import_express8 = __toESM(require("express"), 1);

// src/data/products.ts
var products = [
  // Category: brewed (Mellodi Tradition)
  {
    id: "tr-1",
    category: "brewed",
    name: {
      vi: "C\xE0 Ph\xEA \u0110en Mellodi (Black Coffee)",
      en: "Mellodi Black Coffee",
      ko: "\uBA5C\uB85C\uB514 \uBE14\uB799 \uCEE4\uD53C"
    },
    description: {
      vi: "C\xE0 ph\xEA Robusta rang m\u1ED9c \u0111\u1EADm \u0111\xE0 truy\u1EC1n th\u1ED1ng, \u0111\u1EADm v\u1ECB \u0111\u1EAFng thanh tho\xE1t.",
      en: "Bold and traditional roasted Robusta black coffee with a clean, strong finish.",
      ko: "\uC804\uD1B5\uC801\uC778 \uBC29\uC2DD\uC73C\uB85C \uB85C\uC2A4\uD305\uD558\uC5EC \uAE4A\uACE0 \uC9C4\uD55C \uB9DB\uC744 \uB0B4\uB294 \uBA5C\uB85C\uB514 \uC624\uB9AC\uC9C0\uB110 \uBE14\uB799 \uCEE4\uD53C."
    },
    priceVND: 45e3,
    priceKRW: 3e3,
    priceUSD: 2,
    image: "\u2615",
    popular: true
  },
  {
    id: "tr-2",
    category: "brewed",
    name: {
      vi: "C\xE0 Ph\xEA S\u1EEFa Mellodi (White Coffee)",
      en: "Mellodi White Coffee",
      ko: "\uBA5C\uB85C\uB514 \uD654\uC774\uD2B8 \uC5F0\uC720 \uCEE4\uD53C"
    },
    description: {
      vi: "S\u1EF1 h\xF2a quy\u1EC7n ng\u1ECDt ng\xE0o gi\u1EEFa Robusta \u0111\u1EADm \u0111\xE0 v\xE0 s\u1EEFa \u0111\u1EB7c ki\u1EC3u Vi\u1EC7t Nam h\u1EA3o h\u1EA1ng.",
      en: "A sweet and creamy blend of bold Robusta and premium Vietnamese condensed milk.",
      ko: "\uC9C4\uD55C \uB85C\uBD80\uC2A4\uD0C0 \uC5D0\uC2A4\uD504\uB808\uC18C\uC640 \uB2EC\uCF64\uD55C \uC5F0\uC720\uAC00 \uC5B4\uC6B0\uB7EC\uC9C4 \uBA5C\uB85C\uB514\uC2DD \uC5F0\uC720 \uCEE4\uD53C."
    },
    priceVND: 5e4,
    priceKRW: 3200,
    priceUSD: 2.2,
    image: "\u{1F95B}",
    popular: true
  },
  {
    id: "tr-3",
    category: "brewed",
    name: {
      vi: "C\xE0 Ph\xEA S\u1EEFa T\u01B0\u01A1i Mellodi",
      en: "Mellodi Fresh Milk Coffee",
      ko: "\uBA5C\uB85C\uB514 \uC0DD\uC6B0\uC720 \uCEE4\uD53C"
    },
    description: {
      vi: "C\xE0 ph\xEA nguy\xEAn ch\u1EA5t k\u1EBFt h\u1EE3p c\xF9ng s\u1EEFa t\u01B0\u01A1i thanh tr\xF9ng b\xE9o nh\u1EB9, d\u1EC5 u\u1ED1ng.",
      en: "Pure coffee combined with pasteurized fresh milk for a smooth and light body.",
      ko: "\uC2E0\uC120\uD55C \uC0DD\uC6B0\uC720\uC640 \uAE54\uB054\uD55C \uCEE4\uD53C \uC0F7\uC774 \uC5B4\uC6B0\uB7EC\uC838 \uBD80\uB4DC\uB7FD\uAC8C \uC990\uAE30\uB294 \uBA5C\uB85C\uB514 \uCEE4\uD53C."
    },
    priceVND: 55e3,
    priceKRW: 3500,
    priceUSD: 2.5,
    image: "\u{1F964}"
  },
  {
    id: "tr-4",
    category: "brewed",
    name: {
      vi: "C\xE0 Ph\xEA Kem Mu\u1ED1i Mellodi",
      en: "Mellodi Salt Cream Coffee",
      ko: "\uBA5C\uB85C\uB514 \uC18C\uAE08 \uD06C\uB9BC \uCEE4\uD53C"
    },
    description: {
      vi: "L\u1EDBp kem mu\u1ED1i b\xE9o ng\u1EADy m\u1EB1n m\u1EB7n ph\u1EE7 l\xEAn tr\xEAn c\u1ED1t c\xE0 ph\xEA phin \u0111\u1EADm \u0111\xE0 \u0111\u1EB7c tr\u01B0ng.",
      en: "Rich, savory salted cream layered over our signature bold slow-dripped coffee.",
      ko: "\uB2EC\uCF64 \uC9ED\uC870\uB984\uD558\uACE0 \uBD80\uB4DC\uB7EC\uC6B4 \uC18C\uAE08 \uD06C\uB9BC\uC744 \uC62C\uB9B0 \uBA5C\uB85C\uB514 \uC2DC\uADF8\uB2C8\uCC98 \uCEE4\uD53C."
    },
    priceVND: 55e3,
    priceKRW: 3500,
    priceUSD: 2.5,
    image: "\u{1F36E}",
    popular: true
  },
  // Category: espresso (Mellodi Italy)
  {
    id: "esp-1",
    category: "espresso",
    name: {
      vi: "Espresso Mellodi",
      en: "Mellodi Espresso",
      ko: "\uBA5C\uB85C\uB514 \uC5D0\uC2A4\uD504\uB808\uC18C"
    },
    description: {
      vi: "C\xE0 ph\xEA Arabica v\xE0 Robusta ph\u1ED1i tr\u1ED9n \u0111\u01B0\u1EE3c chi\u1EBFt xu\u1EA5t m\xE1y \xE1p su\u1EA5t cao, th\u01A1m n\u1ED3ng \u0111\u1EADm v\u1ECB.",
      en: "A blend of Arabica and Robusta extracted under high pressure for a rich aroma.",
      ko: "\uC5C4\uC120\uB41C \uC6D0\uB450\uB97C \uACE0\uC555 \uCD94\uCD9C\uD558\uC5EC \uC544\uB85C\uB9C8\uAC00 \uC0B4\uC544\uC788\uB294 \uBA5C\uB85C\uB514 \uC5D0\uC2A4\uD504\uB808\uC18C."
    },
    priceVND: 5e4,
    priceKRW: 3200,
    priceUSD: 2.2,
    image: "\u2615"
  },
  {
    id: "esp-2",
    category: "espresso",
    name: {
      vi: "Americano Mellodi",
      en: "Mellodi Americano",
      ko: "\uBA5C\uB85C\uB514 \uC544\uBA54\uB9AC\uCE74\uB178"
    },
    description: {
      vi: "Espresso nguy\xEAn ch\u1EA5t pha lo\xE3ng v\u1EDBi n\u01B0\u1EDBc n\xF3ng mang l\u1EA1i h\u1EADu v\u1ECB m\u01B0\u1EE3t m\xE0 s\u1EA3ng kho\xE1i.",
      en: "Pure espresso diluted with hot water for a smooth, refreshing daily coffee.",
      ko: "\uC5D0\uC2A4\uD504\uB808\uC18C\uC5D0 \uBB3C\uC744 \uB354\uD574 \uAE54\uB054\uD558\uACE0 \uCCAD\uB7C9\uD55C \uB9DB\uC744 \uB0B4\uB294 \uC544\uBA54\uB9AC\uCE74\uB178."
    },
    priceVND: 55e3,
    priceKRW: 3500,
    priceUSD: 2.5,
    image: "\u{1F9CA}"
  },
  {
    id: "esp-3",
    category: "espresso",
    name: {
      vi: "Latte Mellodi (Hot/Iced)",
      en: "Mellodi Latte",
      ko: "\uBA5C\uB85C\uB514 \uB77C\uB5BC"
    },
    description: {
      vi: "C\xE0 ph\xEA espresso h\xF2a quy\u1EC7n c\xF9ng s\u1EEFa t\u01B0\u01A1i \u1EA5m v\xE0 l\u1EDBp b\u1ECDt s\u1EEFa m\u1ECFng m\u1ECBn.",
      en: "Espresso combined with velvety steamed milk and a thin layer of micro-foam.",
      ko: "\uC9C4\uD55C \uC5D0\uC2A4\uD504\uB808\uC18C\uC640 \uBD80\uB4DC\uB7EC\uC6B4 \uC2A4\uD300 \uC6B0\uC720\uAC00 \uC870\uD654\uB97C \uC774\uB8E8\uB294 \uACE0\uC18C\uD55C \uB77C\uB5BC."
    },
    priceVND: 65e3,
    priceKRW: 4200,
    priceUSD: 3,
    image: "\u{1F95B}"
  },
  {
    id: "esp-4",
    category: "espresso",
    name: {
      vi: "C\xE0 Ph\xEA Caramel Mu\u1ED1i Mellodi",
      en: "Mellodi Salted Caramel Latte",
      ko: "\uBA5C\uB85C\uB514 \uC194\uD2F0\uB4DC \uCE74\uB77C\uBA5C \uB77C\uB5BC"
    },
    description: {
      vi: "Latte b\xE9o m\u1ECBn k\u1EBFt h\u1EE3p c\xF9ng s\u1ED1t caramel ng\u1ECDt ng\xE0o v\xE0 m\u1ED9t ch\xFAt mu\u1ED1i bi\u1EC3n tinh t\u1EBF.",
      en: "Velvety latte fused with sweet caramel sauce and a touch of fine sea salt.",
      ko: "\uB2EC\uCF64\uD55C \uCE74\uB77C\uBA5C \uC2DC\uB7FD\uC5D0 \uC9ED\uC870\uB984\uD55C \uC18C\uAE08\uC744 \uAC00\uBBF8\uD574 \uB2E8\uC9E0 \uB9E4\uB825\uC744 \uC0B4\uB9B0 \uB77C\uB5BC."
    },
    priceVND: 7e4,
    priceKRW: 4500,
    priceUSD: 3.2,
    image: "\u{1F36F}",
    popular: true
  },
  // Category: tea (Mellodi Tea)
  {
    id: "tea-1",
    category: "tea",
    name: {
      vi: "Tr\xE0 \u0110\xE0o Mellodi",
      en: "Mellodi Peach Tea",
      ko: "\uBA5C\uB85C\uB514 \uBCF5\uC22D\uC544 \uD64D\uCC28"
    },
    description: {
      vi: "Tr\xE0 \u0111\xE0o thanh ng\u1ECDt k\u1EBFt h\u1EE3p c\xF9ng \u0111\xE0o mi\u1EBFng gi\xF2n ng\u1ECDt ch\xEDn m\u1ECDng t\u1EF1 nhi\xEAn v\xE0 s\u1EA3 t\u01B0\u01A1i.",
      en: "Sweet peach tea topped with crunchy peach slices and fresh lemongrass.",
      ko: "\uD5A5\uAE0B\uD55C \uD64D\uCC28\uC5D0 \uC544\uC0AD\uD55C \uBCF5\uC22D\uC544 \uACFC\uC721\uACFC \uC2F1\uADF8\uB7EC\uC6B4 \uB808\uBAAC\uADF8\uB77C\uC2A4\uB97C \uB354\uD55C \uC544\uC774\uC2A4 \uD2F0."
    },
    priceVND: 65e3,
    priceKRW: 4200,
    priceUSD: 3,
    image: "\u{1F351}",
    popular: true
  },
  {
    id: "tea-2",
    category: "tea",
    name: {
      vi: "Tr\xE0 Hibiscus V\u1EA3i Mellodi",
      en: "Mellodi Lychee Hibiscus Tea",
      ko: "\uBA5C\uB85C\uB514 \uB9AC\uCE58 \uD788\uBE44\uC2A4\uCEE4\uC2A4 \uD2F0"
    },
    description: {
      vi: "Tr\xE0 hoa Atiso \u0111\u1ECF chua thanh k\u1EBFt h\u1EE3p c\xF9ng qu\u1EA3 v\u1EA3i ch\xEDn m\u1ECDng ng\u1ECDt ng\xE0o.",
      en: "Tart hibiscus flower tea paired with sweet, juicy lychees for a vibrant refresher.",
      ko: "\uC0C1\uD07C\uD55C \uD788\uBE44\uC2A4\uCEE4\uC2A4 \uD2F0\uC5D0 \uB2EC\uCF64\uD55C \uB9AC\uCE58 \uC5F4\uB9E4\uB97C \uAC00\uBBF8\uD574 \uCCAD\uB7C9\uAC10\uC744 \uC8FC\uB294 \uD2F0."
    },
    priceVND: 65e3,
    priceKRW: 4200,
    priceUSD: 3,
    image: "\u{1F379}"
  },
  {
    id: "tea-3",
    category: "tea",
    name: {
      vi: "Tr\xE0 \u1ED4i H\u1ED3ng Mellodi",
      en: "Mellodi Pink Guava Tea",
      ko: "\uBA5C\uB85C\uB514 \uD551\uD06C \uAD6C\uC544\uBC14 \uD2F0"
    },
    description: {
      vi: "Tr\xE0 \xF4 long thanh m\xE1t k\u1EBFt h\u1EE3p s\u1ED1t \u1ED5i h\u1ED3ng th\u01A1m ng\u1ECDt v\xE0 c\xE1c l\xE1t tr\xE1i c\xE2y t\u01B0\u01A1i.",
      en: "Refreshing oolong tea blended with sweet pink guava puree and fresh fruit slices.",
      ko: "\uC740\uC740\uD55C \uC6B0\uB871\uCC28\uC5D0 \uD5A5\uAE0B\uD558\uACE0 \uB2EC\uCF64\uD55C \uD551\uD06C \uAD6C\uC544\uBC14\uB97C \uC11E\uC5B4 \uB9CC\uB4E0 \uC6F0\uBE59 \uD2F0."
    },
    priceVND: 65e3,
    priceKRW: 4200,
    priceUSD: 3,
    image: "\u{1F379}"
  },
  {
    id: "tea-4",
    category: "tea",
    name: {
      vi: "Tr\xE0 S\u1EEFa \xD4 Long Mellodi",
      en: "Mellodi Oolong Milktea",
      ko: "\uBA5C\uB85C\uB514 \uC6B0\uB871 \uBC00\uD06C\uD2F0"
    },
    description: {
      vi: "Tr\xE0 \xF4 long \u0111\u01B0\u1EE3c \u1EE7 \u0111\u1EADm v\u1ECB k\u1EBFt h\u1EE3p s\u1EEFa b\xE9o ng\u1EADy b\xF9i, h\u1EADu v\u1ECB ng\u1ECDt k\xE9o d\xE0i.",
      en: "Strongly brewed oolong tea mixed with rich milk powder for a long sweet aftertaste.",
      ko: "\uAE4A\uAC8C \uC6B0\uB824\uB0B8 \uC6B0\uB871\uCC28\uC5D0 \uBD80\uB4DC\uB7EC\uC6B4 \uC6B0\uC720\uB97C \uC11E\uC5B4 \uACE0\uC18C\uD558\uACE0 \uAE54\uB054\uD55C \uBC00\uD06C\uD2F0."
    },
    priceVND: 6e4,
    priceKRW: 3800,
    priceUSD: 2.8,
    image: "\u{1F375}"
  },
  // Category: coldbrew (Mellodi Special & Frappe & Non-Coffee)
  {
    id: "sp-1",
    category: "coldbrew",
    name: {
      vi: "Mellodi \u0110\u1EB7c Bi\u1EC7t (Mellodi Special)",
      en: "Mellodi Special Signature",
      ko: "\uBA5C\uB85C\uB514 \uC2A4\uD398\uC15C \uC2DC\uADF8\uB2C8\uCC98"
    },
    description: {
      vi: "Th\u1EE9c u\u1ED1ng \u0111\u1EB7c ch\u1EBF \u0111\u1ED9c quy\u1EC1n c\u1EE7a Mellodi \u0111em l\u1EA1i h\u01B0\u01A1ng v\u1ECB \u0111\u1ED9t ph\xE1 \u0111\u1EA7y c\u1EA3m x\xFAc.",
      en: "Our exclusive signature creation bringing a breakthrough of rich and layered flavors.",
      ko: "\uBA5C\uB85C\uB514\uB9CC\uC758 \uBE44\uBC00 \uB808\uC2DC\uD53C\uB85C \uC81C\uC870\uD558\uC5EC \uB3C5\uD2B9\uD558\uACE0 \uAE4A\uC740 \uB9DB\uC744 \uC120\uC0AC\uD558\uB294 \uD2B9\uBCC4 \uC2DC\uADF8\uB2C8\uCC98."
    },
    priceVND: 65e3,
    priceKRW: 4200,
    priceUSD: 3,
    image: "\u{1F31F}",
    popular: true
  },
  {
    id: "sp-2",
    category: "coldbrew",
    name: {
      vi: "Matcha Latte S\u01B0\u01A1ng M\xF9 Mellodi",
      en: "Mellodi Matcha Latte",
      ko: "\uBA5C\uB85C\uB514 \uB9D0\uCC28 \uB77C\uB5BC"
    },
    description: {
      vi: "B\u1ED9t matcha Shizuoka Nh\u1EADt B\u1EA3n h\u1EA3o h\u1EA1ng h\xF2a c\xF9ng s\u1EEFa t\u01B0\u01A1i b\xE9o nh\u1EB9 thanh tr\xF9ng.",
      en: "Premium Japanese Shizuoka matcha powder blended with pasteurized fresh milk.",
      ko: "\uC77C\uBCF8 \uC2DC\uC988\uC624\uCE74\uC0B0 \uACE0\uAE09 \uB9D0\uCC28 \uAC00\uB8E8\uC640 \uC2E0\uC120\uD55C \uC0DD\uC6B0\uC720\uAC00 \uC5B4\uC6B0\uB7EC\uC9C4 \uB9D0\uCC28 \uB77C\uB5BC."
    },
    priceVND: 6e4,
    priceKRW: 3800,
    priceUSD: 2.8,
    image: "\u{1F375}"
  },
  {
    id: "sp-3",
    category: "coldbrew",
    name: {
      vi: "S\xF4-c\xF4-la \u0110\xE1 Xay Mellodi",
      en: "Mellodi Cookies Frappe",
      ko: "\uBA5C\uB85C\uB514 \uCFE0\uD0A4 \uD504\uB77C\uD398"
    },
    description: {
      vi: "B\xE1nh cookies gi\xF2n r\u1EE5m xay c\xF9ng s\u1EEFa, s\xF4-c\xF4-la \u0111\u1EADm \u0111\xE0 v\xE0 ph\u1EE7 kem whipping b\xE9o ng\u1EADy.",
      en: "Crunchy chocolate cookies blended with milk, chocolate, and topped with rich whipped cream.",
      ko: "\uBC14\uC0AD\uD55C \uCFE0\uD0A4\uC640 \uB2EC\uCF64\uD55C \uCD08\uCF5C\uB9BF, \uC6B0\uC720\uB97C \uD568\uAED8 \uAC08\uC544 \uB9CC\uB4E0 \uC2DC\uC6D0\uD55C \uD504\uB77C\uD398."
    },
    priceVND: 65e3,
    priceKRW: 4200,
    priceUSD: 3,
    image: "\u{1F36A}"
  },
  // Category: pastry
  {
    id: "pas-1",
    category: "pastry",
    name: {
      vi: "B\xE1nh S\u1EEBng B\xF2 Tr\u1EE9ng Mu\u1ED1i Ch\u1EA3y",
      en: "Salted Egg Lava Croissant",
      ko: "\uC194\uD2F0\uB4DC \uC5D0\uADF8 \uB77C\uBC14 \uD06C\uB85C\uC640\uC0C1"
    },
    description: {
      vi: "B\xE1nh s\u1EEBng b\xF2 ng\xE0n l\u1EDBp n\u01B0\u1EDBng gi\xF2n r\u1EE5m v\u1EDBi nh\xE2n s\u1ED1t tr\u1EE9ng mu\u1ED1i ch\u1EA3y v\xE0ng \u01B0\u01A1m b\xE9o ng\u1EADy c\u1EF1c cu\u1ED1n.",
      en: "Golden flaky multi-layered croissant loaded with a rich flowing salted egg yolk custard filling.",
      ko: "\uACB9\uACB9\uC774 \uBC14\uC0AD\uD558\uAC8C \uAD6C\uC6B4 \uD06C\uB85C\uC640\uC0C1 \uC18D\uC744 \uD758\uB7EC\uB0B4\uB9AC\uB294 \uC9ED\uC870\uB984\uD558\uACE0 \uACE0\uC18C\uD55C \uB178\uB978\uC790 \uD06C\uB9BC\uC73C\uB85C \uCC44\uC6B4 \uBE75."
    },
    priceVND: 38e3,
    priceKRW: 2400,
    priceUSD: 1.7,
    image: "\u{1F950}",
    popular: true
  }
];

// src/api/admin.ts
var router8 = import_express8.default.Router();
function getFavoriteDrink(orders) {
  if (orders.length === 0) return "N/A";
  const counts = {};
  orders.forEach((o) => {
    o.items.forEach((item) => {
      const name = item.product.name.vi;
      counts[name] = (counts[name] || 0) + (item.quantity || 1);
    });
  });
  let fav = "N/A";
  let max = 0;
  Object.entries(counts).forEach(([name, count]) => {
    if (count > max) {
      max = count;
      fav = name;
    }
  });
  return fav;
}
router8.get("/customers", async (req, res) => {
  try {
    const search = (req.query.search || "").trim().toLowerCase();
    const tierFilter = req.query.tier || "all";
    const spendFilter = req.query.spend || "all";
    const allUsers = await getAllUsers();
    const allOrders = await getAllOrdersGlobal();
    const ordersByUser = {};
    allOrders.forEach((order) => {
      if (!ordersByUser[order.userId]) {
        ordersByUser[order.userId] = [];
      }
      ordersByUser[order.userId].push(order);
    });
    let customers = allUsers.map((user) => {
      const userOrders = ordersByUser[user.id] || [];
      const totalSpent = userOrders.reduce((sum, o) => sum + o.totalPrice, 0);
      const favoriteDrink = getFavoriteDrink(userOrders);
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        walletBalance: user.walletBalance,
        lenPoints: user.lenPoints,
        tier: user.tier,
        createdAt: user.createdAt,
        totalOrders: userOrders.length,
        totalSpent,
        favoriteDrink
      };
    });
    if (search) {
      customers = customers.filter(
        (c) => c.name.toLowerCase().includes(search) || c.email.toLowerCase().includes(search) || c.phone.includes(search)
      );
    }
    if (tierFilter !== "all") {
      customers = customers.filter((c) => c.tier === tierFilter);
    }
    if (spendFilter !== "all") {
      if (spendFilter === "under100") {
        customers = customers.filter((c) => c.totalSpent < 1e5);
      } else if (spendFilter === "100to500") {
        customers = customers.filter((c) => c.totalSpent >= 1e5 && c.totalSpent <= 5e5);
      } else if (spendFilter === "over500") {
        customers = customers.filter((c) => c.totalSpent > 5e5);
      }
    }
    res.json(customers);
  } catch (error) {
    console.error("Error getting customers list:", error);
    res.status(500).json({ error: "L\u1ED7i t\u1EA3i danh s\xE1ch kh\xE1ch h\xE0ng." });
  }
});
router8.get("/customers/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const allUsers = await getAllUsers();
    const user = allUsers.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y kh\xE1ch h\xE0ng n\xE0y!" });
    }
    const allOrders = await getAllOrdersGlobal();
    const allTransactions = await getAllTransactionsGlobal();
    const userOrders = allOrders.filter((o) => o.userId === userId);
    const userTransactions = allTransactions.filter((t) => t.userId === userId);
    const productCounts = {};
    userOrders.forEach((o) => {
      o.items.forEach((item) => {
        const prodId = item.productId;
        if (!productCounts[prodId]) {
          productCounts[prodId] = {
            name: item.product.name.vi,
            count: 0,
            category: item.product.category
          };
        }
        productCounts[prodId].count += item.quantity || 1;
      });
    });
    const preferences = Object.values(productCounts).sort((a, b) => b.count - a.count);
    const totalSpent = userOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const { password: _, ...safeUser } = user;
    res.json({
      user: safeUser,
      stats: {
        totalSpent,
        totalOrders: userOrders.length,
        averageOrderValue: userOrders.length > 0 ? Math.round(totalSpent / userOrders.length) : 0,
        favoriteDrink: getFavoriteDrink(userOrders)
      },
      preferences,
      orders: userOrders,
      transactions: userTransactions
    });
  } catch (error) {
    console.error("Error getting customer details:", error);
    res.status(500).json({ error: "L\u1ED7i t\u1EA3i th\xF4ng tin chi ti\u1EBFt kh\xE1ch h\xE0ng." });
  }
});
router8.get("/analytics", async (req, res) => {
  try {
    const allUsers = await getAllUsers();
    const allOrders = await getAllOrdersGlobal();
    const totalRevenue = allOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const totalPointsIssued = allUsers.reduce((sum, u) => sum + u.lenPoints, 0);
    const tiers = { Welcome: 0, Green: 0, Gold: 0 };
    allUsers.forEach((u) => {
      if (u.tier in tiers) {
        tiers[u.tier]++;
      }
    });
    const productCounts = {};
    allOrders.forEach((o) => {
      o.items.forEach((item) => {
        const prodId = item.productId;
        if (!productCounts[prodId]) {
          productCounts[prodId] = {
            name: item.product.name.vi,
            count: 0,
            revenue: 0,
            image: item.product.image
          };
        }
        productCounts[prodId].count += item.quantity || 1;
        productCounts[prodId].revenue += (item.product.priceVND * (item.size === "L" ? 1.2 : item.size === "M" ? 1.1 : 1) + item.toppings.length * 5e3) * item.quantity;
      });
    });
    const topProducts = Object.values(productCounts).sort((a, b) => b.count - a.count).slice(0, 5);
    res.json({
      summary: {
        totalCustomers: allUsers.length,
        totalOrders: allOrders.length,
        totalRevenue,
        totalPointsIssued,
        averageOrderValue: allOrders.length > 0 ? Math.round(totalRevenue / allOrders.length) : 0
      },
      tierDistribution: tiers,
      topProducts
    });
  } catch (error) {
    console.error("Error getting system analytics:", error);
    res.status(500).json({ error: "L\u1ED7i t\u1EA3i th\u1ED1ng k\xEA h\u1EC7 th\u1ED1ng." });
  }
});
router8.post("/seed-data", async (req, res) => {
  console.log("[Seed] Starting data seeding process...");
  const vnFirstNames = ["Nguy\u1EC5n", "Tr\u1EA7n", "L\xEA", "Ph\u1EA1m", "Ho\xE0ng", "Hu\u1EF3nh", "Phan", "V\u0169", "V\xF5", "\u0110\u1EB7ng", "B\xF9i", "\u0110\u1ED7", "H\u1ED3", "Ng\xF4", "D\u01B0\u01A1ng", "L\xFD"];
  const vnMiddleNames = ["V\u0103n", "Th\u1ECB", "Minh", "Anh", "\u0110\u1EE9c", "H\u1EA3i", "Tu\u1EA5n", "Ho\xE0i", "Ng\u1ECDc", "Xu\xE2n", "Thanh", "Qu\u1ED1c", "H\u1EEFu", "Kh\xE1nh", "Ph\u01B0\u01A1ng", "Tr\u1ECDng"];
  const vnLastNames = ["Anh", "D\u0169ng", "H\xF9ng", "C\u01B0\u1EDDng", "Trang", "Linh", "H\u01B0\u01A1ng", "Lan", "Nam", "B\xECnh", "S\u01A1n", "Long", "Ph\xFAc", "T\xE2m", "Vy", "H\xE0", "Tu\u1EA5n", "Minh", "\u0110\xF4ng"];
  const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const randomRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  try {
    const createdUsers = [];
    for (let i = 1; i <= 52; i++) {
      const name = `${randomItem(vnFirstNames)} ${randomItem(vnMiddleNames)} ${randomItem(vnLastNames)}`;
      const email = `customer.${i}.${Math.random().toString(36).substring(2, 5)}@gmail.com`.toLowerCase();
      const phone = `09${randomRange(1e7, 99999999)}`;
      const userId = `u-seed-${1e3 + i}`;
      let tier = "Welcome";
      let lenPoints = randomRange(0, 15e3);
      let walletBalance = randomRange(0, 15e4);
      const tierRoll = Math.random();
      if (tierRoll > 0.88) {
        tier = "Gold";
        lenPoints = randomRange(5e4, 18e4);
        walletBalance = randomRange(1e5, 85e4);
      } else if (tierRoll > 0.6) {
        tier = "Green";
        lenPoints = randomRange(2e4, 48e3);
        walletBalance = randomRange(3e4, 45e4);
      }
      const joinDaysAgo = randomRange(1, 45);
      const createdAt = new Date(Date.now() - joinDaysAgo * 24 * 60 * 60 * 1e3).toISOString();
      const user = {
        id: userId,
        name,
        email,
        phone,
        walletBalance,
        lenPoints,
        tier,
        createdAt
      };
      await createUser(user);
      createdUsers.push(user);
      const orderCount = randomRange(1, 7);
      for (let j = 1; j <= orderCount; j++) {
        const orderId = `MEL-SEED-${userId.split("-")[2]}-${j}`;
        const itemCount = randomRange(1, 3);
        const orderItems = [];
        let totalPriceVND = 0;
        for (let k = 0; k < itemCount; k++) {
          const prod = randomItem(products);
          const size = randomItem(["S", "M", "L"]);
          const qty = randomRange(1, 2);
          const sizeMultiplier = size === "L" ? 1.2 : size === "M" ? 1.1 : 1;
          const toppingsCost = randomRange(0, 2) * 5e3;
          const itemCost = Math.round(prod.priceVND * sizeMultiplier + toppingsCost);
          orderItems.push({
            id: `item-${j}-${k}-${Math.random().toString(36).substring(2, 5)}`,
            productId: prod.id,
            product: prod,
            size,
            ice: randomItem(["50%", "100%"]),
            sugar: randomItem(["50%", "100%"]),
            toppings: toppingsCost > 0 ? ["Tr\xE2n ch\xE2u ho\xE0ng kim"] : [],
            quantity: qty,
            note: ""
          });
          totalPriceVND += itemCost * qty;
        }
        const orderDate = new Date(new Date(createdAt).getTime() + randomRange(1, joinDaysAgo) * 24 * 60 * 60 * 1e3).toISOString();
        const pointsEarned = Math.round(totalPriceVND * 0.1);
        const order = {
          id: orderId,
          userId,
          items: orderItems,
          totalPrice: totalPriceVND,
          currency: "VND",
          pointsEarned,
          pointsUsed: 0,
          paymentMethod: randomItem(["wallet", "vietqr", "cash"]),
          status: "completed",
          date: new Date(orderDate).toLocaleString()
        };
        await createOrder(order);
      }
      const txCount = randomRange(1, 3);
      for (let t = 1; t <= txCount; t++) {
        const txId = `TX-SEED-${userId.split("-")[2]}-${t}`;
        const amountVND = randomItem([5e4, 1e5, 2e5, 5e5]);
        const txDate = new Date(new Date(createdAt).getTime() + randomRange(0, joinDaysAgo) * 24 * 60 * 60 * 1e3).toISOString();
        const tx = {
          id: txId,
          userId,
          type: "topup",
          amountVND,
          paymentMethod: randomItem(["VietQR_Transfer", "Napas_CreditCard"]),
          status: "success",
          date: new Date(txDate).toLocaleString()
        };
        await createTransaction(tx);
      }
    }
    res.json({
      success: true,
      message: `\u0110\xE3 n\u1EA1p th\xE0nh c\xF4ng b\u1ED9 d\u1EEF li\u1EC7u l\u1EDBn g\u1ED3m ${createdUsers.length} kh\xE1ch h\xE0ng VIP, c\xF9ng h\u01A1n 200 \u0111\u01A1n h\xE0ng v\xE0 giao d\u1ECBch n\u1EA1p v\xED th\u1EF1c t\u1EBF!`
    });
  } catch (err) {
    console.error("Failed to seed database:", err);
    res.status(500).json({ error: "L\u1ED7i h\u1EC7 th\u1ED1ng trong qu\xE1 tr\xECnh t\u1EA1o d\u1EEF li\u1EC7u l\u1EDBn gi\u1EA3 l\u1EADp." });
  }
});
router8.get("/education-consultations", async (req, res) => {
  try {
    const consultations = await getAllEducationConsultationsGlobal();
    res.json(consultations);
  } catch (error) {
    console.error("Get education consultations error:", error);
    res.status(500).json({ error: "L\u1ED7i h\u1EC7 th\u1ED1ng l\u1EA5y danh s\xE1ch \u0111\u0103ng k\xFD." });
  }
});
var admin_default = router8;

// src/api/education.ts
var import_express9 = __toESM(require("express"), 1);
var router9 = import_express9.default.Router();
router9.post("/register", async (req, res) => {
  let { name, email, phone } = req.body;
  if (typeof name !== "string" || typeof email !== "string" || typeof phone !== "string") {
    return res.status(400).json({ error: "D\u1EEF li\u1EC7u \u0111\u0103ng k\xFD kh\xF4ng h\u1EE3p l\u1EC7! Vui l\xF2ng nh\u1EADp \u0111\u1EA7y \u0111\u1EE7." });
  }
  name = name.trim();
  email = email.trim().toLowerCase();
  phone = phone.trim();
  if (!name || !email || !phone) {
    return res.status(400).json({ error: "Vui l\xF2ng \u0111i\u1EC1n \u0111\u1EA7y \u0111\u1EE7 t\u1EA5t c\u1EA3 c\xE1c th\xF4ng tin!" });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "\u0110\u1ECBa ch\u1EC9 email kh\xF4ng h\u1EE3p l\u1EC7!" });
  }
  try {
    const newConsultation = {
      id: `edu-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      name,
      email,
      phone,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "pending"
    };
    await createEducationConsultation(newConsultation);
    res.json({ success: true, message: "\u0110\u0103ng k\xFD nh\u1EADn t\u01B0 v\u1EA5n du h\u1ECDc H\xE0n Qu\u1ED1c th\xE0nh c\xF4ng! \u0110\u1ED9i ng\u0169 Mellodi & J2H2 Global s\u1EBD li\xEAn h\u1EC7 v\u1EDBi b\u1EA1n trong th\u1EDDi gian s\u1EDBm nh\u1EA5t." });
  } catch (error) {
    console.error("Education registration error:", error);
    res.status(500).json({ error: "L\u1ED7i h\u1EC7 th\u1ED1ng \u0111\u0103ng k\xFD nh\u1EADn t\u01B0 v\u1EA5n." });
  }
});
var education_default = router9;

// src/api/index.ts
var apiRouter = import_express10.default.Router();
apiRouter.use("/auth", auth_default);
apiRouter.use("/wallet", wallet_default);
apiRouter.use("/orders", orders_default);
apiRouter.use("/gifts", gifts_default);
apiRouter.use("/notifications", notifications_default);
apiRouter.use("/users", users_default);
apiRouter.use("/payment", webhook_default);
apiRouter.use("/admin", admin_default);
apiRouter.use("/education", education_default);
var api_default = apiRouter;

// server.ts
var app = (0, import_express11.default)();
var PORT = 3e3;
app.use(import_express11.default.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: (/* @__PURE__ */ new Date()).toISOString() });
});
app.get("/api/sse", (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).end("Missing userId");
  }
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Connection": "keep-alive",
    "Cache-Control": "no-cache"
  });
  res.write(`event: connected
data: ${JSON.stringify({ status: "connected" })}

`);
  addClient(userId, res);
  req.on("close", () => {
    removeClient(userId, res);
  });
});
app.use("/api", api_default);
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path2.default.join(process.cwd(), "dist");
    app.use(import_express11.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path2.default.join(distPath, "index.html"));
    });
  }
}
initServer().then(() => {
  if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[Server] Mellodi Full-Stack listening on port ${PORT}`);
    });
  }
});
var server_default = app;
//# sourceMappingURL=server.cjs.map
