"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.V2_FLAG = void 0;
exports.text = text;
exports.sep = sep;
exports.btn = btn;
exports.row = row;
exports.userSelectRow = userSelectRow;
exports.box = box;
exports.boxSections = boxSections;
exports.sellModal = sellModal;
exports.auctionCreateModal = auctionCreateModal;
exports.auctionBidModal = auctionBidModal;
exports.appearanceModal = appearanceModal;
exports.sectCreateModal = sectCreateModal;
exports.announcementModal = announcementModal;
exports.ownerAssetModal = ownerAssetModal;
exports.ownerItemModal = ownerItemModal;
exports.ownerPlayerModal = ownerPlayerModal;
exports.ownerContentModal = ownerContentModal;
exports.ownerRepairModal = ownerRepairModal;
exports.safeUpdate = safeUpdate;
const discord_js_1 = require("discord.js");
const emojis_1 = require("../config/emojis");
exports.V2_FLAG = discord_js_1.MessageFlags.IsComponentsV2;
function text(t) { return new discord_js_1.TextDisplayBuilder().setContent((0, emojis_1.renderEmojis)(t)); }
function sep() { return new discord_js_1.SeparatorBuilder().setDivider(true); }
function btn(id, label, style = discord_js_1.ButtonStyle.Secondary, emoji) { const b = new discord_js_1.ButtonBuilder().setCustomId(id).setLabel((0, emojis_1.renderEmojis)(label).slice(0, 80)).setStyle(style); if (emoji)
    b.setEmoji((0, emojis_1.emojiFromLegacy)(emoji)); return b; }
function row(...b) { return new discord_js_1.ActionRowBuilder().addComponents(...b); }
function userSelectRow(id, placeholder = 'Chọn một đạo hữu') { const s = new discord_js_1.UserSelectMenuBuilder().setCustomId(id).setPlaceholder(placeholder).setMinValues(1).setMaxValues(1); return new discord_js_1.ActionRowBuilder().addComponents(s); }
function box(title, body, rows = [], media = {}) { const c = new discord_js_1.ContainerBuilder().setAccentColor(0x8e44ad); if (media.topImageUrl) {
    c.addMediaGalleryComponents(new discord_js_1.MediaGalleryBuilder().addItems(new discord_js_1.MediaGalleryItemBuilder().setURL(media.topImageUrl)));
} const content = text(`# ${title}\n${body || '*Không có ghi chép.*'}`); if (media.avatarUrl) {
    c.addSectionComponents(new discord_js_1.SectionBuilder().addTextDisplayComponents(content).setThumbnailAccessory(new discord_js_1.ThumbnailBuilder().setURL(media.avatarUrl).setDescription('Ảnh đại diện đạo hữu')));
}
else
    c.addTextDisplayComponents(content); for (const r of rows) {
    c.addSeparatorComponents(sep());
    c.addActionRowComponents(r);
} return c; }
function boxSections(title, body, sections, media = {}) {
    const c = new discord_js_1.ContainerBuilder().setAccentColor(0x8e44ad);
    if (media.topImageUrl)
        c.addMediaGalleryComponents(new discord_js_1.MediaGalleryBuilder().addItems(new discord_js_1.MediaGalleryItemBuilder().setURL(media.topImageUrl)));
    const content = text(`# ${title}\n${body || '*Không có ghi chép.*'}`);
    if (media.avatarUrl)
        c.addSectionComponents(new discord_js_1.SectionBuilder().addTextDisplayComponents(content).setThumbnailAccessory(new discord_js_1.ThumbnailBuilder().setURL(media.avatarUrl).setDescription('Ảnh đại diện đạo hữu')));
    else
        c.addTextDisplayComponents(content);
    for (const section of sections) {
        c.addSeparatorComponents(sep());
        c.addTextDisplayComponents(text(`## ${section.title}`));
        for (const r of section.rows)
            c.addActionRowComponents(r);
    }
    return c;
}
function sellModal(uid, preset = '') { const m = new discord_js_1.ModalBuilder().setCustomId(`ttmarketsellmodal_${uid}`).setTitle('Kim Vân Đài · Đăng bán'); const item = new discord_js_1.TextInputBuilder().setCustomId('item').setLabel('Tên, mã vật phẩm hoặc instance ID').setPlaceholder('Ví dụ: Thanh Linh Thảo').setStyle(discord_js_1.TextInputStyle.Short).setRequired(true); if (preset)
    item.setValue(preset); const qty = new discord_js_1.TextInputBuilder().setCustomId('qty').setLabel('Số lượng').setValue('1').setStyle(discord_js_1.TextInputStyle.Short).setRequired(true); const price = new discord_js_1.TextInputBuilder().setCustomId('price').setLabel('Tổng giá bán (Linh Thạch)').setPlaceholder('Ví dụ: 500').setStyle(discord_js_1.TextInputStyle.Short).setRequired(true); m.addComponents(new discord_js_1.ActionRowBuilder().addComponents(item), new discord_js_1.ActionRowBuilder().addComponents(qty), new discord_js_1.ActionRowBuilder().addComponents(price)); return m; }
function auctionCreateModal(uid, instanceId) { const m = new discord_js_1.ModalBuilder().setCustomId(`ttauctioncreatemodal:${instanceId}_${uid}`).setTitle('Đấu Giá · Mở phiên'); const price = new discord_js_1.TextInputBuilder().setCustomId('price').setLabel('Giá khởi điểm (Linh Thạch)').setValue('1000').setStyle(discord_js_1.TextInputStyle.Short).setRequired(true), hours = new discord_js_1.TextInputBuilder().setCustomId('hours').setLabel('Thời hạn giờ (1–24)').setValue('6').setStyle(discord_js_1.TextInputStyle.Short).setRequired(true); m.addComponents(new discord_js_1.ActionRowBuilder().addComponents(price), new discord_js_1.ActionRowBuilder().addComponents(hours)); return m; }
function auctionBidModal(uid, listingId, min) { const m = new discord_js_1.ModalBuilder().setCustomId(`ttauctionbidmodal:${listingId}_${uid}`).setTitle('Đấu Giá · Ra giá'); const amount = new discord_js_1.TextInputBuilder().setCustomId('amount').setLabel(`Mức đặt tối thiểu ${min} LT`).setValue(String(min)).setStyle(discord_js_1.TextInputStyle.Short).setRequired(true); m.addComponents(new discord_js_1.ActionRowBuilder().addComponents(amount)); return m; }
function appearanceModal(uid, field) { const avatar = field === 'avatar_url', m = new discord_js_1.ModalBuilder().setCustomId(`ttappearancemodal:${field}_${uid}`).setTitle(avatar ? 'Hệ Thống · Đổi diện mạo' : 'Hệ Thống · Đổi ảnh nền'); const url = new discord_js_1.TextInputBuilder().setCustomId('url').setLabel(avatar ? 'Link ảnh diện mạo nhân vật' : 'Link ảnh nền hồ sơ').setPlaceholder('https://...').setStyle(discord_js_1.TextInputStyle.Short).setRequired(true); m.addComponents(new discord_js_1.ActionRowBuilder().addComponents(url)); return m; }
function sectCreateModal(uid) { const m = new discord_js_1.ModalBuilder().setCustomId(`ttsectcreatemodal_${uid}`).setTitle('Khai Lập Tông Môn'), name = new discord_js_1.TextInputBuilder().setCustomId('name').setLabel('Tên Tông Môn (2–24 ký tự)').setStyle(discord_js_1.TextInputStyle.Short).setMinLength(2).setMaxLength(24).setRequired(true); m.addComponents(new discord_js_1.ActionRowBuilder().addComponents(name)); return m; }
function announcementModal(uid, pavilion) { const m = new discord_js_1.ModalBuilder().setCustomId(`ttannouncementmodal:${pavilion}_${uid}`).setTitle('Thiên Thư · Thiên Hạ Cáo Thị'), content = new discord_js_1.TextInputBuilder().setCustomId('content').setLabel('Nội dung thông báo').setStyle(discord_js_1.TextInputStyle.Paragraph).setMinLength(2).setMaxLength(1500).setRequired(true); m.addComponents(new discord_js_1.ActionRowBuilder().addComponents(content)); return m; }
function ownerAssetModal(uid, operation, asset) { const m = new discord_js_1.ModalBuilder().setCustomId(`ttownerassetmodal:${operation}~${asset}_${uid}`).setTitle(`Thiên Thư · ${operation} ${asset}`), target = new discord_js_1.TextInputBuilder().setCustomId('target').setLabel('Discord User ID').setStyle(discord_js_1.TextInputStyle.Short).setRequired(true), amount = new discord_js_1.TextInputBuilder().setCustomId('amount').setLabel(operation === 'SET' ? 'Số dư mới' : 'Số lượng').setStyle(discord_js_1.TextInputStyle.Short).setRequired(true); m.addComponents(new discord_js_1.ActionRowBuilder().addComponents(target), new discord_js_1.ActionRowBuilder().addComponents(amount)); return m; }
function ownerItemModal(uid, operation) { const m = new discord_js_1.ModalBuilder().setCustomId(`ttowneritemmodal:${operation}_${uid}`).setTitle(`Thiên Thư · ${operation} Item`), target = new discord_js_1.TextInputBuilder().setCustomId('target').setLabel('Discord User ID').setStyle(discord_js_1.TextInputStyle.Short).setRequired(true), item = new discord_js_1.TextInputBuilder().setCustomId('item').setLabel('Item ID chính xác').setStyle(discord_js_1.TextInputStyle.Short).setRequired(true), amount = new discord_js_1.TextInputBuilder().setCustomId('amount').setLabel('Số lượng').setStyle(discord_js_1.TextInputStyle.Short).setRequired(true); m.addComponents(new discord_js_1.ActionRowBuilder().addComponents(target), new discord_js_1.ActionRowBuilder().addComponents(item), new discord_js_1.ActionRowBuilder().addComponents(amount)); return m; }
function ownerPlayerModal(uid, action) { const m = new discord_js_1.ModalBuilder().setCustomId(`ttownerplayermodal:${action}_${uid}`).setTitle(`Thiên Thư · ${action}`), target = new discord_js_1.TextInputBuilder().setCustomId('target').setLabel('Discord User ID').setStyle(discord_js_1.TextInputStyle.Short).setRequired(true), value = new discord_js_1.TextInputBuilder().setCustomId('value').setLabel(action === 'SET_REALM' ? 'Realm ID (vd: nguyen_anh)' : action === 'SET_TUVI' ? 'Tu Vi tuyệt đối' : 'Nhập 1 để xác nhận').setValue(action.startsWith('LOCK') || action.startsWith('UNLOCK') ? '1' : '').setStyle(discord_js_1.TextInputStyle.Short).setRequired(true), reason = new discord_js_1.TextInputBuilder().setCustomId('reason').setLabel('Lý do').setStyle(discord_js_1.TextInputStyle.Paragraph).setMinLength(3).setRequired(true); m.addComponents(new discord_js_1.ActionRowBuilder().addComponents(target), new discord_js_1.ActionRowBuilder().addComponents(value), new discord_js_1.ActionRowBuilder().addComponents(reason)); return m; }
function ownerContentModal(uid, action) { const m = new discord_js_1.ModalBuilder().setCustomId(`ttownercontentmodal:${action}_${uid}`).setTitle(`Thiên Thư · Content ${action}`), id = new discord_js_1.TextInputBuilder().setCustomId('definition_id').setLabel('Definition ID').setStyle(discord_js_1.TextInputStyle.Short).setRequired(true), kind = new discord_js_1.TextInputBuilder().setCustomId('kind').setLabel(action === 'DRAFT' ? 'Loại: item/monster/skill/...' : 'Version').setStyle(discord_js_1.TextInputStyle.Short).setRequired(true), data = new discord_js_1.TextInputBuilder().setCustomId('data').setLabel(action === 'DRAFT' ? 'JSON definition' : 'Gõ CONFIRM').setStyle(discord_js_1.TextInputStyle.Paragraph).setRequired(true); m.addComponents(new discord_js_1.ActionRowBuilder().addComponents(id), new discord_js_1.ActionRowBuilder().addComponents(kind), new discord_js_1.ActionRowBuilder().addComponents(data)); return m; }
function ownerRepairModal(uid) { const m = new discord_js_1.ModalBuilder().setCustomId(`ttownerrepairmodal_${uid}`).setTitle('Thiên Thư · Repair'), target = new discord_js_1.TextInputBuilder().setCustomId('target').setLabel('Discord User ID').setStyle(discord_js_1.TextInputStyle.Short).setRequired(true), field = new discord_js_1.TextInputBuilder().setCustomId('field').setLabel('Field: hp / stamina / tu_vi').setStyle(discord_js_1.TextInputStyle.Short).setRequired(true), value = new discord_js_1.TextInputBuilder().setCustomId('value').setLabel('Giá trị sau repair').setStyle(discord_js_1.TextInputStyle.Short).setRequired(true), reason = new discord_js_1.TextInputBuilder().setCustomId('reason').setLabel('Reason | provenance').setStyle(discord_js_1.TextInputStyle.Paragraph).setRequired(true), key = new discord_js_1.TextInputBuilder().setCustomId('key').setLabel('Idempotency key (ít nhất 8 ký tự)').setStyle(discord_js_1.TextInputStyle.Short).setRequired(true); m.addComponents(new discord_js_1.ActionRowBuilder().addComponents(target), new discord_js_1.ActionRowBuilder().addComponents(field), new discord_js_1.ActionRowBuilder().addComponents(value), new discord_js_1.ActionRowBuilder().addComponents(reason), new discord_js_1.ActionRowBuilder().addComponents(key)); return m; }
async function safeUpdate(i, c) { await i.client.rest.post(discord_js_1.Routes.interactionCallback(i.id, i.token), { body: { type: 7, data: { components: [c], flags: exports.V2_FLAG } } }); i.replied = true; }
