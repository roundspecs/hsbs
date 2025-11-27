import { db } from "@/lib/firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { User } from "firebase/auth";

/**
 * Creates or updates a user document in Firestore.
 * This is typically called after a successful sign-in.
 */
export async function createOrUpdateUser(user: User) {
    await setDoc(
        doc(db, "users", user.uid),
        {
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            photoUrl: user.photoURL,
            lastLogin: serverTimestamp(),
            createdAt: serverTimestamp(), // Note: merge: true will preserve original createdAt if it exists? No, it will overwrite if we pass it.
            // Actually, with merge: true, if we pass createdAt, it updates it.
            // We might want to only set createdAt if it doesn't exist, but for now I'll stick to the original logic which was just passing it.
            // Wait, the original logic passed createdAt every time with merge: true.
            // If we want to preserve createdAt, we should probably check if it exists or use set with merge but be careful.
            // However, to strictly refactor, I should copy the logic exactly.
            // The original logic:
            // createdAt: serverTimestamp(),
            // { merge: true }
            // This updates createdAt on every login. That might not be intended for "createdAt", but "lastLogin" covers that.
            // I will keep it as is for now to avoid changing behavior, but I'll make a small improvement to not overwrite createdAt if possible?
            // No, sticking to exact behavior is safer for a refactor.
        },
        { merge: true }
    );
}
