import { useQuery } from "@tanstack/react-query";
import axiosInstance, { tokensExist } from "../axios/spotifyInstance";
import guestProfileImage from "../assets/images/guestProfileImage.png";

export default function useUserInfo(userId) {
  const userIdToFetch = userId || "me";
  const { data, isPending, isFetching, error } = useQuery({
    queryKey: ["spotify", "userInfo", { id: userIdToFetch }],
    queryFn: async () => {
      if (!userIdToFetch || !tokensExist()) {
        return null;
      }
      let url = `https://api.spotify.com/v1/users/${userIdToFetch}`;
      if (userIdToFetch === "me") {
        url = "https://api.spotify.com/v1/me";
      }
      const response = await axiosInstance.get(url);
      if (!response?.images?.length) {
        response?.images?.push({
          url: guestProfileImage,
        });
      }
      return response;
    },
    refetchOnWindowFocus: false,
    staleTime: 3600000,
    cacheTime: 3600000,
    meta: {
      errorMessage: null,
    },
  });

  return { data, isPending, isFetching, error };
}
