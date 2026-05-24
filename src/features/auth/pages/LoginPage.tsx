import { useState, type SyntheticEvent } from "react";
import { useAuthStore } from "../../../store/useAuthStore";
import { useNavigate } from "react-router-dom";

const STAFF_ROLES = ["ADMIN", "STOCK", "PEDIDOS"] as const;

export const LoginPage = () => {
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);
  const { login, logout, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPortalError(null);
    const success = await login(email, password);
    if (!success) return;

    const { user } = useAuthStore.getState();
    if (!user) return;

    // Verificar que tenga al menos un rol de staff
    const isStaff = user.roles.some((r) => STAFF_ROLES.includes(r as typeof STAFF_ROLES[number]));
    if (!isStaff) {
      // Cuenta de cliente — no tiene acceso a este portal
      logout();
      setPortalError(
        "Este portal es exclusivo para el personal de FoodStore. " +
        "Los clientes deben acceder desde la app de clientes."
      );
      return;
    }

    // Redirigir según rol
    if (user.roles.includes("ADMIN")) {
      navigate("/dashboard");
    } else if (user.roles.includes("STOCK")) {
      navigate("/products");
    } else if (user.roles.includes("PEDIDOS")) {
      navigate("/orders");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-gutter"
      style={{ background: "radial-gradient(circle at 0% 0%, #fff0ed 0%, #fff8f6 55%, #fffbff 100%)" }}
    >
      <main className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Brand */}
        <div className="text-center mb-xl">
          <div className="flex items-center justify-center mb-3">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-button">
              <span className="material-symbols-outlined text-on-primary" style={{ fontSize: 32 }}>restaurant</span>
            </div>
          </div>
          <h1 className="text-headline-lg font-bold text-primary tracking-tight">FoodStore</h1>
          <p className="text-body-lg text-on-surface-variant mt-1">Portal de Gestión</p>
        </div>

        {/* Card */}
        <div className="bg-surface-container-lowest rounded-xl shadow-card border border-outline-variant/40 p-lg">
          <div className="mb-md">
            <h2 className="text-title-md font-semibold text-on-surface">¡Bienvenido de nuevo!</h2>
            <p className="text-body-sm text-on-surface-variant mt-1">Por favor, introduce tus credenciales de administración.</p>
          </div>

          {(error || portalError) && (
            <div className="mb-md px-4 py-3 bg-error-container rounded-lg border border-error/20 flex items-start gap-2">
              <span className="material-symbols-outlined text-error flex-shrink-0" style={{ fontSize: 18 }}>
                {portalError ? "block" : "error"}
              </span>
              <p className="text-body-sm text-on-error-container font-semibold">
                {portalError ?? error}
              </p>
            </div>
          )}

          <form className="space-y-md" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="space-y-xs">
              <label className="text-label-caps text-on-surface-variant" htmlFor="email">Correo Electrónico</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant/60 group-focus-within:text-primary transition-colors" style={{ fontSize: 20 }}>mail</span>
                </div>
                <input
                  id="email" type="email" required
                  placeholder="admin@foodstore.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-xs">
              <label className="text-label-caps text-on-surface-variant" htmlFor="password">Contraseña</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant/60 group-focus-within:text-primary transition-colors" style={{ fontSize: 20 }}>lock</span>
                </div>
                <input
                  id="password" type={showPass ? "text" : "password"} required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowPass((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    {showPass ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center text-title-md py-3">
              {loading
                ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: 20 }}>progress_activity</span>
                : <><span>Iniciar Sesión</span><span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span></>
              }
            </button>
          </form>
        </div>

        {/* Footer status */}
        <div className="mt-md flex justify-between items-center px-2">
        </div>
      </main>
    </div>
  );
};
