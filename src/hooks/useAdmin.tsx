import { useAuth } from "@/hooks/useAuth";

export const useAdmin = () => {
  const { profile, loading } = useAuth();
  const isAdmin = profile?.role === "admin";
  return { isAdmin, loading };
};
