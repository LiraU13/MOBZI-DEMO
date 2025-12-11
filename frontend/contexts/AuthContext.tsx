"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  usuario: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: any) => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // En modo invitado, siempre retornamos isAuthenticated = false (o true si quisiéramos simular login, pero mejor false para que se comporte como invitado)
  // Sin embargo, si la aplicación requiere estar logueado para ver el mapa, tendríamos que simular true.
  // En este caso, el mapa se ve en modo invitado, así que false está bien.
  
  const value = {
    isAuthenticated: false,
    usuario: null,
    loading: false,
    login: async () => { console.log("Login simulado - Modo invitado"); },
    logout: () => { console.log("Logout simulado"); },
    register: async () => { console.log("Register simulado"); },
    checkAuth: async () => { console.log("CheckAuth simulado"); },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
