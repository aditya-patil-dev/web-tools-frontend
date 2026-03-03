import { useState, useEffect } from "react";
import { settingsApi, type SiteSettings } from "@/services/settings.service";
import { uploadApi } from "@/services/upload.service";
import { toast } from "@/components/toast/toast";

export type UseSettingsReturn = {
  settings: SiteSettings | null;
  isLoading: boolean;
  isSaving: boolean;
  isUploading: boolean;
  error: Error | null;
  updateField: <K extends keyof SiteSettings>(
    key: K,
    value: SiteSettings[K],
  ) => void;
  uploadLogo: (file: File) => Promise<void>;
  uploadFavicon: (file: File) => Promise<void>;
  save: () => Promise<void>;
  refetch: () => Promise<void>;
};

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch settings on mount
  const fetchSettings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("🔍 Fetching settings from API...");
      const response = await settingsApi.getSettings();
      console.log("✅ Settings loaded:", response.data);
      setSettings(response.data);
    } catch (err: any) {
      console.error("❌ Settings fetch error:", err);

      // Check if it's an auth error
      if (err?.response?.status === 401 || err?.status === 401) {
        console.error(
          "🔒 Authentication error - token might be missing or expired",
        );
        toast.error("Session expired. Please log in again.");
      } else {
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load settings";
        setError(err);
        toast.error(`Failed to load settings: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Update a single field
  const updateField = <K extends keyof SiteSettings>(
    key: K,
    value: SiteSettings[K],
  ) => {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : null));
  };

  // Upload logo
  const uploadLogo = async (file: File) => {
    setIsUploading(true);

    try {
      console.log("📤 Uploading logo:", file.name);
      const response = await uploadApi.uploadLogo(file);
      console.log("✅ Logo uploaded:", response.file.url);

      // Update settings with new logo URL
      updateField("logo_url", response.file.url);

      toast.success("Logo uploaded successfully");
    } catch (err: any) {
      console.error("❌ Logo upload error:", err);
      const errorMessage =
        err?.response?.data?.message || err?.message || "Failed to upload logo";
      toast.error(`Failed to upload logo: ${errorMessage}`);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  // Upload favicon
  const uploadFavicon = async (file: File) => {
    setIsUploading(true);

    try {
      console.log("📤 Uploading favicon:", file.name);
      const response = await uploadApi.uploadFavicon(file);
      console.log("✅ Favicon uploaded:", response.file.url);

      // Update settings with new favicon URL
      updateField("favicon_url", response.file.url);

      toast.success("Favicon uploaded successfully");
    } catch (err: any) {
      console.error("❌ Favicon upload error:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to upload favicon";
      toast.error(`Failed to upload favicon: ${errorMessage}`);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  // Save settings
  const save = async () => {
    if (!settings) {
      toast.error("No settings to save");
      return;
    }

    setIsSaving(true);

    try {
      console.log("💾 Saving settings:", settings);
      const response = await settingsApi.updateSettings(settings);
      console.log("✅ Settings saved:", response.data);

      setSettings(response.data);
      toast.success("Settings saved successfully");
    } catch (err: any) {
      console.error("❌ Settings save error:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save settings";
      toast.error(`Failed to save settings: ${errorMessage}`);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    settings,
    isLoading,
    isSaving,
    isUploading,
    error,
    updateField,
    uploadLogo,
    uploadFavicon,
    save,
    refetch: fetchSettings,
  };
}
