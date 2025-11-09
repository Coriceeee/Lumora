// src/app/utils/firestoreSafe.ts
import { where, QueryConstraint, WhereFilterOp } from "firebase/firestore";

/**
 * where() an toàn – tránh lỗi "Unsupported field value: undefined"
 * Nếu value = undefined hoặc null, hàm trả về null (bỏ qua điều kiện đó)
 */
export function safeWhere(
  fieldPath: string,
  opStr: WhereFilterOp, // ✅ sửa type này
  value: any
): QueryConstraint | null {
  if (value === undefined || value === null) {
    console.warn(
      `⚠️ safeWhere: Giá trị của field "${fieldPath}" là undefined/null → BỎ QUA điều kiện where() này.`
    );
    return null;
  }

  return where(fieldPath, opStr, value);
}
