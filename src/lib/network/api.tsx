import axios, { AxiosRequestHeaders, AxiosInstance, AxiosError } from "axios";
import { getUserFromDB } from "../storage/user_db";
import { UserState } from "../../features/auth/reducers/user_slice";

class ApiService {
  private axiosInstance: AxiosInstance;
  private readonly baseURL: string = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  private userToken: string = "";

  constructor(timeout: number = 30000) {
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout,
    });

    this.setAuthHeader();
    this.setResponseInterceptor();
    this.initialize();
  }

  private async initialize() {
    if (typeof window === "undefined") return;

    try {
      const users = await getUserFromDB();
      const user: UserState | null = users[0] ?? null;
      this.userToken = user?.token ?? "";
    } catch (error) {
      console.error("Error fetching user token:", error);
    }
  }

  private setAuthHeader() {
    this.axiosInstance.interceptors.request.use(async (config) => {
      if (!this.userToken && typeof window !== "undefined") {
        try {
          const users = await getUserFromDB();
          this.userToken = users[0]?.token ?? "";
        } catch {
          /* ignore */
        }
      }
      if (this.userToken) {
        config.headers["Authorization"] = `Bearer ${this.userToken}`;
      }
      return config;
    });
  }

  private setResponseInterceptor() {
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (
          error.response?.status === 401 &&
          typeof window !== "undefined" &&
          !window.location.pathname.startsWith("/auth/login")
        ) {
          try {
            const { getDB } = await import("../storage/user_db");
            const db = await getDB();
            await db.transaction("users", "readwrite").objectStore("users").clear();
          } catch {
            /* ignore */
          }
          window.location.href = "/auth/login";
        }
        return Promise.reject(error);
      },
    );
  }

  private handleError(error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message || error.message || "Unknown error",
      status: error.response?.status,
      data: error.response?.data,
    };
  }

  public async getData<T>(
    endpoint: string,
    params?: Record<string, any>,
    headers?: AxiosRequestHeaders,
  ): Promise<{
    success: boolean;
    data: T | null;
    message?: string;
    status?: number;
  }> {
    try {
      const response = await this.axiosInstance.get<T>(endpoint, {
        params,
        headers,
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error fetching data", error);
      return this.handleError(error as AxiosError);
    }
  }

  public async postData<T, R>(
    endpoint: string,
    data?: T,
    headers?: AxiosRequestHeaders,
  ): Promise<{
    success: boolean;
    data: R | null;
    message?: string;
    status?: number;
  }> {
    try {
      const response = await this.axiosInstance.post<R>(endpoint, data, {
        headers,
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error posting data", error);
      return this.handleError(error as AxiosError);
    }
  }

  public async putData<T, R>(
    endpoint: string,
    data?: T,
    headers?: AxiosRequestHeaders,
  ): Promise<{
    success: boolean;
    data: R | null;
    message?: string;
    status?: number;
  }> {
    try {
      const response = await this.axiosInstance.put<R>(endpoint, data, {
        headers,
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error updating data", error);
      return this.handleError(error as AxiosError);
    }
  }

  public async patchData<T, R>(
    endpoint: string,
    data?: T,
    headers?: AxiosRequestHeaders,
  ): Promise<{
    success: boolean;
    data: R | null;
    message?: string;
    status?: number;
  }> {
    try {
      const response = await this.axiosInstance.patch<R>(endpoint, data, {
        headers,
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error patching data", error);
      return this.handleError(error as AxiosError);
    }
  }

  public async deleteData<R>(
    endpoint: string,
    data?: any,
    headers?: AxiosRequestHeaders,
  ): Promise<{
    success: boolean;
    data: R | null;
    message?: string;
    status?: number;
  }> {
    try {
      const response = await this.axiosInstance.delete<R>(endpoint, {
        data,
        headers,
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error deleting data", error);
      return this.handleError(error as AxiosError);
    }
  }

  public async uploadFile<R>(
    endpoint: string,
    file: File,
    fileName: string,
    extraData?: Record<string, any>,
  ): Promise<{
    success: boolean;
    data: R | null;
    message?: string;
    status?: number;
  }> {
    return this.postUploadFile<R>(endpoint, file, fileName, extraData);
  }

  public async postUploadFile<R>(
    endpoint: string,
    file: File,
    fileName: string,
    extraData?: Record<string, any>,
  ): Promise<{
    success: boolean;
    data: R | null;
    message?: string;
    status?: number;
  }> {
    try {
      const formData = new FormData();
      formData.append(fileName, file);

      if (extraData) {
        Object.entries(extraData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value as string);
          }
        });
      }

      const response = await this.axiosInstance.post<R>(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error uploading file", error);
      return this.handleError(error as AxiosError);
    }
  }

  public async postFormData<R>(
    endpoint: string,
    formData: FormData,
  ): Promise<{
    success: boolean;
    data: R | null;
    message?: string;
    status?: number;
  }> {
    try {
      const response = await this.axiosInstance.post<R>(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error posting form data", error);
      return this.handleError(error as AxiosError);
    }
  }
}

export default ApiService;
