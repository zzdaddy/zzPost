import { request } from "~/request/axios";

// 用户登录
export const userLogin = (data: unknown): Promise<any> => {
  return request.post("/user/login", data);
};

// 用户注册
export const userRegister = (data: unknown) => {
  return request.post("/user/register", data);
};

// 获取用户信息
export const getUserInfo = (data?: unknown): Promise<object> => {
  return request.post("/user/info", data);
};
