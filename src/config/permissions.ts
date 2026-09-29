/**
 * Quyền tối cao của Thương Mang Thiên Hạ.
 * Không dùng quyền Administrator của guild để thay thế kiểm tra này.
 */
export const BOT_OWNER_ID = '724608013981450351';

export function isBotOwner(userId: string): boolean {
  return userId === BOT_OWNER_ID;
}

export function assertBotOwner(userId: string): void {
  if (!isBotOwner(userId)) throw new Error('OWNER_ONLY');
}
