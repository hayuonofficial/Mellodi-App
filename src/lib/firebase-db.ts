import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  setDoc, 
  updateDoc,
  deleteDoc,
  query,
  where
} from "firebase/firestore";
import fs from "fs";
import path from "path";

// Helper to wrap Firestore operations with a timeout to prevent hanging when offline or blocked
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 3500): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Firestore operation timeout")), timeoutMs);
  });

  // Attach a catch handler to the original promise to prevent unhandled rejections
  // if the timeout happens first.
  promise.catch((err) => {
    console.warn("[Database] Background Firestore operation failed or timed out:", err.message || err);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (error) {
    clearTimeout(timeoutId!);
    throw error;
  }
}

// Support both Cloud Firestore (production/connected environment) and local JSON (development/offline environment)
let firestoreDb: any = null;
export let isFirebaseAvailable = false;

try {
  let firebaseConfig: any = {
    apiKey: "AIzaSyDHnlmY5BMs8yps7A0UaVO6WfY33Cbjvg0",
    authDomain: "mellodidatabase.firebaseapp.com",
    projectId: "mellodidatabase",
    storageBucket: "mellodidatabase.firebasestorage.app",
    messagingSenderId: "762274784498",
    appId: "1:762274784498:web:1b6fb8f376975069e31c6b",
    measurementId: "G-SZDNTTJSPS"
  };

  // 1. Check if environment variables are set (Standard for production deployments)
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
    const app = initializeApp(firebaseConfig);
    firestoreDb = firebaseConfig.firestoreDatabaseId 
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);
    isFirebaseAvailable = true;
    console.log("[Database] Successfully connected to Google Cloud Firestore Environment");
  } else {
    console.log("[Database] Firebase configuration not found. Falling back to local file environment.");
  }
} catch (e) {
  console.warn("[Database] Firebase initialization skipped or failed. Falling back to local file environment.", e);
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  walletBalance: number;
  lenPoints: number;
  tier: "Welcome" | "Green" | "Gold";
  createdAt: string;
  biometricEnabled?: boolean;
  biometricToken?: string;
}

export interface UserNotification {
  id: string;
  userId: string;
  title: Record<string, string>;
  message: Record<string, string>;
  type: "order" | "wallet" | "gift" | "system";
  date: string;
  isRead: boolean;
}

export interface OrderRecord {
  id: string;
  userId: string;
  items: any[];
  totalPrice: number;
  currency: string;
  pointsEarned: number;
  pointsUsed: number;
  paymentMethod: string;
  status: string;
  date: string;
}

export interface TransactionRecord {
  id: string;
  userId: string;
  type: "topup" | "convert";
  amountVND: number;
  pointsAmount?: number;
  paymentMethod?: string;
  status: "success" | "pending" | "failed";
  date: string;
}

export interface RedeemedGift {
  id: string;
  userId: string;
  giftId: string;
  giftName: Record<string, string>;
  costPoints: number;
  redeemedDate: string;
  claimCode: string;
  status: "active" | "claimed";
  recipientName?: string;
  recipientPhone?: string;
  recipientEmail?: string;
  pickupBranch?: string;
}

export interface EducationConsultation {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  status: "pending" | "contacted" | "cancelled";
}

export interface DatabaseSchema {
  users: UserRecord[];
  orders: OrderRecord[];
  transactions: TransactionRecord[];
  redeemedGifts?: RedeemedGift[];
  notifications?: UserNotification[];
  educationConsultations?: EducationConsultation[];
}

const localDbPath = path.join(process.cwd(), "local_db.json");

const DEFAULT_LOCAL_DB: DatabaseSchema = {
  users: [
    {
      id: "u-admin",
      name: "Mellodi Admin",
      email: "admin@mellodi.com",
      phone: "0123456789",
      password: "$2b$10$CZ33M5295rSHKjGNPyrdnOxIOMIhMypsbzeek.E43tNtNCE9b8CTO", // Hashed "Abc@123"
      walletBalance: 1000000,
      lenPoints: 50000,
      tier: "Gold",
      createdAt: new Date().toISOString()
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
        vi: "Chào mừng đến với Mellodi Loyalty!",
        en: "Welcome to Mellodi Loyalty!",
        ko: "멜로디 로열티에 오신 것을 환영합니다!"
      },
      message: {
        vi: "Chào mừng Admin đến với hệ thống Mellodi Coffee Loyalty.",
        en: "Welcome Admin to Mellodi Coffee Loyalty system.",
        ko: "멜로디 커피 로열티 hệ thống에 오신 것을 환영합니다."
      },
      type: "system",
      date: new Date().toLocaleString(),
      isRead: false
    }
  ]
};

function readLocalDb(): DatabaseSchema {
  try {
    if (fs.existsSync(localDbPath)) {
      const content = fs.readFileSync(localDbPath, "utf-8");
      const data = JSON.parse(content);
      // Safeguard against missing or malformed database fields
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

function writeLocalDb(data: DatabaseSchema) {
  try {
    fs.writeFileSync(localDbPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("[Database] Failed to write local_db.json file:", err);
  }
}

// ==========================================
// GRANULAR DATABASE OPERATIONS
// ==========================================

// --- USER OPERATIONS ---
export async function getUser(userId: string): Promise<UserRecord | null> {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      const userRef = doc(firestoreDb, "users", userId);
      const userSnap = await withTimeout(getDoc(userRef));
      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() } as UserRecord;
      }
      return null;
    } catch (e) {
      console.error("[Database] Error getting user from Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  return db.users.find(u => u.id === userId) || null;
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const cleanEmail = email.toLowerCase().trim();
  if (isFirebaseAvailable && firestoreDb) {
    try {
      const q = query(collection(firestoreDb, "users"), where("email", "==", cleanEmail));
      const querySnap = await withTimeout(getDocs(q));
      if (!querySnap.empty) {
        const docSnap = querySnap.docs[0];
        return { id: docSnap.id, ...docSnap.data() } as UserRecord;
      }
      return null;
    } catch (e) {
      console.error("[Database] Error getting user by email from Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  return db.users.find(u => u.email.toLowerCase() === cleanEmail) || null;
}

export async function createUser(user: UserRecord): Promise<void> {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      await withTimeout(setDoc(doc(firestoreDb, "users", user.id), user));
      return;
    } catch (e) {
      console.error("[Database] Error creating user in Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  db.users.push(user);
  writeLocalDb(db);
}

export async function updateUser(userId: string, updates: Partial<UserRecord>): Promise<UserRecord | null> {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      const userRef = doc(firestoreDb, "users", userId);
      await withTimeout(updateDoc(userRef, updates));
      const userSnap = await withTimeout(getDoc(userRef));
      return { id: userSnap.id, ...userSnap.data() } as UserRecord;
    } catch (e) {
      console.error("[Database] Error updating user in Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  const index = db.users.findIndex(u => u.id === userId);
  if (index !== -1) {
    db.users[index] = { ...db.users[index], ...updates };
    writeLocalDb(db);
    return db.users[index];
  }
  return null;
}

// --- ORDER OPERATIONS ---
export async function createOrder(order: OrderRecord): Promise<void> {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      await withTimeout(setDoc(doc(firestoreDb, "orders", order.id), order));
      return;
    } catch (e) {
      console.error("[Database] Error creating order in Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  db.orders.unshift(order);
  writeLocalDb(db);
}

export async function getUserOrders(userId: string): Promise<OrderRecord[]> {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      const q = query(collection(firestoreDb, "orders"), where("userId", "==", userId));
      const querySnap = await withTimeout(getDocs(q));
      const orders = querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as OrderRecord[];
      return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e) {
      console.error("[Database] Error getting user orders from Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  return db.orders.filter(o => o.userId === userId);
}

export async function getOrder(orderId: string): Promise<OrderRecord | null> {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      const orderRef = doc(firestoreDb, "orders", orderId);
      const orderSnap = await withTimeout(getDoc(orderRef));
      if (orderSnap.exists()) {
        return { id: orderSnap.id, ...orderSnap.data() } as OrderRecord;
      }
      return null;
    } catch (e) {
      console.error("[Database] Error getting order from Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  return db.orders.find(o => o.id === orderId) || null;
}

export async function updateOrder(orderId: string, updates: Partial<OrderRecord>): Promise<OrderRecord | null> {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      const orderRef = doc(firestoreDb, "orders", orderId);
      await withTimeout(updateDoc(orderRef, updates));
      const orderSnap = await withTimeout(getDoc(orderRef));
      return { id: orderSnap.id, ...orderSnap.data() } as OrderRecord;
    } catch (e) {
      console.error("[Database] Error updating order in Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  const index = db.orders.findIndex(o => o.id === orderId);
  if (index !== -1) {
    db.orders[index] = { ...db.orders[index], ...updates };
    writeLocalDb(db);
    return db.orders[index];
  }
  return null;
}

// --- TRANSACTION OPERATIONS ---
export async function createTransaction(tx: TransactionRecord): Promise<void> {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      await withTimeout(setDoc(doc(firestoreDb, "transactions", tx.id), tx));
      return;
    } catch (e) {
      console.error("[Database] Error creating transaction in Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  db.transactions.push(tx);
  writeLocalDb(db);
}

export async function getUserTransactions(userId: string): Promise<TransactionRecord[]> {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      const q = query(collection(firestoreDb, "transactions"), where("userId", "==", userId));
      const querySnap = await withTimeout(getDocs(q));
      const txs = querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TransactionRecord[];
      return txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e) {
      console.error("[Database] Error getting transactions from Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  return db.transactions.filter(t => t.userId === userId);
}

// --- REWARDS / REDEEMED GIFTS OPERATIONS ---
export async function createRedeemedGift(gift: RedeemedGift): Promise<void> {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      await withTimeout(setDoc(doc(firestoreDb, "redeemedGifts", gift.id), gift));
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

export async function getUserRedeemedGifts(userId: string): Promise<RedeemedGift[]> {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      const q = query(collection(firestoreDb, "redeemedGifts"), where("userId", "==", userId));
      const querySnap = await withTimeout(getDocs(q));
      const gifts = querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as RedeemedGift[];
      return gifts.sort((a, b) => new Date(b.redeemedDate).getTime() - new Date(a.redeemedDate).getTime());
    } catch (e) {
      console.error("[Database] Error getting user redeemed gifts from Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  return (db.redeemedGifts || []).filter(g => g.userId === userId);
}

export async function getRedeemedGift(giftId: string): Promise<RedeemedGift | null> {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      const giftRef = doc(firestoreDb, "redeemedGifts", giftId);
      const giftSnap = await withTimeout(getDoc(giftRef));
      if (giftSnap.exists()) {
        return { id: giftSnap.id, ...giftSnap.data() } as RedeemedGift;
      }
      return null;
    } catch (e) {
      console.error("[Database] Error getting redeemed gift from Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  return (db.redeemedGifts || []).find(g => g.id === giftId) || null;
}

export async function updateRedeemedGift(giftId: string, updates: Partial<RedeemedGift>): Promise<RedeemedGift | null> {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      const giftRef = doc(firestoreDb, "redeemedGifts", giftId);
      await withTimeout(updateDoc(giftRef, updates));
      const giftSnap = await withTimeout(getDoc(giftRef));
      return { id: giftSnap.id, ...giftSnap.data() } as RedeemedGift;
    } catch (e) {
      console.error("[Database] Error updating redeemed gift in Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  if (!db.redeemedGifts) db.redeemedGifts = [];
  const index = db.redeemedGifts.findIndex(g => g.id === giftId);
  if (index !== -1) {
    db.redeemedGifts[index] = { ...db.redeemedGifts[index], ...updates };
    writeLocalDb(db);
    return db.redeemedGifts[index];
  }
  return null;
}

// --- NOTIFICATION OPERATIONS ---
export async function getUserNotifications(userId: string): Promise<UserNotification[]> {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      const q = query(collection(firestoreDb, "notifications"), where("userId", "==", userId));
      const querySnap = await withTimeout(getDocs(q));
      const notifs = querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as UserNotification[];
      return notifs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e) {
      console.error("[Database] Error getting user notifications from Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  return (db.notifications || []).filter(n => n.userId === userId);
}

export async function createNotification(notification: UserNotification): Promise<void> {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      await withTimeout(setDoc(doc(firestoreDb, "notifications", notification.id), notification));
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

export async function markNotificationRead(notificationId: string, userId: string): Promise<void> {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      const ref = doc(firestoreDb, "notifications", notificationId);
      await withTimeout(updateDoc(ref, { isRead: true }));
      return;
    } catch (e) {
      console.error("[Database] Error marking notification read in Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  if (!db.notifications) db.notifications = [];
  const index = db.notifications.findIndex(n => n.id === notificationId && n.userId === userId);
  if (index !== -1) {
    db.notifications[index].isRead = true;
    writeLocalDb(db);
  }
}

export async function getTransaction(txId: string): Promise<TransactionRecord | null> {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      const txRef = doc(firestoreDb, "transactions", txId);
      const txSnap = await withTimeout(getDoc(txRef));
      if (txSnap.exists()) {
        return { id: txSnap.id, ...txSnap.data() } as TransactionRecord;
      }
      return null;
    } catch (e) {
      console.error("[Database] Error getting transaction from Firestore:", e);
    }
  }
  const db = readLocalDb();
  return db.transactions.find(t => t.id === txId) || null;
}

export async function updateTransaction(txId: string, updates: Partial<TransactionRecord>): Promise<TransactionRecord | null> {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      const txRef = doc(firestoreDb, "transactions", txId);
      await withTimeout(updateDoc(txRef, updates));
      const txSnap = await withTimeout(getDoc(txRef));
      return { id: txSnap.id, ...txSnap.data() } as TransactionRecord;
    } catch (e) {
      console.error("[Database] Error updating transaction in Firestore:", e);
    }
  }
  const db = readLocalDb();
  const index = db.transactions.findIndex(t => t.id === txId);
  if (index !== -1) {
    db.transactions[index] = { ...db.transactions[index], ...updates };
    writeLocalDb(db);
    return db.transactions[index];
  }
  return null;
}


export async function markAllNotificationsRead(userId: string): Promise<void> {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      const q = query(
        collection(firestoreDb, "notifications"), 
        where("userId", "==", userId), 
        where("isRead", "==", false)
      );
      const querySnap = await withTimeout(getDocs(q));
      const promises = querySnap.docs.map(d => withTimeout(updateDoc(doc(firestoreDb, "notifications", d.id), { isRead: true })));
      await Promise.all(promises);
      return;
    } catch (e) {
      console.error("[Database] Error marking all notifications read in Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  if (!db.notifications) db.notifications = [];
  db.notifications.forEach(n => {
    if (n.userId === userId) {
      n.isRead = true;
    }
  });
  writeLocalDb(db);
}

export async function deleteNotification(notificationId: string, userId: string): Promise<void> {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      await withTimeout(deleteDoc(doc(firestoreDb, "notifications", notificationId)));
      return;
    } catch (e) {
      console.error("[Database] Error deleting notification in Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  if (!db.notifications) db.notifications = [];
  db.notifications = db.notifications.filter(n => !(n.id === notificationId && n.userId === userId));
  writeLocalDb(db);
}

export async function getAllUsers(): Promise<UserRecord[]> {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      const querySnap = await withTimeout(getDocs(collection(firestoreDb, "users")));
      return querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as UserRecord[];
    } catch (e) {
      console.error("[Database] Error getting all users from Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  return db.users;
}

export async function getAllOrdersGlobal(): Promise<OrderRecord[]> {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      const querySnap = await withTimeout(getDocs(collection(firestoreDb, "orders")));
      const orders = querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as OrderRecord[];
      return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e) {
      console.error("[Database] Error getting all orders from Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  return db.orders;
}

export async function getAllTransactionsGlobal(): Promise<TransactionRecord[]> {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      const querySnap = await withTimeout(getDocs(collection(firestoreDb, "transactions")));
      const txs = querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TransactionRecord[];
      return txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e) {
      console.error("[Database] Error getting all transactions from Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  return db.transactions;
}

// --- EDUCATION / STUDY ABROAD OPERATIONS ---
export async function createEducationConsultation(consultation: EducationConsultation): Promise<void> {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      await withTimeout(setDoc(doc(firestoreDb, "educationConsultations", consultation.id), consultation));
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

export async function getAllEducationConsultationsGlobal(): Promise<EducationConsultation[]> {
  if (isFirebaseAvailable && firestoreDb) {
    try {
      const querySnap = await withTimeout(getDocs(collection(firestoreDb, "educationConsultations")));
      const consultations = querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as EducationConsultation[];
      return consultations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (e) {
      console.error("[Database] Error getting all education consultations from Firestore, falling back:", e);
    }
  }
  const db = readLocalDb();
  return db.educationConsultations || [];
}

