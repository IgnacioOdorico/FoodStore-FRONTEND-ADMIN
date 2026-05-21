import { useState, type SyntheticEvent } from "react";
import { useAuthStore } from "../../../store/useAuthStore";
import { useNavigate } from "react-router-dom";

const DEV_ACCOUNTS = [
  { role: "ADMIN",   email: "admin@nachopizza.com",   pass: "Admin1234!" },
  { role: "STOCK",   email: "stock@nachopizza.com",   pass: "Stock1234!" },
  { role: "PEDIDOS", email: "pedidos@nachopizza.com", pass: "Pedidos1234!" },
  { role: "CLIENT",  email: "juan@ejemplo.com",       pass: "Juan1234!" },
];

export const LoginPage = () => {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const success = await login(email, password);
    if (!success) return;
    const { user } = useAuthStore.getState();
    if (user && (user.roles.includes("ADMIN") || user.roles.includes("STOCK") || user.roles.includes("PEDIDOS"))) {
      navigate("/dashboard");
    } else {
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
          <p className="text-body-lg text-on-surface-variant mt-1">Management Portal</p>
        </div>

        {/* Card */}
        <div className="bg-surface-container-lowest rounded-xl shadow-card border border-outline-variant/40 p-lg">
          <div className="mb-md">
            <h2 className="text-title-md font-semibold text-on-surface">Welcome back</h2>
            <p className="text-body-sm text-on-surface-variant mt-1">Please enter your administrative credentials.</p>
          </div>

          {error && (
            <div className="mb-md px-4 py-3 bg-error-container rounded-lg border border-error/20 flex items-center gap-2">
              <span className="material-symbols-outlined text-error" style={{ fontSize: 18 }}>error</span>
              <p className="text-body-sm text-on-error-container font-semibold">{error}</p>
            </div>
          )}

          <form className="space-y-md" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="space-y-xs">
              <label className="text-label-caps text-on-surface-variant" htmlFor="email">Email Address</label>
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
              <label className="text-label-caps text-on-surface-variant" htmlFor="password">Password</label>
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
                : <><span>Sign In</span><span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span></>
              }
            </button>
          </form>

          {/* Dev quick-fill */}
          <div className="mt-xl pt-md border-t border-outline-variant/40">
            <p className="text-label-caps text-on-surface-variant mb-sm">Dev accounts — click to fill</p>
            <div className="grid grid-cols-2 gap-xs">
              {DEV_ACCOUNTS.map((acc) => (
                <button key={acc.role} type="button"
                  onClick={() => { setEmail(acc.email); setPassword(acc.pass); }}
                  className="flex flex-col px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors text-left">
                  <span className="text-label-caps text-primary font-bold">{acc.role}</span>
                  <span className="text-[10px] text-on-surface-variant truncate">{acc.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer status */}
        <div className="mt-md flex justify-between items-center px-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-label-caps text-on-surface-variant opacity-60">Server: Online</span>
          </div>
          <span className="text-label-caps text-on-surface-variant opacity-60">v2.4.0</span>
        </div>
      </main>
    </div>
  );
};
