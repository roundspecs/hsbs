'use client';

import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from './firebaseConfig';

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    await setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoUrl: user.photoURL,
        lastLogin: serverTimestamp(),
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
    console.log('Logged in:', user.displayName, user.email);
    return user;
  } catch (err) {
    console.error('Google sign‑in error', err);
  }
};

export const logout = async () => {
  await signOut(auth);
};