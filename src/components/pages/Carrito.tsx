import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { obtenerCarritoApi, crearPreferenciaPagoApi } from "../../helpers/queries";
import { Link, useNavigate } from "react-router";

const Carrito = () => {
  const { usuarioLogueado, refreshCarritoCount } = useAppContext();
  const [carrito, setCarrito] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navegacion = useNavigate();

  const fetchCarrito = async () => {
    try {
      const data = await obtenerCarritoApi();
      setCarrito(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (usuarioLogueado) {
      void fetchCarrito();
    } else {
      setCarrito(null);
    }
  }, [usuarioLogueado]);

  const calcularTotal = () => {
    if (!carrito || !Array.isArray(carrito.items)) return 0;
    return carrito.items.reduce((acc: number, it: any) => acc + (Number(it.servicio?.precio || 0) * Number(it.cantidad || 0)), 0);
  };

  const handleComprar = async () => {
    if (!usuarioLogueado) return navegacion('/login');
    setLoading(true);
    try {
      const resp = await crearPreferenciaPagoApi();
      if (!resp.ok) throw new Error('Error creando preferencia');
      const data = await resp.json();
      const redirectUrl = data.init_point || data.sandbox_init_point;
      if (redirectUrl) {
        // backend redirige a MercadoPago, nosotros cambiamos la location
        window.location.href = redirectUrl;
      } else {
        console.error('Respuesta inválida de preferencia', data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!usuarioLogueado) {
    return (
      <div className="max-w-3xl mx-auto">
        <p className="text-center text-zinc-300">Debes iniciar sesión para ver tu carrito. <Link to="/login" className="text-blue-400">Login</Link></p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Tu carrito</h2>

      {!carrito ? (
        <p className="text-zinc-400">Cargando carrito...</p>
      ) : carrito.items.length === 0 ? (
        <p className="text-zinc-400">Tu carrito está vacío.</p>
      ) : (
        <div className="bg-zinc-900 p-4 rounded-lg">
          <ul className="space-y-4">
            {carrito.items.map((it: any) => (
              <li key={it._id} className="flex items-center gap-4">
                <img src={it.servicio?.imagen} alt={it.servicio?.nombreServicio} className="w-20 h-20 object-cover rounded" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{it.servicio?.nombreServicio}</h3>
                    <div className="text-zinc-300">{(it.servicio?.precio || 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</div>
                  </div>
                  <div className="text-sm text-zinc-400">Cantidad: {it.cantidad}</div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-lg font-bold">Total: {calcularTotal().toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</div>
            <div>
              <button onClick={() => void handleComprar()} disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded font-semibold">
                {loading ? 'Redirigiendo...' : 'Comprar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Carrito;
