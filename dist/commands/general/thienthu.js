"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Command_1 = require("../../structures/Command");
const permissions_1 = require("../../config/permissions");
const OwnerUIService_1 = require("../../services/OwnerUIService");
class ThienThu extends Command_1.Command {
    constructor() { super(new discord_js_1.SlashCommandBuilder().setName('thienthu').setDescription('Thiên Thư · bảng Owner duy nhất')); }
    async execute(_c, i) { if (!(0, permissions_1.isBotOwner)(i.user.id))
        return i.editReply('⛔ Thiên Thư không nhận chủ.'); return i.editReply({ components: [(0, OwnerUIService_1.ownerView)(i.user.id)], flags: 32768 }); }
}
exports.default = ThienThu;
