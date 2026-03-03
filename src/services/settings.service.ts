import { api } from "@/lib/api/api";

export type SiteSettings = {
  id?: number;
  site_name: string;
  site_tagline: string;
  site_url: string;
  site_description?: string;
  logo_url?: string;
  favicon_url?: string;
  google_analytics_id?: string;
  google_tag_manager_id?: string;
  google_search_console?: string;
  bing_webmaster?: string;
  facebook_pixel_id?: string;
  hotjar_site_id?: string;
  maintenance_mode?: boolean;
  updated_by?: string;
  created_at?: string;
  updated_at?: string;
};

export type SettingsResponse = {
  success: boolean;
  message: string;
  data: SiteSettings;
};

/**
 * Settings API Service
 */
export const settingsApi = {
  /**
   * GET /settings/admin - Get site settings
   */
  async getSettings(): Promise<SettingsResponse> {
    return api.get<SettingsResponse>("/settings/admin");
  },

  /**
   * PUT /settings/admin - Update site settings
   * Supports partial updates
   */
  async updateSettings(data: Partial<SiteSettings>): Promise<SettingsResponse> {
    return api.put<SettingsResponse>("/settings/admin", data);
  },
};
