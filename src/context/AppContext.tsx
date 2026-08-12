import { createContext, useContext } from "react";
import type { Usuario } from "../interfaces/usuarios";

export interface AppContextType {
  usuarioLogueado: Usuario | null;
  loadingSession: boolean; //nuevo state
  setUsuarioLogueado: React.Dispatch<React.SetStateAction<Usuario | null>>;
  loginBackend: (email: string, pass: string) => Promise<Usuario | null>; //funcion de login
  logoutBackend: () => Promise<void>; //funcion de logout
  carritoCount: number;
  setCarritoCount: React.Dispatch<React.SetStateAction<number>>;
  refreshCarritoCount: () => Promise<void>;

}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext debe usarse dentro de un AppProvider");
  }
  return context;
}
