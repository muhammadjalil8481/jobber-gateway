import fs from "fs";
import crypto from "crypto";

const privateKey = fs.readFileSync("./private.pem", "utf-8");

export const generateGatewayToken = (): string => {
  const signer = crypto.createSign("SHA256");
  signer.end();
  const signature = signer.sign(privateKey, "base64");
  return signature;
};
