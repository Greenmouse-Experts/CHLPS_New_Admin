import ApiService from "@/lib/network/api";

const apiService = new ApiService();

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  status?: number;
}

const apiClient = {
  get: async (route: string) => {
    const res = await apiService.getData(route);
    return { data: res };
  },
  post: async (route: string, data?: any) => {
    const res = await apiService.postData(route, data);
    return { data: res };
  },
};

export default apiClient;
