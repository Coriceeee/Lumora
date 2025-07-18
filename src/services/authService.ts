import { getAuth } from "firebase/auth";

export function getCurrentUserId(): string {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Người dùng chưa đăng nhập");
  return user.uid;
}
