import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function signCustomerToken(payload: any) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "30d",
  });
}

export function verifyCustomerToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}
