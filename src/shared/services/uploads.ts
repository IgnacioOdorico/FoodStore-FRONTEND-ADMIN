import { api } from "./api";

export interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
}

/**
 * Sube múltiples imágenes de una vez al servidor.
 * Internamente hace las llamadas individuales a /api/v1/uploads/imagen
 */
export async function uploadImages(files: File[]): Promise<CloudinaryResponse[]> {
  const uploadPromises = files.map(async (file) => {
    const formData = new FormData();
    // TPI spec: field 'file'
    formData.append("file", file);

    const { data } = await api.post<CloudinaryResponse>("/api/v1/uploads/imagen", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  });

  return Promise.all(uploadPromises);
}

/**
 * Elimina una imagen en Cloudinary mediante su public_id
 */
export async function deleteImage(publicId: string): Promise<void> {
  // Encode the public_id to pass safely in URL path
  const encodedId = encodeURIComponent(publicId);
  await api.delete(`/api/v1/uploads/imagen/${encodedId}`);
}
