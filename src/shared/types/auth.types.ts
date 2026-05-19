export type IRole = "ADMIN" | "STOCK" | "PEDIDOS" | "CLIENT"

export interface IUser {
    id: number
    nombre: string
    apellido: string
    email: string
    celular: string | null
    roles: IRole[]
    created_at: string
}
