import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/useAuthStore";

export const ForbiddenPage = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleBack = () => {
    // Volver a la ruta apropiada según el rol
    if (!user) { navigate("/login"); return; }
    if (user.roles.includes("ADMIN"))   { navigate("/dashboard"); return; }
    if (user.roles.includes("STOCK"))   { navigate("/products");  return; }
    if (user.roles.includes("PEDIDOS")) { navigate("/orders");    return; }
    navigate("/login");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-gutter"
      style={{ background: "radial-gradient(circle at 0% 0%, #fff0ed 0%, #fff8f6 55%, #fffbff 100%)" }}
    >
      <main className="w-full max-w-[480px] animate-in fade-in slide-in-from-bottom-4 duration-700 text-center">

        {/* Icon */}
        <div className="flex justify-center mb-lg">
          <div className="w-20 h-20 rounded-full bg-error-container flex items-center justify-center">
            <span className="material-symbols-outlined text-error" style={{ fontSize: 40 }}>
              lock
            </span>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-headline-lg font-bold text-on-surface mb-sm">
          Acceso Restringido
        </h1>
        <p className="text-body-lg text-on-surface-variant mb-lg">
          Tu rol{" "}
          <span className="font-semibold text-on-surface">
            {user?.roles.map((r) => r).join(", ") ?? "desconocido"}
          </span>{" "}
          no tiene permisos para acceder a esta sección.
        </p>

        {/* Card info */}
        <div className="bg-surface border border-outline-variant rounded-xl p-md shadow-sm mb-lg text-left">
          <div className="flex items-center gap-3 mb-sm">
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: 20 }}>
              info
            </span>
            <p className="text-body-sm font-semibold text-on-surface">¿Por qué veo esto?</p>
          </div>
          <p className="text-body-sm text-on-surface-variant">
            Este portal de gestión sólo permite acceso a rutas autorizadas para tu nivel de permisos.
            Si creés que esto es un error, contactá al administrador del sistema.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-gutter justify-center">
          <button
            onClick={handleBack}
            className="btn-primary"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
            Volver al inicio
          </button>
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="btn-secondary"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>logout</span>
            Cerrar sesión
          </button>
        </div>

        {/* Footer */}
        <p className="mt-xl text-label-caps text-on-surface-variant opacity-50">
          FoodStore Admin · Error 403
        </p>
      </main>
    </div>
  );
};
