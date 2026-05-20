import { useState, type SyntheticEvent } from "react";
import { useAuthStore } from "../../../store/useAuthStore";
import { useNavigate } from "react-router-dom";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <form onSubmit={handleSubmit}>
      <h1>Iniciar Sesión</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="text"
        placeholder="Email"
        required
      />

      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="Contraseña"
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? "Ingresando..." : "Entrar"}
      </button>

      <div style={{
        marginTop: "20px",
        padding: "12px",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        backgroundColor: "#f8fafc",
        fontSize: "14px",
        color: "#334155",
        display: "flex",
        flexDirection: "column",
        gap: "8px"
      }}>
        <h4 style={{ margin: 0, fontWeight: 600, color: "#0f172a", fontSize: "13px" }}>
          Cuentas de prueba (click para autocompletar):
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {[
            { role: "ADMIN", email: "admin@nachopizza.com", pass: "Admin1234!" },
            { role: "STOCK", email: "stock@nachopizza.com", pass: "Stock1234!" },
            { role: "PEDIDOS", email: "pedidos@nachopizza.com", pass: "Pedidos1234!" },
            { role: "CLIENT", email: "juan@ejemplo.com", pass: "Juan1234!" }
          ].map((acc) => (
            <button
              key={acc.role}
              type="button"
              onClick={() => {
                setEmail(acc.email);
                setPassword(acc.pass);
              }}
              style={{
                padding: "6px 10px",
                backgroundColor: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: "500",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                color: "#1e293b",
                width: "100%"
              }}
            >
              <span style={{ fontWeight: "bold", color: "#2563eb" }}>{acc.role}</span>
              <span style={{ color: "#64748b" }}>{acc.email}</span>
            </button>
          ))}
        </div>
      </div>
    </form>
  );
};
