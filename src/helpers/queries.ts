// 1. Definimos la interfaz de cómo luce un Servicio en tu app
// Modifica los campos según lo que realmente use tu base de datos
import type { Servicio, ServicioFormData } from "../interfaces/servicios";
import type { Usuario } from "../interfaces/usuarios";

const urlServicios = import.meta.env.VITE_SERVICIO + "/servicios";
const urlCategorias = import.meta.env.VITE_SERVICIO + "/categorias";
const urlUsuarios = import.meta.env.VITE_SERVICIO + "/usuarios";

// 2. Tipamos las funciones.
// Nota: 'fetch' por defecto retorna una Promesa con un objeto 'Response'
// 🆕 agregue el filtro de busqueda y paginación

export interface ListarServiciosParams {
  // support both legacy frontend names and backend names
  paginaNumero?: number;
  cantServicios?: number;
  pagina?: number;
  limite?: number;
  termino?: string;
}

export const listarServiciosApi = async (
  params: ListarServiciosParams = {},
): Promise<Response> => {
  try {
    const query = new URLSearchParams();
    // Backend espera `pagina` y `limite`. el termino es optativo
    const pagina = params.pagina ?? params.paginaNumero ?? 1;
    const limite = params.limite ?? params.cantServicios ?? 8;
    query.set("pagina", String(pagina));
    query.set("limite", String(limite));
    if (params.termino) {
      query.set("termino", params.termino);
    }

    const respuesta = await fetch(`${urlServicios}?${query.toString()}`);
    return respuesta;
  } catch (error) {
    console.error(error);
    throw error; // Es mejor lanzar el error para que el componente que llama a la API sepa que falló
  }
};

// 🆕 se agregaró obtener las categorias
export const listarCategoriasApi = async (): Promise<Response> => {
  try {
    const respuesta = await fetch(urlCategorias);
    return respuesta;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const crearServicioApi = async (
  servicio: ServicioFormData,
): Promise<Response> => {
  try {
    const respuesta = await fetch(urlServicios, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(servicio),
    });
    return respuesta;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const borrarServicioApi = async (
  id: string | number,
): Promise<Response> => {
  try {
    const respuesta = await fetch(`${urlServicios}/${id}`, {
      method: "DELETE",
    });
    return respuesta;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const buscarServicioApi = async (
  id: string | number,
): Promise<Response> => {
  try {
    const respuesta = await fetch(`${urlServicios}/${id}`);
    return respuesta;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// En el PUT, usamos Partial<Servicio> si solo envías los campos modificados,
// o directamente 'Servicio' si mandas el objeto completo.
export const editarServicioApi = async (
  id: string | number,
  servicio: Partial<Servicio>,
): Promise<Response> => {
  try {
    const respuesta = await fetch(`${urlServicios}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(servicio),
    });
    return respuesta;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

//🆕 consultas para login de usuario
export const loginBackendApi = async (
  email: string,
  password: string,
): Promise<Response> => {
  return fetch(`${urlUsuarios}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
};

export const logoutBackendApi = async (): Promise<Response> => {
  return fetch(`${urlUsuarios}/logout`, {
    method: "POST",
    credentials: "include",
  });
};

export const obtenerPerfilApi = async (): Promise<Usuario> => {
  const respuesta = await fetch(`${urlUsuarios}/perfil`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!respuesta.ok) {
    throw new Error("No se pudo obtener el perfil del usuario");
  }

  return respuesta.json();
};
//🆕 consultas para carrito
export const agregarAlCarritoApi = async (servicioId: string, cantidad = 1): Promise<Response> => {
  try {
    const respuesta = await fetch('http://localhost:3000/api/carrito', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ servicioId, cantidad }),
    });
    return respuesta;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const restarDelCarritoApi = async (servicioId: string): Promise<Response> => {
  const respuesta = await fetch(`http://localhost:3000/api/carrito/restar/${servicioId}`, {
    method: 'PATCH',
    credentials: 'include',
  });
  return respuesta;
};

export const eliminarServicioDelCarritoApi = async (servicioId: string): Promise<Response> => {
  const respuesta = await fetch(`http://localhost:3000/api/carrito/servicio/${servicioId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return respuesta;
};

export const obtenerCantidadCarritoApi = async (): Promise<number> => {
  try {
    const respuesta = await fetch('http://localhost:3000/api/carrito', {
      method: 'GET',
      credentials: 'include',
    });
    if (respuesta.status === 401 || respuesta.status === 403) {
      // usuario no autenticado: no hay carrito accesible
      return 0;
    }
    if (!respuesta.ok) {
      throw new Error('No se pudo obtener el carrito');
    }
    const data = await respuesta.json();
    if (!data || !Array.isArray(data.items)) return 0;
    return data.items.reduce((acc: number, it: any) => acc + (Number(it.cantidad) || 0), 0);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
//🆕 fin consultas carrito
//🆕 obtener carrito completo
export const obtenerCarritoApi = async (): Promise<any> => {
  try {
    const respuesta = await fetch('http://localhost:3000/api/carrito', {
      method: 'GET',
      credentials: 'include',
    });
    if (respuesta.status === 401 || respuesta.status === 403) {
      return null;
    }
    if (!respuesta.ok) {
      throw new Error('No se pudo obtener el carrito');
    }
    return respuesta.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

//🆕 crear preferencia de pago (MercadoPago) - backend crea la preferencia y devuelve init_point
export const crearPreferenciaPagoApi = async (): Promise<Response> => {
  try {
    const respuesta = await fetch('http://localhost:3000/api/pago/crear-preferencia', {
      method: 'POST',
      credentials: 'include',
    });
    return respuesta;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
//🆕 fin pagos
//🆕 Fin consultas para login de usuario
