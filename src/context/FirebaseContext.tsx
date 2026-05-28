/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  serverTimestamp, 
  getDocs,
  getDoc,
  getDocFromServer,
  query,
  limit
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { PayFrequency } from '../types';

// Matching Planner items
export interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  frequency: PayFrequency;
  category: 'housing' | 'transport' | 'utilities' | 'food' | 'loans' | 'personal' | 'savings';
  createdAt?: any;
  updatedAt?: any;
}

export interface IncomeItem {
  id: string;
  name: string;
  amount: number;
  frequency: PayFrequency;
  category: 'side_hustle' | 'farming' | 'rental' | 'dividends' | 'other_income';
  createdAt?: any;
  updatedAt?: any;
}

export interface UserSettings {
  salary: number;
  frequency: PayFrequency;
  residencyStatus: 'resident' | 'non-resident';
  fnpfPercent: number;
  isFnpfTaxExempt: boolean;
  hoursPerWeek: number;
  daysPerWeek: number;
}

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  isLoggingIn: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  
  // Real-time synced state
  expenses: ExpenseItem[];
  incomes: IncomeItem[];
  settings: UserSettings | null;
  
  // State mutations
  addExpense: (expense: Omit<ExpenseItem, 'id'>) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Omit<ExpenseItem, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  
  addIncome: (income: Omit<IncomeItem, 'id'>) => Promise<void>;
  updateIncome: (id: string, updates: Partial<Omit<IncomeItem, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;

  saveSettings: (newSettings: UserSettings) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Synced local and database items
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [incomes, setIncomes] = useState<IncomeItem[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  // 1. Critical Requirement: Test server connectivity on initialization
  useEffect(() => {
    async function testConnection() {
      try {
        const testDocRef = doc(db, 'test', 'connection');
        await getDocFromServer(testDocRef);
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.warn("Firestore client is offline. Local storage will be preferred for guest operations.");
        }
      }
    }
    testConnection();
  }, []);

  // 2. Setup auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      setIsLoggingIn(false);

      if (firebaseUser) {
        // Create user entry document silently with server timestamp
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          await setDoc(userDocRef, {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || '',
            updatedAt: serverTimestamp()
          }, { merge: true });
        } catch (e) {
          console.error("Failed to create user profile in Firestore", e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 3. Sync mechanism: Guest Mode (local storage) vs. Firebase User Sync
  useEffect(() => {
    if (loading) return;

    if (!user) {
      // GUEST MODE: Read from local storage
      const savedExpenses = localStorage.getItem('fiji_wages_expenses');
      if (savedExpenses) {
        try {
          setExpenses(JSON.parse(savedExpenses));
        } catch (e) {
          setExpenses(getDefaultExpenses());
        }
      } else {
        setExpenses(getDefaultExpenses());
      }

      const savedIncomes = localStorage.getItem('fiji_wages_other_incomes');
      if (savedIncomes) {
        try {
          setIncomes(JSON.parse(savedIncomes));
        } catch (e) {
          setIncomes(getDefaultIncomes());
        }
      } else {
        setIncomes(getDefaultIncomes());
      }

      const savedSettings = localStorage.getItem('fiji_wages_core_settings');
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings));
        } catch (e) {
          setSettings(null);
        }
      } else {
        setSettings(null);
      }
    } else {
      // LOGGED IN MODE: Sync in real-time with Firestore subcollections
      const optErrorOnSnap = (error: any, path: string) => {
        handleFirestoreError(error, OperationType.GET, path);
      };

      const expensesPath = `users/${user.uid}/expenses`;
      const unsubscribeExpenses = onSnapshot(collection(db, 'users', user.uid, 'expenses'), (snap) => {
        const list: ExpenseItem[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            name: data.name,
            amount: data.amount,
            frequency: data.frequency,
            category: data.category,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
          });
        });
        setExpenses(list);
      }, (err) => optErrorOnSnap(err, expensesPath));

      const incomesPath = `users/${user.uid}/incomes`;
      const unsubscribeIncomes = onSnapshot(collection(db, 'users', user.uid, 'incomes'), (snap) => {
        const list: IncomeItem[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            name: data.name,
            amount: data.amount,
            frequency: data.frequency,
            category: data.category,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
          });
        });
        setIncomes(list);
      }, (err) => optErrorOnSnap(err, incomesPath));

      const settingsPath = `users/${user.uid}/settings/calculator`;
      const unsubscribeSettings = onSnapshot(doc(db, 'users', user.uid, 'settings', 'calculator'), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSettings({
            salary: data.salary,
            frequency: data.frequency,
            residencyStatus: data.residencyStatus,
            fnpfPercent: data.fnpfPercent,
            isFnpfTaxExempt: data.isFnpfTaxExempt,
            hoursPerWeek: data.hoursPerWeek,
            daysPerWeek: data.daysPerWeek
          });
        } else {
          setSettings(null);
        }
      }, (err) => optErrorOnSnap(err, settingsPath));

      // 4. Guest-to-User State Migration
      // If the user logs in and their Firestore collections are empty (first time),
      // upload their local guest dataset so they do not lose progress!
      async function migrateGuestData() {
        try {
          const expensesCol = collection(db, 'users', user.uid, 'expenses');
          const incomesCol = collection(db, 'users', user.uid, 'incomes');
          
          const expSnap = await getDocs(query(expensesCol, limit(1)));
          const incSnap = await getDocs(query(incomesCol, limit(1)));

          const localExp = localStorage.getItem('fiji_wages_expenses');
          const localInc = localStorage.getItem('fiji_wages_other_incomes');
          const localSet = localStorage.getItem('fiji_wages_core_settings');

          // Migrate expenses if cloud is empty and local client has dirty draft items
          if (expSnap.empty && localExp) {
            const parsed = JSON.parse(localExp) as ExpenseItem[];
            for (const item of parsed) {
              const safeId = item.id.replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 100) || crypto.randomUUID();
              await setDoc(doc(db, 'users', user.uid, 'expenses', safeId), {
                id: safeId,
                name: item.name,
                amount: item.amount,
                frequency: item.frequency,
                category: item.category,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              });
            }
          }

          // Migrate incomes if cloud is empty
          if (incSnap.empty && localInc) {
            const parsed = JSON.parse(localInc) as IncomeItem[];
            for (const item of parsed) {
              const safeId = item.id.replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 100) || crypto.randomUUID();
              await setDoc(doc(db, 'users', user.uid, 'incomes', safeId), {
                id: safeId,
                name: item.name,
                amount: item.amount,
                frequency: item.frequency,
                category: item.category,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              });
            }
          }

          // Migrate settings
          if (localSet) {
            const settingsDocRef = doc(db, 'users', user.uid, 'settings', 'calculator');
            const settingsSnap = await getDoc(settingsDocRef);
            if (!settingsSnap.exists()) {
              const parsed = JSON.parse(localSet) as UserSettings;
              await setDoc(settingsDocRef, {
                ...parsed,
                updatedAt: serverTimestamp()
              });
            }
          }
        } catch (e) {
          console.error("Error migrating guest items to user profile in Firestore", e);
        }
      }
      migrateGuestData();

      return () => {
        unsubscribeExpenses();
        unsubscribeIncomes();
        unsubscribeSettings();
      };
    }
  }, [user, loading]);

  // Sync back to local storage ONLY in GUEST mode to persist offline sessions
  useEffect(() => {
    if (!user && !loading) {
      localStorage.setItem('fiji_wages_expenses', JSON.stringify(expenses));
    }
  }, [expenses, user, loading]);

  useEffect(() => {
    if (!user && !loading) {
      localStorage.setItem('fiji_wages_other_incomes', JSON.stringify(incomes));
    }
  }, [incomes, user, loading]);

  // Helper Defaults
  function getDefaultExpenses(): ExpenseItem[] {
    return [
      { id: '1', name: 'Suva / Nadi Flat Rent', amount: 650, frequency: 'monthly', category: 'housing' },
      { id: '2', name: 'EFL Electricity Bill', amount: 80, frequency: 'monthly', category: 'utilities' },
      { id: '3', name: 'Municipal Market & Groceries', amount: 120, frequency: 'fortnightly', category: 'food' },
      { id: '4', name: 'Minibus / Bus Fare commute', amount: 30, frequency: 'weekly', category: 'transport' },
      { id: '5', name: 'Courts Hire Purchase', amount: 75, frequency: 'monthly', category: 'loans' },
    ];
  }

  function getDefaultIncomes(): IncomeItem[] {
    return [
      { id: 'inc-1', name: 'Weekend Market Vending', amount: 90, frequency: 'weekly', category: 'farming' }
    ];
  }

  // AUTH ACTIONS
  async function loginWithGoogle() {
    setIsLoggingIn(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error("Failed to sign in with Google Popup", e);
      setIsLoggingIn(false);
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      setExpenses(getDefaultExpenses());
      setIncomes(getDefaultIncomes());
      setSettings(null);
    } catch (e) {
      console.error("Failed to sign out", e);
    }
  }

  // MUTATIONS (Guest writes to local state, User writes to cloud Firestore)
  async function addExpense(item: Omit<ExpenseItem, 'id'>) {
    const rawId = crypto.randomUUID();
    const safeId = rawId.replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 100);

    if (!user) {
      const newItem: ExpenseItem = { ...item, id: safeId };
      setExpenses(prev => [...prev, newItem]);
    } else {
      const docPath = `users/${user.uid}/expenses/${safeId}`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'expenses', safeId), {
          id: safeId,
          name: item.name,
          amount: item.amount,
          frequency: item.frequency,
          category: item.category,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, docPath);
      }
    }
  }

  async function updateExpense(id: string, updates: Partial<Omit<ExpenseItem, 'id' | 'createdAt' | 'updatedAt'>>) {
    if (!user) {
      setExpenses(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    } else {
      const docPath = `users/${user.uid}/expenses/${id}`;
      try {
        // Enforce the full schema check. Under rules, updates must be run via valid schema write
        const docRef = doc(db, 'users', user.uid, 'expenses', id);
        const currentDoc = await getDoc(docRef);
        if (currentDoc.exists()) {
          const currentData = currentDoc.data();
          await setDoc(docRef, {
            id: currentData.id,
            name: updates.name !== undefined ? updates.name : currentData.name,
            amount: updates.amount !== undefined ? updates.amount : currentData.amount,
            frequency: updates.frequency !== undefined ? updates.frequency : currentData.frequency,
            category: updates.category !== undefined ? updates.category : currentData.category,
            createdAt: currentData.createdAt,
            updatedAt: serverTimestamp()
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, docPath);
      }
    }
  }

  async function deleteExpense(id: string) {
    if (!user) {
      setExpenses(prev => prev.filter(item => item.id !== id));
    } else {
      const docPath = `users/${user.uid}/expenses/${id}`;
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'expenses', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, docPath);
      }
    }
  }

  async function addIncome(item: Omit<IncomeItem, 'id'>) {
    const rawId = crypto.randomUUID();
    const safeId = rawId.replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 100);

    if (!user) {
      const newItem: IncomeItem = { ...item, id: safeId };
      setIncomes(prev => [...prev, newItem]);
    } else {
      const docPath = `users/${user.uid}/incomes/${safeId}`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'incomes', safeId), {
          id: safeId,
          name: item.name,
          amount: item.amount,
          frequency: item.frequency,
          category: item.category,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, docPath);
      }
    }
  }

  async function updateIncome(id: string, updates: Partial<Omit<IncomeItem, 'id' | 'createdAt' | 'updatedAt'>>) {
    if (!user) {
      setIncomes(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    } else {
      const docPath = `users/${user.uid}/incomes/${id}`;
      try {
        const docRef = doc(db, 'users', user.uid, 'incomes', id);
        const currentDoc = await getDoc(docRef);
        if (currentDoc.exists()) {
          const currentData = currentDoc.data();
          await setDoc(docRef, {
            id: currentData.id,
            name: updates.name !== undefined ? updates.name : currentData.name,
            amount: updates.amount !== undefined ? updates.amount : currentData.amount,
            frequency: updates.frequency !== undefined ? updates.frequency : currentData.frequency,
            category: updates.category !== undefined ? updates.category : currentData.category,
            createdAt: currentData.createdAt,
            updatedAt: serverTimestamp()
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, docPath);
      }
    }
  }

  async function deleteIncome(id: string) {
    if (!user) {
      setIncomes(prev => prev.filter(item => item.id !== id));
    } else {
      const docPath = `users/${user.uid}/incomes/${id}`;
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'incomes', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, docPath);
      }
    }
  }

  async function saveSettings(newSettings: UserSettings) {
    if (!user) {
      localStorage.setItem('fiji_wages_core_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } else {
      const docPath = `users/${user.uid}/settings/calculator`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'settings', 'calculator'), {
          salary: newSettings.salary,
          frequency: newSettings.frequency,
          residencyStatus: newSettings.residencyStatus,
          fnpfPercent: newSettings.fnpfPercent,
          isFnpfTaxExempt: newSettings.isFnpfTaxExempt,
          hoursPerWeek: newSettings.hoursPerWeek,
          daysPerWeek: newSettings.daysPerWeek,
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, docPath);
      }
    }
  }

  return (
    <FirebaseContext.Provider value={{
      user,
      loading,
      isLoggingIn,
      loginWithGoogle,
      logout,
      expenses,
      incomes,
      settings,
      addExpense,
      updateExpense,
      deleteExpense,
      addIncome,
      updateIncome,
      deleteIncome,
      saveSettings
    }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}
