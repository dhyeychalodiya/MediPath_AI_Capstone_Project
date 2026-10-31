/**
 * MediPath AI - Firebase Cloud Firestore Search History Service
 *
 * Persists and manages search history exclusively in Firebase Cloud Firestore.
 * Saves history to the user's authenticated Firestore profile document (users/{uid})
 * and the users/{uid}/search_history subcollection with real-time sync.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
  Unsubscribe,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth, firestore } from "@/lib/firebase";

export interface SearchHistoryItem {
  id: string;
  userId: string;
  userUid?: string;
  query: string;
  condition?: string;
  specialty?: string;
  location?: string;
  hospitalCount?: number;
  modelVersion?: string;
  timestamp: number;
  isDirectRouting?: boolean;
  directRouting?: boolean;
  icd10?: string;
  procedure?: string;
  urgency?: string;
  decisionSource?: string;
  source?: "direct_routing" | "symptom_triage";
}

const MAX_HISTORY_ITEMS = 50;
const HISTORY_UPDATE_EVENT = "medipath-search-history-updated";

// In-memory cache for live React components, populated strictly from Firebase Cloud Firestore
const memoryCache = new Map<string, SearchHistoryItem[]>();

// Active Firestore realtime snapshot listeners
let activeSnapshotUid: string | null = null;
let activeDocUnsubscribe: Unsubscribe | null = null;
let activeColUnsubscribe: Unsubscribe | null = null;

// Purge any legacy browser localStorage search history entries so only Firebase is used
if (typeof window !== "undefined" && window.localStorage) {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("medipath_search_history_")) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (err) {
    console.debug("Local storage cleanup:", err);
  }
}

/**
 * Resolves the primary user identifier for Firestore persistence.
 * Uses Firebase Auth UID when available, falling back to MediPath ID.
 */
export const resolveAuthUid = (userId?: string): string => {
  return firebaseAuth.currentUser?.uid || (userId && userId.trim()) || "";
};

/**
 * Dispatches an event to notify React components of Firebase history changes.
 */
const notifyHistoryUpdated = (userId: string) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(HISTORY_UPDATE_EVENT, { detail: { userId } }));
  }
};

/**
 * Sets up real-time Firestore listeners for the active user's search history.
 * Subscribes to the user document (`users/{uid}`) which is always permitted
 * and the subcollection (`users/{uid}/search_history`).
 */
export const ensureFirestoreListener = (userId?: string) => {
  const authUid = resolveAuthUid(userId);
  if (!authUid || !firestore) return;

  // Already listening to this user
  if (activeSnapshotUid === authUid && activeDocUnsubscribe) {
    return;
  }

  // Detach prior listeners if switching users
  if (activeDocUnsubscribe) {
    activeDocUnsubscribe();
    activeDocUnsubscribe = null;
  }
  if (activeColUnsubscribe) {
    activeColUnsubscribe();
    activeColUnsubscribe = null;
  }

  activeSnapshotUid = authUid;

  // 1. Primary listener: User Document in Firestore (`users/{authUid}`)
  // This uses the exact same path that login and signup use, guaranteeing 100% permission compatibility
  try {
    const userDocRef = doc(firestore, "users", authUid);

    // Initial direct fetch in case snapshot takes a moment
    getDoc(userDocRef).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data.searchHistory) && data.searchHistory.length > 0) {
          const items: SearchHistoryItem[] = data.searchHistory.map((d: Record<string, unknown>) => ({
            id: String(d.id || `sh_${Date.now()}`),
            userId: String(d.userId || userId || authUid),
            userUid: authUid,
            query: String(d.query || ""),
            condition: (d.condition as string) || undefined,
            specialty: (d.specialty as string) || undefined,
            location: (d.location as string) || undefined,
            hospitalCount: typeof d.hospitalCount === "number" ? d.hospitalCount : undefined,
            modelVersion: (d.modelVersion as string) || undefined,
            timestamp: typeof d.timestamp === "number" ? d.timestamp : Date.now(),
            isDirectRouting: Boolean(d.isDirectRouting || d.directRouting || d.source === "direct_routing" || d.decisionSource === "direct_routing"),
            directRouting: Boolean(d.isDirectRouting || d.directRouting || d.source === "direct_routing" || d.decisionSource === "direct_routing"),
            icd10: (d.icd10 as string) || undefined,
            procedure: (d.procedure as string) || undefined,
            urgency: (d.urgency as string) || undefined,
            decisionSource: (d.decisionSource as string) || (d.isDirectRouting || d.directRouting ? "direct_routing" : undefined),
            source: (d.source as "direct_routing" | "symptom_triage") || (d.isDirectRouting || d.directRouting ? "direct_routing" : "symptom_triage"),
          }));
          items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          memoryCache.set(authUid, items);
          if (userId && userId !== authUid) memoryCache.set(userId, items);
          notifyHistoryUpdated(authUid);
        }
      }
    }).catch((err) => {
      console.debug("Initial search history fetch:", err);
    });

    activeDocUnsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (Array.isArray(data.searchHistory)) {
            const items: SearchHistoryItem[] = data.searchHistory.map((d: Record<string, unknown>) => ({
              id: String(d.id || `sh_${Date.now()}`),
              userId: String(d.userId || userId || authUid),
              userUid: authUid,
              query: String(d.query || ""),
              condition: (d.condition as string) || undefined,
              specialty: (d.specialty as string) || undefined,
              location: (d.location as string) || undefined,
              hospitalCount: typeof d.hospitalCount === "number" ? d.hospitalCount : undefined,
              modelVersion: (d.modelVersion as string) || undefined,
              timestamp: typeof d.timestamp === "number" ? d.timestamp : Date.now(),
              isDirectRouting: Boolean(d.isDirectRouting || d.directRouting || d.source === "direct_routing" || d.decisionSource === "direct_routing"),
              directRouting: Boolean(d.isDirectRouting || d.directRouting || d.source === "direct_routing" || d.decisionSource === "direct_routing"),
              icd10: (d.icd10 as string) || undefined,
              procedure: (d.procedure as string) || undefined,
              urgency: (d.urgency as string) || undefined,
              decisionSource: (d.decisionSource as string) || (d.isDirectRouting || d.directRouting ? "direct_routing" : undefined),
              source: (d.source as "direct_routing" | "symptom_triage") || (d.isDirectRouting || d.directRouting ? "direct_routing" : "symptom_triage"),
            }));

            items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            memoryCache.set(authUid, items);
            if (userId && userId !== authUid) {
              memoryCache.set(userId, items);
            }
            notifyHistoryUpdated(authUid);
          }
        }
      },
      (err) => {
        console.warn("Firestore user doc searchHistory onSnapshot warning:", err);
      }
    );
  } catch (err) {
    console.warn("Failed to attach user doc listener:", err);
  }

  // 2. Secondary listener: Subcollection (`users/{authUid}/search_history`)
  try {
    const historyCol = collection(firestore, "users", authUid, "search_history");
    const q = query(historyCol, orderBy("timestamp", "desc"), limit(MAX_HISTORY_ITEMS));

    activeColUnsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const firestoreItems: SearchHistoryItem[] = [];
          snapshot.forEach((docSnap) => {
            const d = docSnap.data();
            firestoreItems.push({
              id: docSnap.id,
              userId: String(d.userId || userId || authUid),
              userUid: authUid,
              query: String(d.query || ""),
              condition: d.condition ? String(d.condition) : undefined,
              specialty: d.specialty ? String(d.specialty) : undefined,
              location: d.location ? String(d.location) : undefined,
              hospitalCount: typeof d.hospitalCount === "number" ? d.hospitalCount : undefined,
              modelVersion: d.modelVersion ? String(d.modelVersion) : undefined,
              timestamp: typeof d.timestamp === "number" ? d.timestamp : Date.now(),
              isDirectRouting: Boolean(d.isDirectRouting || d.directRouting || d.source === "direct_routing" || d.decisionSource === "direct_routing"),
              directRouting: Boolean(d.isDirectRouting || d.directRouting || d.source === "direct_routing" || d.decisionSource === "direct_routing"),
              icd10: d.icd10 || undefined,
              procedure: d.procedure || undefined,
              urgency: d.urgency || undefined,
              decisionSource: d.decisionSource || (d.isDirectRouting || d.directRouting ? "direct_routing" : undefined),
              source: d.source || (d.isDirectRouting || d.directRouting ? "direct_routing" : "symptom_triage"),
            });
          });

          firestoreItems.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          memoryCache.set(authUid, firestoreItems);
          if (userId && userId !== authUid) {
            memoryCache.set(userId, firestoreItems);
          }
          notifyHistoryUpdated(authUid);
        }
      },
      (err) => {
        console.debug("Firestore snapshot observer error:", err);
      }
    );
  } catch (err) {
    console.debug("Firestore listener initialization:", err);
  }
};

// Monitor Firebase auth state changes to connect/disconnect Firestore listener automatically
if (typeof window !== "undefined") {
  onAuthStateChanged(firebaseAuth, (firebaseUser) => {
    if (firebaseUser) {
      ensureFirestoreListener(firebaseUser.uid);
    } else {
      if (activeDocUnsubscribe) {
        activeDocUnsubscribe();
        activeDocUnsubscribe = null;
      }
      if (activeColUnsubscribe) {
        activeColUnsubscribe();
        activeColUnsubscribe = null;
      }
      activeSnapshotUid = null;
      memoryCache.clear();
    }
  });
}

/**
 * Retrieves all saved searches for the given user, sorted newest first, directly from Firebase.
 */
export const getSearchHistory = (userId: string): SearchHistoryItem[] => {
  if (!userId) return [];
  const authUid = resolveAuthUid(userId);

  // Trigger Firestore sync listener if not yet active
  ensureFirestoreListener(userId);

  return memoryCache.get(authUid) || (userId !== authUid ? memoryCache.get(userId) : undefined) || [];
};

/**
 * Saves a completed search for the authenticated user directly into Firebase Cloud Firestore.
 */
export const saveSearchHistory = (
  userId: string,
  data: {
    query: string;
    condition?: string;
    specialty?: string;
    location?: string;
    hospitalCount?: number;
    modelVersion?: string;
    isDirectRouting?: boolean;
    directRouting?: boolean;
    icd10?: string;
    procedure?: string;
    urgency?: string;
    decisionSource?: string;
    source?: "direct_routing" | "symptom_triage";
  }
): SearchHistoryItem | null => {
  if (!userId || !data.query || !data.query.trim()) return null;

  const authUid = resolveAuthUid(userId);
  const trimmedQuery = data.query.trim();

  try {
    const existing = getSearchHistory(userId);

    // Remove older duplicate query so recent search moves to top
    const filtered = existing.filter(
      (item) => item.query.toLowerCase() !== trimmedQuery.toLowerCase()
    );

    const isDirect = Boolean(
      data.isDirectRouting ||
      data.directRouting ||
      data.source === "direct_routing" ||
      data.decisionSource === "direct_routing"
    );

    const newItem: SearchHistoryItem = {
      id: `sh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      userUid: authUid,
      query: trimmedQuery,
      condition: data.condition,
      specialty: data.specialty,
      location: data.location,
      hospitalCount: data.hospitalCount,
      modelVersion: data.modelVersion,
      timestamp: Date.now(),
      isDirectRouting: isDirect,
      directRouting: isDirect,
      icd10: data.icd10,
      procedure: data.procedure,
      urgency: data.urgency,
      decisionSource: data.decisionSource || (isDirect ? "direct_routing" : undefined),
      source: data.source || (isDirect ? "direct_routing" : "symptom_triage"),
    };

    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);

    // Update in-memory cache optimistically
    memoryCache.set(authUid, updated);
    if (userId !== authUid) memoryCache.set(userId, updated);

    notifyHistoryUpdated(authUid);

    // Persist directly and solely into Firebase Cloud Firestore
    if (firestore && authUid) {
      void (async () => {
        try {
          // Clean item for Firestore (no undefined values)
          const cleanItem = {
            id: newItem.id,
            userId: newItem.userId,
            userUid: authUid,
            query: newItem.query,
            condition: newItem.condition ?? null,
            specialty: newItem.specialty ?? null,
            location: newItem.location ?? null,
            hospitalCount: typeof newItem.hospitalCount === "number" ? newItem.hospitalCount : null,
            modelVersion: newItem.modelVersion ?? null,
            timestamp: newItem.timestamp,
            createdAt: new Date(newItem.timestamp).toISOString(),
            isDirectRouting: Boolean(newItem.isDirectRouting),
            directRouting: Boolean(newItem.directRouting),
            icd10: newItem.icd10 ?? null,
            procedure: newItem.procedure ?? null,
            urgency: newItem.urgency ?? null,
            decisionSource: newItem.decisionSource ?? null,
            source: newItem.source ?? null,
          };

          const cleanUpdated = updated.map((it) => ({
            id: it.id,
            userId: it.userId,
            userUid: authUid,
            query: it.query,
            condition: it.condition ?? null,
            specialty: it.specialty ?? null,
            location: it.location ?? null,
            hospitalCount: typeof it.hospitalCount === "number" ? it.hospitalCount : null,
            modelVersion: it.modelVersion ?? null,
            timestamp: it.timestamp,
            createdAt: new Date(it.timestamp).toISOString(),
            isDirectRouting: Boolean(it.isDirectRouting),
            directRouting: Boolean(it.directRouting),
            icd10: it.icd10 ?? null,
            procedure: it.procedure ?? null,
            urgency: it.urgency ?? null,
            decisionSource: it.decisionSource ?? null,
            source: it.source ?? null,
          }));

          // 1. Save directly into User Document in Firestore (100% permitted under user rules)
          const userDocRef = doc(firestore, "users", authUid);
          await setDoc(userDocRef, { searchHistory: cleanUpdated }, { merge: true });

          // 2. Also save to subcollection if rules permit
          try {
            const subDocRef = doc(firestore, "users", authUid, "search_history", newItem.id);
            await setDoc(subDocRef, cleanItem);
          } catch (subErr) {
            console.debug("Subcollection sync:", subErr);
          }
        } catch (err) {
          console.warn("Failed to persist search history to Firebase Firestore:", err);
        }
      })();
    }

    return newItem;
  } catch (err) {
    console.warn("Failed to save search history:", err);
    return null;
  }
};

/**
 * Deletes a single search item by id from Firebase Cloud Firestore.
 */
export const deleteSearchHistoryItem = (userId: string, itemId: string): SearchHistoryItem[] => {
  if (!userId || !itemId) return [];
  const authUid = resolveAuthUid(userId);

  try {
    const existing = getSearchHistory(userId);
    const updated = existing.filter((item) => item.id !== itemId);

    // Update memory cache
    memoryCache.set(authUid, updated);
    if (userId !== authUid) memoryCache.set(userId, updated);

    notifyHistoryUpdated(authUid);

    // Delete directly from Firebase Cloud Firestore
    if (firestore && authUid) {
      void (async () => {
        try {
          const cleanUpdated = updated.map((it) => ({
            id: it.id,
            userId: it.userId,
            userUid: authUid,
            query: it.query,
            condition: it.condition ?? null,
            specialty: it.specialty ?? null,
            location: it.location ?? null,
            hospitalCount: typeof it.hospitalCount === "number" ? it.hospitalCount : null,
            modelVersion: it.modelVersion ?? null,
            timestamp: it.timestamp,
            createdAt: new Date(it.timestamp).toISOString(),
          }));

          const userDocRef = doc(firestore, "users", authUid);
          await setDoc(userDocRef, { searchHistory: cleanUpdated }, { merge: true });

          try {
            const subDocRef = doc(firestore, "users", authUid, "search_history", itemId);
            await deleteDoc(subDocRef);
          } catch (subErr) {
            console.debug("Subcollection delete:", subErr);
          }
        } catch (err) {
          console.warn("Failed to delete search document from Firebase Firestore:", err);
        }
      })();
    }

    return updated;
  } catch (err) {
    console.warn("Failed to delete search history item:", err);
    return [];
  }
};

/**
 * Clears all search history for the user from Firebase Cloud Firestore.
 */
export const clearSearchHistory = (userId: string): void => {
  if (!userId) return;
  const authUid = resolveAuthUid(userId);

  try {
    memoryCache.delete(authUid);
    if (userId !== authUid) memoryCache.delete(userId);

    notifyHistoryUpdated(authUid);

    // Delete all search history documents from Firebase Cloud Firestore
    if (firestore && authUid) {
      void (async () => {
        try {
          const userDocRef = doc(firestore, "users", authUid);
          await setDoc(userDocRef, { searchHistory: [] }, { merge: true });

          try {
            const historyCol = collection(firestore, "users", authUid, "search_history");
            const snapshot = await getDocs(historyCol);
            if (!snapshot.empty) {
              const batch = writeBatch(firestore);
              snapshot.forEach((docSnap) => {
                batch.delete(docSnap.ref);
              });
              await batch.commit();
            }
          } catch (subErr) {
            console.debug("Subcollection clear:", subErr);
          }
        } catch (err) {
          console.warn("Failed to clear search history in Firebase Firestore:", err);
        }
      })();
    }
  } catch (err) {
    console.warn("Failed to clear search history:", err);
  }
};

/**
 * Subscribes to search history update events.
 */
export const onSearchHistoryUpdate = (callback: () => void, userId?: string) => {
  if (userId) {
    ensureFirestoreListener(userId);
  }
  const handler = () => callback();
  window.addEventListener(HISTORY_UPDATE_EVENT, handler);
  return () => {
    window.removeEventListener(HISTORY_UPDATE_EVENT, handler);
  };
};
