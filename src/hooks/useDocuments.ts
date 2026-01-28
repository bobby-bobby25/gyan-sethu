import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import { toast } from "sonner";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// =============================================
// TYPES/INTERFACES
// =============================================

export interface Document {
  id: number;
  reference_type: string;
  reference_id: number;
  name: string;
  document_type?: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  description?: string;
  tags?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentDetail extends Document {
  uploaded_by?: number;
  verified_by?: number;
  verified_at?: string;
}

export interface DocumentStats {
  reference_type: string;
  total_count: number;
  verified_count: number;
  total_size_bytes?: number;
  latest_upload?: string;
}

export interface DocumentCategory {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
}

export interface DocumentCreateRequest {
  reference_type: string;
  reference_id: number;
  name: string;
  document_type?: string;
  description?: string;
  tags?: string;
}

// =============================================
// HOOKS FOR GENERIC DOCUMENTS API
// =============================================

/**
 * Get all documents for a specific reference (Student, Teacher, Donor, etc)
 * @param referenceType - Type of reference (e.g., 'Student', 'Teacher', 'Donor')
 * @param referenceId - ID of the referenced entity
 */
export function useDocumentsByReference(
  referenceType: string | null,
  referenceId: number | null
) {
  return useQuery({
    queryKey: ["documents", referenceType, referenceId],
    queryFn: async () => {
      if (!referenceType || !referenceId) return [];
      
      try {
        const { data } = await api.get("/Documents", {
          params: {
            referenceType,
            referenceId,
          },
        });
        return data as Document[];
      } catch (error) {
        console.error("Error fetching documents:", error);
        throw error;
      }
    },
    enabled: !!referenceType && !!referenceId,
  });
}

/**
 * Get a single document by ID
 */
export function useDocument(documentId: number | null) {
  return useQuery({
    queryKey: ["document", documentId],
    queryFn: async () => {
      if (!documentId) return null;
      
      try {
        const { data } = await api.get(`/Documents/${documentId}`);
        return data as DocumentDetail;
      } catch (error) {
        console.error("Error fetching document:", error);
        throw error;
      }
    },
    enabled: !!documentId,
  });
}

/**
 * Search documents with filters
 */
export function useSearchDocuments(
  searchTerm?: string,
  referenceType?: string,
  documentType?: string,
  isVerified?: boolean,
  pageNumber = 1,
  pageSize = 50
) {
  return useQuery({
    queryKey: ["documents_search", searchTerm, referenceType, documentType, isVerified, pageNumber],
    queryFn: async () => {
      try {
        const { data } = await api.get("/Documents/Search", {
          params: {
            searchTerm: searchTerm || undefined,
            referenceType: referenceType || undefined,
            documentType: documentType || undefined,
            isVerified: isVerified !== undefined ? isVerified : undefined,
            pageNumber,
            pageSize,
          },
        });
        return data;
      } catch (error) {
        console.error("Error searching documents:", error);
        throw error;
      }
    },
  });
}

/**
 * Get document statistics
 */
export function useDocumentStats(referenceType?: string) {
  return useQuery({
    queryKey: ["document_stats", referenceType],
    queryFn: async () => {
      try {
        const { data } = await api.get("/Documents/Stats/ByReference", {
          params: {
            referenceType: referenceType || undefined,
          },
        });
        return data as DocumentStats[];
      } catch (error) {
        console.error("Error fetching document stats:", error);
        throw error;
      }
    },
  });
}

/**
 * Upload a new document
 */
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      referenceType,
      referenceId,
      name,
      documentType,
      description,
      tags,
    }: {
      file: File;
      referenceType: string;
      referenceId: number;
      name: string;
      documentType?: string;
      description?: string;
      tags?: string;
    }) => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("referenceType", referenceType);
        formData.append("referenceId", String(referenceId));
        formData.append("name", name);
        if (documentType) formData.append("documentType", documentType);
        if (description) formData.append("description", description);
        if (tags) formData.append("tags", tags);

        const { data } = await api.post("/Documents/Upload", formData, {
          headers: { "Content-Type": undefined },
        });

        return data;
      } catch (error) {
        console.error("Error uploading document:", error);
        throw error;
      }
    },
    onSuccess: (_, { referenceType, referenceId }) => {
      queryClient.invalidateQueries({
        queryKey: ["documents", referenceType, referenceId],
      });
      queryClient.invalidateQueries({ queryKey: ["document_stats"] });
      toast.success("Document uploaded successfully");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || error.message || "Failed to upload document";
      toast.error(`Upload failed: ${message}`);
    },
  });
}

/**
 * Download a document
 */
export function useDownloadDocument() {
  return useMutation({
    mutationFn: async (documentId: number) => {
      try {
        const response = await api.get(`/Documents/${documentId}/Download`, {
          responseType: "blob",
        });
        return response;
      } catch (error) {
        console.error("Error downloading document:", error);
        throw error;
      }
    },
    onSuccess: (response) => {
        const contentDisposition = response.headers["content-disposition"];
        let fileName = "download";
        if (contentDisposition) {
            // RFC 5987 (filename*=UTF-8'')
            const fileNameStarMatch = contentDisposition.match(/filename\*=UTF-8''(.+)/i);
            if (fileNameStarMatch?.[1]) {
            fileName = decodeURIComponent(fileNameStarMatch[1]);
            } else {
            // filename="xyz.ext" OR filename=xyz.ext
            const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
            if (fileNameMatch?.[1]) {
                fileName = fileNameMatch[1];
            }
            }
        }

        const blob = new Blob([response.data], {
            type: response.headers["content-type"] || "application/octet-stream",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;

        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        toast.success("Document downloaded successfully");
    },

    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error.message ||
        "Failed to download document";
      toast.error(`Download failed: ${message}`);
    },
  });
}

/**
 * Get document URL for direct linking
 */
export function useGetDocumentUrl(documentId: number | null) {
  return useQuery({
    queryKey: ["document_url", documentId],
    queryFn: async () => {
      if (!documentId) return null;
      
      try {
        const { data } = await api.get(`/Documents/${documentId}/Url`);
        return data.url;
      } catch (error) {
        console.error("Error getting document URL:", error);
        throw error;
      }
    },
    enabled: !!documentId,
  });
}

/**
 * Update document metadata
 */
export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      documentId,
      ...updates
    }: {
      documentId: number;
      name?: string;
      document_type?: string;
      description?: string;
      tags?: string;
      is_verified?: boolean;
    }) => {
      try {
        const { data } = await api.put(`/Documents/${documentId}`, updates);
        return data;
      } catch (error) {
        console.error("Error updating document:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document_stats"] });
      toast.success("Document updated successfully");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || "Failed to update document";
      toast.error(`Update failed: ${message}`);
    },
  });
}

/**
 * Delete a document
 */
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: number) => {
      try {
        await api.delete(`/Documents/${documentId}`);
      } catch (error) {
        console.error("Error deleting document:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document_stats"] });
      toast.success("Document deleted successfully");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || "Failed to delete document";
      toast.error(`Delete failed: ${message}`);
    },
  });
}

/**
 * Get document categories
 */
export function useDocumentCategories() {
  return useQuery({
    queryKey: ["document_categories"],
    queryFn: async () => {
      try {
        const { data } = await api.get("/Documents/Categories/List");
        return data as DocumentCategory[];
      } catch (error) {
        console.error("Error fetching document categories:", error);
        throw error;
      }
    },
  });
}

export function useDocumentUrl() {
  const getDocumentUrl = (documentId: number) => {
    if (!documentId) return null;

    return `${API_BASE_URL}/Documents/${documentId}/Download`;
  };

  return { getDocumentUrl };
}
