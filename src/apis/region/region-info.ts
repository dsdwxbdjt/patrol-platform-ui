import http from "@/utils/http";

const baseUrl = "/api/region";

export const getRegionTree = () => {
  return http.get(`${baseUrl}/list`);
}
