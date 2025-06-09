import axios from "axios";

export const generateUrlPdfToBase64 = async (url) => {
    const base64Data = await axios.get(url, {
        responseType: "arraybuffer",
        responseEncoding: "binary",
        headers: {
            "Content-Type": "application/pdf"
        }
    });

    return base64Data.data.toString('base64');
};