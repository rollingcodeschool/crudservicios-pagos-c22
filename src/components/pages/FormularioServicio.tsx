import { useForm, type SubmitHandler } from "react-hook-form";
import type { Categoria, ServicioFormData } from "../../interfaces/servicios";
// import { useAppContext } from "../../context/AppContext";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import {
  buscarServicioApi,
  crearServicioApi,
  editarServicioApi,
  listarCategoriasApi,
} from "../../helpers/queries";

interface FormularioServicioProps {
  titulo: string;
}

const FormularioServicio = ({ titulo }: FormularioServicioProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    resetField, //agregar el reset del input tipo field
  } = useForm<ServicioFormData>();
  // traigo los datos que necesito del contexto
  // const { crearServicio, buscarServicio, editarServicio } = useAppContext();
  // traer el id de la ruta
  const { id } = useParams<{ id: string }>();
  const navegacion = useNavigate();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  // agrego estos dos states
  const [imagenActual, setImagenActual] = useState("");
  const [preview, setPreview] = useState("");

  useEffect(() => {
    cargarCategorias(); //nuevo cargo las categorias
    cargarDatos();
  }, []);

  const cargarCategorias = async () => {
    try {
      const respuestaCategorias = await listarCategoriasApi();
      if (respuestaCategorias.ok) {
        const listaCategorias = await respuestaCategorias.json();
        setCategorias(listaCategorias);
      }
    } catch (error) {
      console.error("Error cargando categorías:", error);
    }
  };

  const cargarDatos = async () => {
    if (titulo.includes("Editar") && id && buscarServicioApi) {
      const respuestaServicio = await buscarServicioApi(id);
      if (respuestaServicio && respuestaServicio.status === 200) {
        const servicioBuscado = await respuestaServicio.json();
        setValue("nombreServicio", servicioBuscado.nombreServicio);
        setValue("precio", servicioBuscado.precio);
        const categoriaId =
          servicioBuscado.categoria?._id ?? servicioBuscado.categoria; //cargo el id de la categoria en el select del formulario
        setValue("categoria", categoriaId);
        setValue("descripcion", servicioBuscado.descripcion);
        // setValue("imagen", servicioBuscado.imagen);
        setImagenActual(servicioBuscado.imagen);
      }
    }
  };

  const onSubmit: SubmitHandler<ServicioFormData> = async (data, e) => {
    console.log(data);
    if (titulo.includes("Crear") && crearServicioApi) {
      await crearServicioApi(data);

      Swal.fire({
        title: "Servicio creado",
        text: `El servicio '${data.nombreServicio}' fue creado correctamente`,
        icon: "success",
        background: "#18181b",
        color: "#f4f4f5",
        confirmButtonColor: "#3b82f6",
      });
      if (e) {
        (e.target as HTMLFormElement).reset();
        resetField("imagen");
        setPreview("");
        setImagenActual("");
      }
    } else if (id) {
      const respuesta = await editarServicioApi(id, data);
      console.log(respuesta);
      if (respuesta.ok) {
        Swal.fire({
          title: "Servicio editado",
          text: `El servicio '${data.nombreServicio}' fue editado correctamente`,
          icon: "success",
          background: "#18181b",
          color: "#f4f4f5",
          confirmButtonColor: "#3b82f6",
        });
        navegacion("/administrador");
      } else {
        Swal.fire({
          title: "Ocurrio un error",
          text: `El servicio '${data.nombreServicio}' no pudo ser editado.`,
          icon: "error",
          background: "#18181b",
          color: "#f4f4f5",
          confirmButtonColor: "#3b82f6",
        });
      }
    }
  };

  // Clase utilitaria para inputs
  const inputClass = (hasError: boolean) => `
    w-full px-4 py-2.5 bg-zinc-950 border rounded-lg text-zinc-100 
    focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all
    ${hasError ? "border-red-500" : "border-zinc-700"}
  `;

  return (
    <section className="max-w-4xl mx-auto animate-fadeIn">
      <div className="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-8 border-b border-zinc-800 pb-4">
          {titulo}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre del Servicio */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Nombre del Servicio*
              </label>
              <input
                type="text"
                placeholder="Ej: Diseño de sitio web institucional"
                className={inputClass(!!errors.nombreServicio)}
                {...register("nombreServicio", {
                  required: "El nombre es obligatorio",
                  minLength: { value: 5, message: "Mínimo 5 caracteres" },
                  maxLength: { value: 100, message: "Máximo 100 caracteres" },
                })}
              />
              <p className="text-red-500 text-xs mt-1 italic">
                {errors.nombreServicio?.message}
              </p>
            </div>

            {/* Precio */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Precio*
              </label>
              <input
                type="number"
                placeholder="Ej: 50000"
                className={inputClass(!!errors.precio)}
                {...register("precio", {
                  required: "El precio es obligatorio",
                  min: { value: 50, message: "Mínimo $50" },
                  valueAsNumber: true,
                })}
              />
              <p className="text-red-500 text-xs mt-1 italic">
                {errors.precio?.message}
              </p>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Categoría*
              </label>
              <select
                className={inputClass(!!errors.categoria)}
                {...register("categoria", {
                  required: "Seleccione una categoría",
                })}
              >
                <option value="" className="bg-zinc-900">
                  Seleccione una opción
                </option>
                {categorias.map((categoria) => (
                  <option
                    key={categoria._id}
                    value={categoria._id}
                    className="bg-zinc-900"
                  >
                    {categoria.nombre}
                  </option>
                ))}
              </select>
              <p className="text-red-500 text-xs mt-1 italic">
                {errors.categoria?.message}
              </p>
            </div>

            {/* URL Imagen */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                URL de Imagen*
              </label>
              <input
                type="file"
                accept="image/*"
                placeholder="https://ejemplo.com/imagen.jpg"
                className={inputClass(!!errors.imagen)}
                {...register("imagen", {
                  required: "La URL es obligatoria",
                  validate: {
                    fileSize: (files) =>
                      !files[0] ||
                      files[0].size <= 2 * 1024 * 1024 ||
                      "La imagen no debe superar los 2MB.",
                  },
                })}
                onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setPreview(URL.createObjectURL(file)); //crea una URL temporal en el navegador
              } else {
                setPreview("");
              }
            }}
              />
              {(preview || imagenActual) && (
            <div className="mb-2 position-relative d-inline-block mt-3">
              <img
                className="rounded-3 img-preview"
                src={preview || imagenActual}
                alt="Imagen"
              />
              <button
                onClick={() => {
                  setPreview('');
                  setImagenActual('');
                  resetField('imagen');
                }}
              >
                <i className="bi bi-x fs-5 text-danger"></i>
              </button>
            </div>
          )}
              <p className="text-red-500 text-xs mt-1 italic">
                {errors.imagen?.message}
              </p>
            </div>

            {/* Descripción */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Descripción*
              </label>
              <textarea
                rows={4}
                placeholder="Describa el servicio detalladamente..."
                className={inputClass(!!errors.descripcion)}
                {...register("descripcion", {
                  required: "La descripción es obligatoria",
                  minLength: { value: 10, message: "Mínimo 10 caracteres" },
                  maxLength: { value: 500, message: "Máximo 500 caracteres" },
                })}
              />
              <p className="text-red-500 text-xs mt-1 italic">
                {errors.descripcion?.message}
              </p>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all active:scale-95 shadow-lg shadow-blue-900/20"
            >
              Guardar Servicio
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default FormularioServicio;
