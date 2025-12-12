import emailjs from "@emailjs/nodejs";
import type { NextApiRequest, NextApiResponse } from "next";

interface ReqBody {
  name: string;
  email: string;
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email, message } = req.body as ReqBody;

  try {
    await emailjs.send(
    
            process.env.service_ols1oal as string,
            process.env.template_gm4ymgi as string,
            {
        name,
        title: message,
      },
      {
                publicKey: process.env.PODvnKNN_iD92K8WV,
                privateKey: process.env.d1KF_XfHSYwSfuOwRH3wg, // 🔒 AN TOÀN
      }
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("EmailJS error:", error);
    return res.status(500).json({ success: false });
  }
}
