import axios, { AxiosRequestConfig } from "axios";
import { toast } from "vue3-toastify";
import { Storage } from "~/config/Enum";
import codeMessage from "./codeMessage";
const BASE_PREFIX = import.meta.env.VITE_REQUEST_BASE_URL;

const axiosInstance = axios.create({
  baseURL: BASE_PREFIX,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config: any) => {
    const accessToken = localStorage.getItem(Storage.ACCESS_TOKEN);
    if (accessToken) {
      return {
        ...config,
        headers: {
          ...config.headers,
          Authorization: accessToken ? `Bearer ${accessToken}` : "",
        },
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    if (response?.status === 200) {
      return response.data.data;
    }
  },
  (error) => {
    // 只有token过期,才会返回401
    // 但是也不需要回到登录页, 用户可以随意浏览, 增加一个登录入口, 自己点击去登录
    if (error?.response?.data?.code === 401) {
      localStorage.removeItem(Storage.ACCESS_TOKEN);
      localStorage.removeItem(Storage.USER_INFO);
      return Promise.reject(error);
    }

    toast(error?.response?.data?.message, {
      type: "error",
      position: toast.POSITION.TOP_CENTER,
    });
    console.error(
      error?.response?.data,
      codeMessage?.[error?.response?.status as keyof typeof codeMessage]
    );
    Promise.reject(error);
  }
);

const request = {
  get: <ResponseType = unknown>(
    url: string,
    params?: any,
    options?: AxiosRequestConfig<unknown>
  ): Promise<ResponseType> => {
    return axiosInstance.get(url, {
      params,
      ...options,
    });
  },
  post: <ResponseType = unknown>(
    url: string,
    data: any,
    options?: AxiosRequestConfig<unknown>
  ): Promise<ResponseType> => {
    return axiosInstance.post(url, data, options);
  },
  upload: (url: string, file: FormData | File) =>
    axiosInstance.post(url, file, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// const request = <ResponseType = unknown>(
//   url: string,
//   options?: AxiosRequestConfig<unknown> & {
//     method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
//   }
// ): Promise<ResponseType> => {
//   const method = options?.method ?? "GET";

//   if (method === "GET") {
//     return requestObj.get<ResponseType>(url, options);
//   }
//   if (method === "DELETE") {
//     return requestObj.delete<ResponseType>(url, options);
//   }
//   if (method === "POST") {
//     return requestObj.post<ResponseType>(url, options?.data, options);
//   }
//   if (method === "PUT") {
//     return requestObj.post<ResponseType>(url, options?.data, options);
//   }
//   if (method === "PATCH") {
//     return requestObj.patch<ResponseType>(url, options?.data, options);
//   }

//   return requestObj.get<ResponseType>(url, options);
// };

export { axiosInstance, request };
