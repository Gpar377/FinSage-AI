import { getLoginUrl } from "@/const";
import { useCallback, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } = options ?? {};

  const logout = useCallback(async () => {
    window.location.href = "/";
  }, []);

  const state = useMemo(() => {
    const mockUser = {
      id: "demo-user-id",
      name: "Demo User",
      email: "demo@finsage.ai",
      avatar: ""
    };
    
    return {
      user: mockUser,
      loading: false,
      error: null,
      isAuthenticated: true,
    };
  }, []);

  return {
    ...state,
    refresh: () => {},
    logout,
  };
}
