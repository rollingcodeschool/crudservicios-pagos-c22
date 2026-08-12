import { useState } from "react";
import { Link } from "react-router";
import type { Servicio } from "../../interfaces/servicios";
import { useAppContext } from "../../context/AppContext";
import { agregarAlCarritoApi } from "../../helpers/queries";
import { LuShoppingCart } from "react-icons/lu";

interface CardServicioProps {
  servicio: Servicio;
}

const CardServicio = ({ servicio }: CardServicioProps) => {
  const { usuarioLogueado, refreshCarritoCount } = useAppContext();
  const [cantidad, setCantidad] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  const formatearPrecio = (valor: number) => {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(valor);
  };

  const categoria = typeof servicio.categoria === 'string' ? servicio.categoria : servicio.categoria?.nombre ?? 'Sin categoría';

  const handleAgregar = async () => {
    if (!usuarioLogueado) {
      try {
        window.dispatchEvent(new CustomEvent("toast", { detail: { message: "Debes iniciar sesión para agregar al carrito" } }));
      } catch (e) {
        // fallback
        // @ts-ignore
        window.dispatchEvent(new Event("toast"));
      }
      return;
    }
    if (!servicio._id) return;
    setLoading(true);
    try {
      const resp = await agregarAlCarritoApi(servicio._id, cantidad);
      if (resp.ok) {
        await refreshCarritoCount();
        try {
          window.dispatchEvent(new CustomEvent("toast", { detail: { message: "Servicio agregado al carrito con éxito" } }));
        } catch (e) {
          // fallback
          // @ts-ignore
          window.dispatchEvent(new Event("toast"));
        }
      } else {
        console.error("Error agregando al carrito", resp.status);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="group bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-blue-500/10 flex flex-col h-full">
      <div className="relative h-48 overflow-hidden">
        <img src={servicio.imagen} alt={servicio.nombreServicio} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute top-2 right-2">
          <span className="bg-zinc-950/80 backdrop-blur-sm text-blue-400 text-xs font-bold px-2 py-1 rounded border border-zinc-700 uppercase tracking-wider">
            {categoria}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col grow">
        <h3 className="text-xl font-bold text-zinc-100 mb-2 group-hover:text-blue-400 transition-colors">{servicio.nombreServicio}</h3>
        <p className="text-zinc-400 text-sm line-clamp-3 mb-4 grow">{servicio.descripcion}</p>

        <div className="pt-4 border-t border-zinc-800 mt-auto">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs text-zinc-500 uppercase font-semibold">Precio</p>
              <p className="text-lg font-mono text-zinc-200">{formatearPrecio(servicio.precio)}</p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={cantidad}
              onChange={(e) => setCantidad(Math.max(1, Number(e.target.value) || 1))}
              className="w-20 bg-zinc-800 text-zinc-100 px-3 py-2 rounded-lg text-sm border border-zinc-700"
            />

            <button
              onClick={() => void handleAgregar()}
              disabled={!usuarioLogueado || loading}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-colors shadow-md active:scale-95 ${
                usuarioLogueado ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-zinc-700 text-zinc-400 cursor-not-allowed"
              }`}
            >
              <LuShoppingCart className="text-lg" />
              <span>{loading ? "Enviando..." : usuarioLogueado ? "Agregar" : "Login"}</span>
            </button>
          </div>

          <div className="mt-3">
            <Link
              to={`servicio/${servicio._id}`}
              className="block text-center w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-md shadow-blue-900/20 active:scale-95"
            >
              Ver detalle
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default CardServicio;
