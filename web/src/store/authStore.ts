import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { handleFirebaseError } from '../lib/firebaseErrors';

interface AuthStore {
  user: FirebaseUser | null;
  loading: boolean;
  initialized: boolean;
  signOut: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  initialized: false,

  initialize: () => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set({ user, loading: false, initialized: true });
    });

    // Return cleanup function
    return unsubscribe;
  },

  signOut: async () => {
    try {
      await firebaseSignOut(auth);
      set({ user: null });
    } catch (error) {
      const friendlyMessage = handleFirebaseError(error, 'sign out');
      throw new Error(friendlyMessage);
    }
  },
}));
