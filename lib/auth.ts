'use client';

import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from './firebaseConfig';

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log('Logged in:', user.displayName, user.email);
    return user;
  } catch (err) {
    console.error('Google sign‑in error', err);
  }
};

export const logout = async () => {
  await signOut(auth);
};