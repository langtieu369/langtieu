"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BOT_OWNER_ID = void 0;
exports.isBotOwner = isBotOwner;
exports.assertBotOwner = assertBotOwner;
/**
 * Quyền tối cao của Thương Mang Thiên Hạ.
 * Không dùng quyền Administrator của guild để thay thế kiểm tra này.
 */
exports.BOT_OWNER_ID = '724608013981450351';
function isBotOwner(userId) {
    return userId === exports.BOT_OWNER_ID;
}
function assertBotOwner(userId) {
    if (!isBotOwner(userId))
        throw new Error('OWNER_ONLY');
}
