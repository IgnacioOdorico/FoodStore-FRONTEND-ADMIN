import { useAuthStore } from "../../../store/useAuthStore";

export const DashboardPage = () => {
  const { user } = useAuthStore();
  return (
    <div>
      <h1>Dashboard</h1>
      <p>
        Bienvenido {user?.nombre} {user?.apellido} — Roles: {user?.roles.join(', ')}
      </p>
    </div>
  );
};
