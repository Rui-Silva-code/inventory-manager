import axios from "axios";

const BASE_URL = "http://localhost:5000";

export async function login(email, password) {
  const res = await axios.post(`${BASE_URL}/auth/login`, {
    email,
    password,
  });

  return res.data;
}
