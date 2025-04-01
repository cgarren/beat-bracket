import axiosInstance, { maxBracketsKey } from "../axios/backendInstance";

export async function search(query, type, limit) {
  const params = { q: query, type: type, limit: limit };
  const response = await axiosInstance.get(`search/?${new URLSearchParams(params).toString()}`);
  return response.data;
}

export async function getBrackets(userId) {
  // Not using the userId for now since brackets require authentication - might need to change this if uer prackets are public (or make a new endpoint like getPublicBrackets)
  const response = await axiosInstance.get("brackets", {
    includeAuth: true,
  });
  return response.data;
}

export async function getBracket(id, ownerId) {
  console.log("getBracket", id, ownerId);
  const response = await axiosInstance.get("bracket", {
    params: {
      id: id,
      ownerId: ownerId,
    },
  });
  return response.data;
}

export async function getTemplate(id, ownerId) {
  const response = await axiosInstance.get("template", {
    params: {
      id: id,
      ownerId: ownerId,
    },
  });
  return response.data;
}

export async function createBracket(bracket) {
  const response = await axiosInstance.put("bracket", bracket, { includeAuth: true });
  console.debug("Written Bracket:", bracket);
  return response.data;
}

export async function updateBracket(id, updateObject) {
  const response = await axiosInstance.patch("bracket", updateObject, { includeAuth: true, params: { id: id } });
  return response.data;
}

export async function deleteBracket(id) {
  const response = await axiosInstance.delete("bracket", { includeAuth: true, params: { id: id } });
  return response.data;
}

export async function updateTemplate(id, updateObject) {
  const response = await axiosInstance.patch("template", updateObject, { includeAuth: true, params: { id: id } });
  return response.data;
}

// const updateBracket = useCallback(
//   async (id, updateObject) => {
//     await loadBackendRequest(
//       "/bracket",
//       "PATCH",
//       {
//         id: id,
//         ownerId: userInfo.id,
//       },
//       true,
//       updateObject,
//     );
//   },
//   [loadBackendRequest],
// );

// const deleteBracket = useCallback(
//   async (id) =>
//     loadBackendRequest(
//       "/bracket",
//       "DELETE",
//       {
//         id: id,
//         ownerId: userInfo.id,
//       },
//       true,
//     ),
//   [loadBackendRequest],
// );

export function getMaxBrackets() {
  // eventually make this a call to the backend if not present in localstorage
  if (typeof window !== "undefined") {
    return localStorage.getItem(maxBracketsKey);
  }
  return null;
}
