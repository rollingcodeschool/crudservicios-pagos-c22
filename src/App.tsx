import Error404 from "./components/pages/Error404";
import Inicio from "./components/pages/Inicio";
import Administrador from "./components/pages/Administrador";
import FormularioServicio from "./components/pages/FormularioServicio";
import Login from "./components/pages/Login";
import Footer from "./components/shared/Footer";
import Menu from "./components/shared/Menu";
import { BrowserRouter, Routes, Route } from "react-router";
import ProtectorRutas from "./components/routes/ProtectorRutas";
import { useEffect, useState } from "react";
import { AppContext } from "./context/AppContext";
//import type { Servicio } from "./interfaces/servicios";
import DetalleServicio from "./components/pages/DetalleServicio";
import type { Usuario } from "./interfaces/usuarios";
import { loginBackendApi, logoutBackendApi, obtenerPerfilApi, obtenerCantidadCarritoApi } from "./helpers/queries";

function App() {

  const [usuarioLogueado, setUsuarioLogueado] = useState<Usuario | null>(null);
  const [loadingSession, setLoadingSession] = useState<boolean>(true);
  const [carritoCount, setCarritoCount] = useState<number>(0);

  const checkAuth = async () => {
    try {
      const perfil = await obtenerPerfilApi();
      setUsuarioLogueado(perfil);
    } catch {
      setUsuarioLogueado(null);
    } finally {
      setLoadingSession(false);
    }
  };

  const loginBackend = async (email: string, pass: string): Promise<Usuario | null> => {
    setLoadingSession(true);
    try {
      const loginRes = await loginBackendApi(email, pass);
      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        throw new Error(loginData?.mensaje || "No se pudo iniciar sesión");
      }
      // Consultamos los datos actualizados del perfil
      const perfil = await obtenerPerfilApi();
      console.log(perfil)
      setUsuarioLogueado(perfil);
      // actualizar contador de carrito al loguearse
      void refreshCarritoCount();
      return perfil;
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setUsuarioLogueado(null);
      throw error;
    } finally {
      setLoadingSession(false);
    }
  };

  const logoutBackend = async () => {
    try {
      await logoutBackendApi();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setUsuarioLogueado(null);
      setCarritoCount(0);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Solo refrescar el conteo cuando cambie el estado de la sesión
  useEffect(() => {
    if (usuarioLogueado) {
      void refreshCarritoCount();
    } else {
      setCarritoCount(0);
    }
  }, [usuarioLogueado]);

  const refreshCarritoCount = async () => {
    try {
      const cnt = await obtenerCantidadCarritoApi();
      setCarritoCount(cnt);
    } catch (error) {
      console.error('No se pudo actualizar el conteo del carrito', error);
    }
  };

  // Toast global simple
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const onToast = (e: Event) => {
      // @ts-ignore
      const msg = e?.detail?.message || e?.detail || null;
      if (msg) {
        setToastMessage(String(msg));
        setTimeout(() => setToastMessage(null), 3000);
      }
    };
    window.addEventListener("toast", onToast as EventListener);
    return () => window.removeEventListener("toast", onToast as EventListener);
  }, []);

  return (
    <AppContext.Provider
      value={{
        usuarioLogueado,
        setUsuarioLogueado,
        loadingSession,
        loginBackend,
        logoutBackend,
        carritoCount,
        setCarritoCount,
        refreshCarritoCount,
      }}
    >
      <BrowserRouter>
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
          <Menu />
          {toastMessage && (
            <div className="fixed right-4 bottom-6 z-50">
              <div className="bg-emerald-600 text-white px-4 py-2 rounded shadow-lg">
                {toastMessage}
              </div>
            </div>
          )}
          <main className="container grow mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Inicio></Inicio>} />
              <Route path="/login" element={<Login></Login>} />
              <Route path="/servicio/:id" element={<DetalleServicio />} />
              <Route path="/administrador" element={<ProtectorRutas />}>
                <Route index element={<Administrador />} />
                <Route
                  path="crear"
                  element={
                    <FormularioServicio
                      titulo={"Crear Servicio"}
                    ></FormularioServicio>
                  }
                />
                <Route
                  path="editar/:id"
                  element={
                    <FormularioServicio
                      titulo={"Editar Servicio"}
                    ></FormularioServicio>
                  }
                />
              </Route>
              <Route path="*" element={<Error404></Error404>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AppContext.Provider>
  );
}

export default App;
