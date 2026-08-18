import { useState } from "react";
import { LuMenu, LuX, LuCodeXml, LuLogOut, LuShoppingCart } from "react-icons/lu";
import { Link, NavLink, useNavigate } from "react-router";
import { useAppContext } from "../../context/AppContext";

const Menu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { usuarioLogueado, loadingSession, logoutBackend, carritoCount } = useAppContext();
  const navegacion = useNavigate();

  const isAdmin = usuarioLogueado?.rol === "admin";

  const navLinkStyles = ({ isActive }: { isActive: boolean }) =>
    `block py-2 px-3 transition-colors duration-200 md:p-0 ${
      isActive
        ? "text-blue-500 font-semibold"
        : "text-zinc-300 hover:text-blue-400"
    }`;

  const logout = async () => {
    await logoutBackend();
    navegacion("/");
  };

  return (
    <nav className="bg-zinc-950 border-b border-zinc-800 text-zinc-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="shrink-0 flex items-center gap-2 text-xl tracking-wider">
            <LuCodeXml className="text-blue-500 text-2xl" />
            <Link to={"/"} className="font-bold uppercase">
              Code Company{" "}
            </Link>
          </div>

          {/* Botón Hamburguesa (Móvil) */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 focus:outline-none transition-colors"
            >
              <span className="sr-only">Menu</span>
              {isMenuOpen ? (
                <LuX className="text-3xl" />
              ) : (
                <LuMenu className="text-3xl" />
              )}
            </button>
          </div>

          {/* Menú Desktop */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8 capitalize">
              <NavLink to="/" className={navLinkStyles}>
                Inicio
              </NavLink>
              <Link to="/carrito" className="relative text-zinc-300 hover:text-blue-400">
                <LuShoppingCart className="text-2xl" />
                {carritoCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full ring-1 ring-zinc-900" />
                )}
              </Link>
              {loadingSession ? (
                <span className="text-zinc-400 text-sm">Cargando...</span>
              ) : usuarioLogueado ? (
                <>
                  {isAdmin && (
                    <NavLink to="/administrador" className={navLinkStyles}>
                      Administrador
                    </NavLink>
                  )}

                  <button
                    onClick={() => void logout()}
                    className="flex items-center gap-2 bg-zinc-800 hover:bg-red-900/40 text-red-400 px-4 py-2 rounded-md text-sm font-medium transition-all border border-zinc-700 hover:border-red-500/50"
                  >
                    <LuLogOut />
                    Logout
                  </button>
                </>
              ) : (
                <NavLink to="/login" className={navLinkStyles}>
                  Login
                </NavLink>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Menú Mobile Desplegable */}
      <div
        className={`${
          isMenuOpen
            ? "max-h-96 opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        } md:hidden transition-all duration-300 ease-in-out bg-zinc-900 border-t border-zinc-800`}
      >
        <div className="px-4 pt-2 pb-6 space-y-2">
          <NavLink
            to="/"
            className={navLinkStyles}
            onClick={() => setIsMenuOpen(false)}
          >
            Inicio
          </NavLink>

          {loadingSession ? (
            <span className="px-3 py-2 text-sm text-zinc-400">Cargando...</span>
          ) :usuarioLogueado ? (
            <>
               {isAdmin && (
                <NavLink
                  to="/administrador"
                  className={navLinkStyles}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Administrador
                </NavLink>
              )}
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full text-left px-3 py-2 text-red-400 font-medium hover:bg-red-900/20 rounded-md transition-colors"
              >
                <LuLogOut />
                Logout
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              className={navLinkStyles}
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Menu;
