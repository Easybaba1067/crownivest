import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import type { PropertyData } from "@/components/PropertyCard";

export const useProperties = () => {
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "properties"),
      orderBy("created_at", "desc"),
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const props: PropertyData[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as PropertyData[];
        setProperties(props);
        setLoading(false);
      },
      () => setLoading(false),
    );

    return () => unsubscribe();
  }, []);

  return { properties, loading };
};
