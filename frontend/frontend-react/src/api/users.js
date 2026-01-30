import api from "./client";

export const getUsers = async () => {
  const res = await api.get("/users");
  return res.data;
};

export const createUser = async (user) => {
  const res = await api.post("/users", user);
  return res.data;
};

export const updateUserRole = async (id, role) => {
  const res = await api.put(`/users/${id}/role`, { role });
  return res.data;
};

export const deleteUser = async (id) => {
  await api.delete(`/users/${id}`);
};
