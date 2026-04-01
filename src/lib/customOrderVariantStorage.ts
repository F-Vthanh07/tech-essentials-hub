/**
 * BE đôi khi trả productBaseId khác variant đã chọn; sau get-my không còn fallback.
 * Lưu variantId đúng lúc tạo đơn để Order Tracking / thanh toán vẫn dùng đúng UUID.
 */
const KEY_PREFIX = "customOrderVariantId:";

export function rememberCustomOrderVariantId(
  customOrderId: string,
  variantId: string
): void {
  if (!customOrderId?.trim() || !variantId?.trim()) return;
  try {
    localStorage.setItem(
      `${KEY_PREFIX}${customOrderId.trim()}`,
      variantId.trim()
    );
  } catch {
    /* quota / private mode */
  }
}

export function getRememberedCustomOrderVariantId(
  customOrderId: string
): string | undefined {
  if (!customOrderId?.trim()) return undefined;
  try {
    const v = localStorage.getItem(`${KEY_PREFIX}${customOrderId.trim()}`);
    const t = v?.trim();
    return t || undefined;
  } catch {
    return undefined;
  }
}
