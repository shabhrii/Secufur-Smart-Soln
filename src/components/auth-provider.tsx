"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { type User } from "@/types/auth";
import { type Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { ROLES } from "@/constants/roles";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;
    let profileLoadId = 0;

    const loadProfile = async (session: Session) => {
      const loadId = ++profileLoadId;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (!isMounted || loadId !== profileLoadId) {
        return;
      }

      setUser({
        id: session.user.id,
        email: session.user.email!,
        role: profile?.role || ROLES.BUYER,
        createdAt: session.user.created_at,
        updatedAt: session.user.updated_at || session.user.created_at,
      });
      setIsLoading(false);
    };

    const applySession = (session: Session | null) => {
      profileLoadId++;
      setSession(session);

      if (!session) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      void loadProfile(session);
    };

    // Initial fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) {
        return;
      }

      applySession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => {
        if (!isMounted) {
          return;
        }

        applySession(session);
      }, 0);
    });

    return () => {
      isMounted = false;
      profileLoadId++;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
