import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

const ADMIN_EMAIL = "crownivext@gmail.com";
const ADMIN_PASSWORD = "08166924489";
const ADMIN_NAME = "Prosperity Adams";

export const ensureAdminExists = async () => {
  try {
    // Try to sign in first to check if admin already exists
    await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    const user = auth.currentUser;
    if (user) {
      const profileDoc = await getDoc(doc(db, "users", user.uid));
      if (!profileDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          full_name: ADMIN_NAME,
          email: ADMIN_EMAIL,
          role: "admin",
          kyc_status: "verified",
          created_at: serverTimestamp(),
        });
      } else if (profileDoc.data().role !== "admin") {
        await setDoc(doc(db, "users", user.uid), { role: "admin" }, { merge: true });
      }
      // Create wallet if not exists
      const walletDoc = await getDoc(doc(db, "wallets", user.uid));
      if (!walletDoc.exists()) {
        await setDoc(doc(db, "wallets", user.uid), {
          user_id: user.uid,
          balance: 0,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        });
      }
      // Sign out so we don't stay logged in as admin
      await auth.signOut();
    }
    return;
  } catch (error: any) {
    if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found") {
      // Admin doesn't exist, create it
      try {
        const cred = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
        await updateProfile(cred.user, { displayName: ADMIN_NAME });
        await setDoc(doc(db, "users", cred.user.uid), {
          full_name: ADMIN_NAME,
          email: ADMIN_EMAIL,
          role: "admin",
          kyc_status: "verified",
          created_at: serverTimestamp(),
        });
        await setDoc(doc(db, "wallets", cred.user.uid), {
          user_id: cred.user.uid,
          balance: 0,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        });
        await auth.signOut();
        console.log("Admin account created successfully");
      } catch (createError: any) {
        console.error("Failed to create admin:", createError.message);
      }
    }
  }
};
