import { api } from "@/lib/api/api";

export type FileUploadOptions = {
  file: File;
  visibility?: "public" | "private";
  folder?: string;
};

export type UploadedFile = {
  id: number;
  url: string;
  provider: string;
  key: string;
  mime_type: string;
  size_bytes: number;
  original_name: string;
  visibility: string;
  created_at: string;
};

export type FileUploadResponse = {
  message: string;
  file: UploadedFile;
};

/**
 * Upload API Service
 */
export const uploadApi = {
  /**
   * Upload a single file
   * POST /uploads
   */
  async uploadFile(options: FileUploadOptions): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append("file", options.file);

    if (options.visibility) {
      formData.append("visibility", options.visibility);
    }

    if (options.folder) {
      formData.append("folder", options.folder);
    }

    // FormData automatically sets Content-Type: multipart/form-data
    // Don't manually set it - let the browser handle it
    return api.post<FileUploadResponse>("/uploads", formData);
  },

  /**
   * Upload logo (shorthand for logo folder)
   */
  async uploadLogo(file: File): Promise<FileUploadResponse> {
    return this.uploadFile({
      file,
      folder: "logos",
      visibility: "public",
    });
  },

  /**
   * Upload favicon (shorthand for favicon folder)
   */
  async uploadFavicon(file: File): Promise<FileUploadResponse> {
    return this.uploadFile({
      file,
      folder: "favicons",
      visibility: "public",
    });
  },
};
