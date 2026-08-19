import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import {
  agregarAlCarritoApi,
  crearPreferenciaPagoApi,
  eliminarServicioDelCarritoApi,
  obtenerCarritoApi,
  restarDelCarritoApi,
} from "../../helpers/queries";
import { Link, useNavigate } from "react-router";

const Carrito = () => {
  const { usuarioLogueado, refreshCarritoCount } = useAppContext();
  const [carrito, setCarrito] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);
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

  const actualizarCantidad = async (item: any, nuevaCantidad: number) => {
    const cantidadActual = Number(item.cantidad) || 0;
    const cantidadSolicitada = Math.max(1, Math.floor(nuevaCantidad));
    const diferencia = cantidadSolicitada - cantidadActual;
    const servicioId = String(item.servicio?._id || item.servicioId);

    if (!servicioId || diferencia === 0) return;

    setUpdatingItem(String(item._id));
    try {
      if (diferencia > 0) {
        const respuesta = await agregarAlCarritoApi(servicioId, diferencia);
        if (!respuesta.ok) throw new Error("No se pudo aumentar la cantidad");
      } else {
        for (let index = 0; index < Math.abs(diferencia); index += 1) {
          const respuesta = await restarDelCarritoApi(servicioId);
          if (!respuesta.ok) throw new Error("No se pudo disminuir la cantidad");
        }
      }
      await fetchCarrito();
      await refreshCarritoCount();
    } catch (error) {
      console.error("No se pudo actualizar la cantidad", error);
    } finally {
      setUpdatingItem(null);
    }
  };

  const eliminarItem = async (item: any) => {
    const servicioId = String(item.servicio?._id || item.servicioId);
    if (!servicioId) return;

    setUpdatingItem(String(item._id));
    try {
      const respuesta = await eliminarServicioDelCarritoApi(servicioId);
      if (!respuesta.ok) throw new Error("No se pudo eliminar el servicio");
      await fetchCarrito();
      await refreshCarritoCount();
    } catch (error) {
      console.error("No se pudo eliminar el servicio del carrito", error);
    } finally {
      setUpdatingItem(null);
    }
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
                    <div className="text-right">
                      <div className="text-sm text-zinc-400">
                        Unitario: {(it.servicio?.precio || 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                      </div>
                      <div className="font-semibold text-zinc-200">
                        Subtotal: {((Number(it.servicio?.precio) || 0) * (Number(it.cantidad) || 0)).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-400">
                    <label htmlFor={`cantidad-${it._id}`}>Cantidad</label>
                    <input
                      id={`cantidad-${it._id}`}
                      type="number"
                      min="1"
                      value={it.cantidad}
                      disabled={updatingItem === String(it._id)}
                      onChange={(event) => void actualizarCantidad(it, Number(event.target.value))}
                      className="w-20 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-center text-zinc-100"
                    />
                    <button
                      type="button"
                      onClick={() => void eliminarItem(it)}
                      disabled={updatingItem === String(it._id)}
                      className="text-rose-400 hover:text-rose-300 disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  </div>
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
