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
    </form>
  );
};
