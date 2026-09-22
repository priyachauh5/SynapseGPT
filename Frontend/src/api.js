const BASE_URL = "http://localhost:8080/api/auth";

export const signup = async (data) => {
  return fetch(`${BASE_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(res => res.json());
};

export const login = async (data) => {
  return fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(res => res.json());
};

export const sendMessage = async (message) => {
  const res = await fetch("http://localhost:8080/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}` // 🔥 IMPORTANT
    },
    body: JSON.stringify({ message }),
  });

  return res.json();
};