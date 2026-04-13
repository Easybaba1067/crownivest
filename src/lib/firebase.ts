import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCgNZM_6C2ggb0iaKv-Kn8L5xlDb3PP0WA",
  authDomain: "crowninvest-762bc.firebaseapp.com",
  projectId: "crowninvest-762bc",
  storageBucket: "crowninvest-762bc.firebasestorage.app",
  messagingSenderId: "712390869766",
  appId: "1:712390869766:web:3ffbececb5e29458fe9487"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
