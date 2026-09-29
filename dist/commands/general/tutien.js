"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Command_1 = require("../../structures/Command");
const UserRepository_1 = require("../../database/repositories/UserRepository");
const TuTienUIService_1 = require("../../services/TuTienUIService");
class TuTien extends Command_1.Command {
    constructor() { super(new discord_js_1.SlashCommandBuilder().setName('tutien').setDescription('Mở Tiên Lộ Tổng Bảng của Thương Mang Thiên Hạ')); }
    async execute(_c, i) { if (!UserRepository_1.userRepository.get(i.user.id)) {
        await i.editReply('Đạo hữu chưa nhập thế. Hãy dùng **/taonhanvat** để lập đạo hiệu trước.');
        return;
    } await i.editReply({ components: [(0, TuTienUIService_1.homeView)(i.user.id)], flags: 32768 }); }
}
exports.default = TuTien;
