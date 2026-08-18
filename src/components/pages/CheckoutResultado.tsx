import { useLocation } from "react-router";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const CheckoutResultado = () => {
  const query = useQuery();
  const status = query.get('status') || 'unknown';

  return (
    <div className="max-w-3xl mx-auto text-center">
      {status === 'success' ? (
        <div className="bg-emerald-700 text-white p-6 rounded">
          <h2 className="text-2xl font-bold mb-2">Pago realizado con éxito</h2>
          <p>Gracias por tu compra. Pronto recibirás la confirmación.</p>
        </div>
      ) : (
        <div className="bg-rose-700 text-white p-6 rounded">
          <h2 className="text-2xl font-bold mb-2">Pago no completado</h2>
          <p>Hubo un problema con el pago o fue cancelado.</p>
        </div>
      )}
    </div>
  );
};

export default CheckoutResultado;
