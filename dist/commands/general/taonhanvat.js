"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Command_1 = require("../../structures/Command");
const UserRepository_1 = require("../../database/repositories/UserRepository");
const creationLore_1 = require("../../data/creationLore");
const ItemInstanceService_1 = require("../../services/ItemInstanceService");
const OwnerControlService_1 = require("../../services/OwnerControlService");
const ui_1 = require("../../utils/ui");
const DEFAULT_THUMBNAIL = 'https://cdn.discordapp.com/attachments/1554068055989026826/1554068450614448178/tb.jfif';
const WAIT = 120_000;
const pause = (ms) => new Promise(r => setTimeout(r, ms));
function choiceRow(prefix, choices) {
    return new discord_js_1.ActionRowBuilder().addComponents(...choices.map((x, index) => new discord_js_1.ButtonBuilder().setCustomId(`${prefix}:${index}`).setLabel(`${x.emoji} ${x.name}`.slice(0, 80)).setStyle(discord_js_1.ButtonStyle.Secondary)));
}
class TaoNhanVat extends Command_1.Command {
    constructor() { super(new discord_js_1.SlashCommandBuilder().setName('taonhanvat').setDescription('Theo Lăng Tiêu nhập thế vào Thương Mang Thiên Hạ')); }
    async execute(_, i) {
        if (OwnerControlService_1.ownerControlService.maintenanceLocked())
            return i.editReply('Thiên hạ đang trong maintenance để xác nhận reset; tạm thời chưa thể nhập thế.');
        if (UserRepository_1.userRepository.get(i.user.id))
            return i.editReply('Đạo danh đã lập, không thể nhập thế lần nữa.');
        const uid = i.user.id;
        const avatar = i.user.displayAvatarURL({ extension: 'png', size: 256 });
        const edit = async (title, body, rows = []) => (i.editReply({ components: [(0, ui_1.box)(title, body, rows)], flags: ui_1.V2_FLAG }));
        const reply = await edit('Sơn Môn · Khách Từ Phàm Trần', '*Mây phủ ngang sườn núi. Một người áo trắng đứng bên thềm đá, nghe tiếng chân mới quay lại.*\n\n' +
            '**Lăng Tiêu:** “Đã đến đây rồi thì theo ta. Trước khi bước vào Thương Mang, có vài thứ cần xem cho rõ.”\n\n' +
            'Hắn xoay người đi trước. Cuối con đường đá là một gian điện nhỏ, nơi ánh tinh quang đang chậm rãi lưu chuyển.', [new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId('creation:follow').setLabel('Theo Lăng Tiêu').setStyle(discord_js_1.ButtonStyle.Primary))]);
        const message = reply;
        const first = await message.awaitMessageComponent({ componentType: discord_js_1.ComponentType.Button, time: WAIT, filter: (x) => x.user.id === uid && x.customId === 'creation:follow' }).catch(() => null);
        if (!first)
            return edit('Sơn Môn Đã Khép', 'Lăng Tiêu đã rời khỏi thềm đá. Khi muốn nhập thế, hãy dùng lại **/taonhanvat**.');
        await first.deferUpdate();
        await edit('Quan Tinh Điện · Mệnh Cách', '**Lăng Tiêu:** “Mệnh cách không quyết định ngươi sẽ trở thành ai. Nó chỉ cho biết con đường dưới chân dễ nghiêng về phía nào.”\n\n' +
            creationLore_1.DESTINIES.map(d => `${d.emoji} **${d.name}** — ${d.description}`).join('\n\n') + '\n\n*Chọn mệnh cách mà ngươi muốn mang theo khi nhập thế.*', [choiceRow('creation:destiny', creationLore_1.DESTINIES)]);
        const dPick = await message.awaitMessageComponent({ componentType: discord_js_1.ComponentType.Button, time: WAIT, filter: (x) => x.user.id === uid && x.customId.startsWith('creation:destiny:') }).catch(() => null);
        if (!dPick)
            return edit('Tinh Quang Đã Tắt', 'Nghi thức bị gián đoạn. Hãy dùng lại **/taonhanvat** khi đã sẵn sàng.');
        const destiny = creationLore_1.DESTINIES[Number(dPick.customId.split(':')[2])];
        await dPick.deferUpdate();
        const lc = (0, creationLore_1.generateLinhCan)();
        const [element, value] = (0, creationLore_1.mainLinhCan)(lc);
        const grade = (0, creationLore_1.linhCanGrade)(value);
        await edit('Đài Kiểm Tra Linh Căn', `${destiny.emoji} **Mệnh cách: ${destiny.name}**\n> ${destiny.line}\n\n` +
            '*Lăng Tiêu đặt một khối linh ngọc lên trận bàn. Linh quang men theo những đường trận văn rồi dừng lại trước người.*\n\n' +
            `🌌 **${grade} Linh Căn · ${element} ${value}%**\n> ${(0, creationLore_1.getLinhCanFlavorText)(element)}\n\n` +
            '**Lăng Tiêu:** “Căn cốt chỉ quyết định nơi bắt đầu. Đi được đến đâu, vẫn phải tự mình bước.”', [new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId('creation:continue').setLabel('Tiếp tục').setStyle(discord_js_1.ButtonStyle.Primary))]);
        const lcNext = await message.awaitMessageComponent({ componentType: discord_js_1.ComponentType.Button, time: WAIT, filter: (x) => x.user.id === uid && x.customId === 'creation:continue' }).catch(() => null);
        if (!lcNext)
            return edit('Nghi Thức Tạm Dừng', 'Linh ngọc đã lắng xuống. Hãy dùng lại **/taonhanvat** để bắt đầu lại nghi thức.');
        await lcNext.deferUpdate();
        await edit('Trước Khi Xuống Núi', '**Lăng Tiêu:** “Còn một chuyện. Người bước vào tiên lộ đều có nơi mình đã đi qua. Xuất thân không trói buộc ngươi, nhưng nó để lại dấu vết.”\n\n' +
            creationLore_1.BACKGROUNDS.map(b => `${b.emoji} **${b.name}** — ${b.description}`).join('\n\n'), [choiceRow('creation:bg', creationLore_1.BACKGROUNDS)]);
        const bPick = await message.awaitMessageComponent({ componentType: discord_js_1.ComponentType.Button, time: WAIT, filter: (x) => x.user.id === uid && x.customId.startsWith('creation:bg:') }).catch(() => null);
        if (!bPick)
            return edit('Nghi Thức Tạm Dừng', 'Hãy dùng lại **/taonhanvat** khi muốn tiếp tục nhập thế.');
        const bg = creationLore_1.BACKGROUNDS[Number(bPick.customId.split(':')[2])];
        await bPick.deferUpdate();
        await edit('Một Câu Cuối Cùng', `${bg.emoji} **${bg.name}**\n*${bg.intro}*\n\n` +
            '**Lăng Tiêu** nhìn người trước mặt một thoáng rồi mới hỏi:\n\n' +
            '“Đã đi cùng ta đến đây mà vẫn chưa biết nên xưng hô thế nào. **Đạo hữu gọi là gì?**”', [new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId('creation:name').setLabel('Xưng danh').setStyle(discord_js_1.ButtonStyle.Success))]);
        const nameButton = await message.awaitMessageComponent({ componentType: discord_js_1.ComponentType.Button, time: WAIT, filter: (x) => x.user.id === uid && x.customId === 'creation:name' }).catch(() => null);
        if (!nameButton)
            return edit('Lăng Tiêu Chờ Một Lời', 'Khi đã muốn xưng danh, hãy dùng lại **/taonhanvat**.');
        const modal = new discord_js_1.ModalBuilder().setCustomId(`creation:name:${uid}`).setTitle('Xưng Danh · Nhập Thế');
        const nameInput = new discord_js_1.TextInputBuilder().setCustomId('dao_hieu').setLabel('Đạo hiệu của bạn').setPlaceholder('Nhập đạo hiệu...').setStyle(discord_js_1.TextInputStyle.Short).setMinLength(2).setMaxLength(32).setRequired(true);
        modal.addComponents(new discord_js_1.ActionRowBuilder().addComponents(nameInput));
        await nameButton.showModal(modal);
        const submitted = await nameButton.awaitModalSubmit({ time: WAIT, filter: (x) => x.user.id === uid && x.customId === `creation:name:${uid}` }).catch(() => null);
        if (!submitted)
            return edit('Danh Chưa Lập', 'Nghi thức chưa hoàn tất. Hãy dùng lại **/taonhanvat** khi muốn nhập thế.');
        const n = submitted.fields.getTextInputValue('dao_hieu').trim().slice(0, 32);
        if (n.length < 2) {
            await submitted.reply({ content: 'Đạo hiệu cần ít nhất 2 ký tự.', ephemeral: true });
            return;
        }
        if (UserRepository_1.userRepository.get(uid)) {
            await submitted.reply({ content: 'Đạo danh đã được lập trong lúc nghi thức diễn ra.', ephemeral: true });
            return;
        }
        await submitted.deferUpdate();
        // Diện mạo được chọn ở cuối nghi thức, sau khi đã xưng danh nhưng trước khi ghi DB.
        // Discord modal không nhận file trực tiếp, nên link ảnh dùng modal; upload dùng attachment trong kênh.
        let appearanceUrl = avatar;
        await edit('Diện Mạo · Lưu Ảnh Vào Đạo Hồ', `**Lăng Tiêu:** “Đạo hiệu đã có. Còn diện mạo, đạo hữu muốn lưu lại dáng vẻ nào?”\n\n` +
            '**Dán link ảnh:** dùng một đường dẫn ảnh bắt đầu bằng `http://` hoặc `https://`.\n' +
            '**Upload ảnh:** bấm nút rồi gửi ảnh trực tiếp vào kênh này.\n' +
            '**Bỏ qua:** tạm dùng ảnh đại diện Discord hiện tại; có thể đổi sau.\n\n' +
            '*Ảnh chỉ dùng làm diện mạo nhân vật trong hồ sơ Thương Mang.*', [new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId('creation:appearance:url').setLabel('Dán link ảnh').setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder().setCustomId('creation:appearance:upload').setLabel('Upload ảnh').setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder().setCustomId('creation:appearance:skip').setLabel('Bỏ qua').setStyle(discord_js_1.ButtonStyle.Secondary))]);
        const appearancePick = await message.awaitMessageComponent({ componentType: discord_js_1.ComponentType.Button, time: WAIT, filter: (x) => x.user.id === uid && x.customId.startsWith('creation:appearance:') }).catch(() => null);
        if (!appearancePick)
            return edit('Nghi Thức Tạm Dừng', 'Chưa chọn diện mạo. Hãy dùng lại **/taonhanvat** khi muốn tiếp tục nhập thế.');
        if (appearancePick.customId === 'creation:appearance:url') {
            const appearanceModal = new discord_js_1.ModalBuilder().setCustomId(`creation:appearance:url:${uid}`).setTitle('Diện Mạo Nhân Vật');
            const imageInput = new discord_js_1.TextInputBuilder().setCustomId('appearance_url').setLabel('Link ảnh diện mạo').setPlaceholder('https://...').setStyle(discord_js_1.TextInputStyle.Short).setMinLength(8).setMaxLength(1000).setRequired(true);
            appearanceModal.addComponents(new discord_js_1.ActionRowBuilder().addComponents(imageInput));
            await appearancePick.showModal(appearanceModal);
            const appearanceSubmit = await appearancePick.awaitModalSubmit({ time: WAIT, filter: (x) => x.user.id === uid && x.customId === `creation:appearance:url:${uid}` }).catch(() => null);
            if (!appearanceSubmit)
                return edit('Diện Mạo Chưa Lập', 'Chưa nhận được link ảnh. Hãy dùng lại **/taonhanvat** khi muốn tiếp tục.');
            const raw = appearanceSubmit.fields.getTextInputValue('appearance_url').trim();
            try {
                const u = new URL(raw);
                if (!['http:', 'https:'].includes(u.protocol))
                    throw new Error('protocol');
                appearanceUrl = u.toString();
            }
            catch {
                await appearanceSubmit.reply({ content: 'Link ảnh không hợp lệ. Link cần bắt đầu bằng `http://` hoặc `https://`.', ephemeral: true });
                return;
            }
            await appearanceSubmit.deferUpdate();
        }
        else if (appearancePick.customId === 'creation:appearance:upload') {
            await appearancePick.deferUpdate();
            await edit('Diện Mạo · Chờ Ảnh', '**Hãy upload/thả một ảnh trực tiếp vào kênh này trong vòng 2 phút.**\n\n' +
                'Bot chỉ nhận ảnh do chính đạo hữu gửi. Nếu đổi ý, hãy chờ hết thời gian rồi dùng lại **/taonhanvat**.');
            const channel = i.channel;
            if (!channel?.awaitMessages)
                return edit('Không Thể Nhận Ảnh', 'Kênh này không hỗ trợ nhận attachment. Hãy dùng lại **/taonhanvat** và chọn **Dán link ảnh** hoặc **Bỏ qua**.');
            const collected = await channel.awaitMessages({ time: WAIT, max: 1, filter: (m) => m.author?.id === uid && m.attachments?.size > 0 }).catch(() => null);
            const uploadMessage = collected?.first?.();
            const attachment = uploadMessage?.attachments?.first?.();
            if (!attachment)
                return edit('Chưa Nhận Được Ảnh', 'Không nhận được attachment trong thời gian chờ. Hãy dùng lại **/taonhanvat** khi muốn tiếp tục.');
            const contentType = String(attachment.contentType || '');
            if (contentType && !contentType.startsWith('image/'))
                return edit('Tệp Không Phải Ảnh', 'Attachment vừa gửi không phải định dạng ảnh. Hãy dùng lại **/taonhanvat** và gửi một ảnh.');
            appearanceUrl = attachment.url;
        }
        else {
            await appearancePick.deferUpdate();
        }
        const heirloom = (0, creationLore_1.generateHeirloom)();
        const combo = (0, creationLore_1.findCombo)(bg.id, element);
        const prophecy = (0, creationLore_1.generateProphecy)(bg.id, destiny.id, element);
        const hpPct = (destiny.bonuses.hpPercent || 0) - (destiny.penalties.hpPercent || 0), atkPct = (destiny.bonuses.atkPercent || 0) - (destiny.penalties.atkPercent || 0), defPct = (destiny.bonuses.defPercent || 0) - (destiny.penalties.defPercent || 0);
        const baseHp = 100 + (bg.bonuses.hp || 0), baseAtk = 15 + (bg.bonuses.atk || 0), baseDef = 10 + (bg.bonuses.def || 0);
        UserRepository_1.userRepository.create(uid, n, appearanceUrl, DEFAULT_THUMBNAIL, { backgroundId: bg.id, destinyId: destiny.id, linhCanJson: JSON.stringify(lc), linhCanMain: element, linhCanGrade: grade, heirloomId: heirloom.id, heirloomName: heirloom.name, prophecy, innateSkill: combo?.skillName || '', hpBonus: Math.round(baseHp * hpPct / 100) + (bg.bonuses.hp || 0), atkBonus: Math.round(baseAtk * atkPct / 100) + (bg.bonuses.atk || 0), defBonus: Math.round(baseDef * defPct / 100) + (bg.bonuses.def || 0), mpBonus: bg.bonuses.mp || 0, speedBonus: bg.bonuses.speed || 0, ltBonus: bg.bonuses.lt || 0, knbBonus: bg.bonuses.knb || 0 });
        ItemInstanceService_1.itemInstanceService.grantCreation(uid, bg.id, heirloom);
        await pause(250);
        const itemLine = bg.startingItem ? `\n🎁 **Vật truyền khởi đầu:** ${bg.startingItem.name}` : '';
        return edit(`${n} · Nhập Thế`, '**Lăng Tiêu:** “Được. Ta nhớ rồi.”\n\n' +
            `${bg.emoji} **Xuất thân:** ${bg.name}\n${destiny.emoji} **Mệnh cách:** ${destiny.name}\n🌌 **Linh căn:** ${grade} · ${element} ${value}%\n🖼️ **Diện mạo:** ${appearanceUrl === avatar ? 'Ảnh đại diện Discord' : appearanceUrl}\n` +
            `🏺 **Cổ vật:** ${heirloom.icon} ${heirloom.name} — ${heirloom.effect}${itemLine}\n` +
            `${combo ? `✨ **Thiên phú cộng hưởng:** ${combo.skillName}\n${combo.skillDescription}\n` : ''}\n` +
            `📜 **Mệnh thư**\n${prophecy}\n\n` +
            '*Phía sau, sơn môn khép lại. Phía trước là Thương Mang Thiên Hạ.*\n\nDùng **/tutien** để mở Tiên Lộ Tổng Bảng.');
    }
}
exports.default = TaoNhanVat;
