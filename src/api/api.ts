import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const buildRefreshPayload = () => {
  const refreshToken = localStorage.getItem("refresh_token");
  const storedUser = localStorage.getItem("auth_user");

  if (!refreshToken || !storedUser) {
    throw new Error("Missing refresh data");
  }

  const user = JSON.parse(storedUser);

  return {
    refreshToken,
    username: user.email,
    role: user.role,
    loginId: user.id,
    refreshExpiry: null,
    type: "CHECK",
  };
};


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const payload = buildRefreshPayload();

        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/Login/CheckRefreshToken`,
          payload
        );

        localStorage.setItem("access_token", res.data.accessToken);
        localStorage.setItem("refresh_token", res.data.refreshToken);

        error.config.headers.Authorization =
          `Bearer ${res.data.accessToken}`;

        return axios(error.config);
      } catch {
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;