import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { firebaseAuth, firestore } from "@/lib/firebase";
import { clearSearchHistory, ensureFirestoreListener } from "@/services/searchHistoryService";

export type MediUser = {
  id: string;            // MediPath AI ID, e.g. MP-2026-8F3KQ
  uid?: string;          // Firebase Auth UID
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
};

type AuthContextValue = {
  user: MediUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<MediUser>;
  signup: (data: { name: string; email: string; phone?: string; password: string }) => Promise<MediUser>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const generateMediPathId = () => {
  const year = new Date().getFullYear();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 5; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
  return `MP-${year}-${suffix}`;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<MediUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      const profile = await getDoc(doc(firestore, "users", firebaseUser.uid));
      ensureFirestoreListener(firebaseUser.uid);
      const data = profile.exists() ? profile.data() : {};
      setUser({
        id: String(data.id || `MP-${firebaseUser.uid.slice(0, 8).toUpperCase()}`),
        uid: firebaseUser.uid,
        name: String(data.name || firebaseUser.displayName || "MediPath User"),
        email: firebaseUser.email || "",
        phone: data.phone ? String(data.phone) : undefined,
        createdAt: String(data.createdAt || firebaseUser.metadata.creationTime || new Date().toISOString()),
      });
      setLoading(false);
    });
  }, []);

  const signup: AuthContextValue["signup"] = async ({ name, email, phone, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const credential = await createUserWithEmailAndPassword(firebaseAuth, normalizedEmail, password);
    const newUser: MediUser = {
      id: generateMediPathId(),
      uid: credential.user.uid,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone?.trim(),
      createdAt: new Date().toISOString(),
    };
    await updateProfile(credential.user, { displayName: newUser.name });
    await setDoc(doc(firestore, "users", credential.user.uid), newUser);
    setUser(newUser);
    return newUser;
  };

  const login: AuthContextValue["login"] = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const credential = await signInWithEmailAndPassword(firebaseAuth, normalizedEmail, password);
    const profile = await getDoc(doc(firestore, "users", credential.user.uid));
    const data = profile.exists() ? profile.data() : {};
    const signedInUser: MediUser = {
      id: String(data.id || `MP-${credential.user.uid.slice(0, 8).toUpperCase()}`),
      uid: credential.user.uid,
      name: String(data.name || credential.user.displayName || "MediPath User"),
      email: credential.user.email || normalizedEmail,
      phone: data.phone ? String(data.phone) : undefined,
      createdAt: String(data.createdAt || credential.user.metadata.creationTime || new Date().toISOString()),
    };
    setUser(signedInUser);
    return signedInUser;
  };

  const logout = async () => {
    await signOut(firebaseAuth);
    setUser(null);
  };

  const deleteAccount = async () => {
    const currentUser = firebaseAuth.currentUser;
    if (!currentUser) return;
    clearSearchHistory(currentUser.uid);
    await deleteDoc(doc(firestore, "users", currentUser.uid));
    await deleteUser(currentUser);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};