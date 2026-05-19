import { useAuthStore } from "../../../store/useAuthStore";

export const ProfilePage = () => {
  const { user } = useAuthStore();
  return (
    <div>
      <h1>Perfil</h1>
      <p>Nombre: {user?.nombre} {user?.apellido}</p>
      <p>Email: {user?.email}</p>
      <p>Roles: {user?.roles.join(', ')}</p>
    </div>
  );
};
