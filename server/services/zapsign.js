import axios from "axios";
import config from "../config";

export async function getContractDetail(doc_token) {
  const response = await axios.get(`${config.zapsignUrl}docs/${doc_token}/`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + config.zapsignToken
    }
  });

  return response.data;
}