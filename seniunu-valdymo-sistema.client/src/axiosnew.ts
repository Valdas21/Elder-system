import axios from "axios";

const axiosnew = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: false,
});

export default axiosnew;