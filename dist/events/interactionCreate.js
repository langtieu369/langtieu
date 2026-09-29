"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onInteraction = onInteraction;
const discord_js_1 = require("discord.js");
const ui_1 = require("../utils/ui");
const UserRepository_1 = require("../database/repositories/UserRepository");
const TuTienUIService_1 = require("../services/TuTienUIService");
const WorldService_1 = require("../services/WorldService");
const CraftingService_1 = require("../services/CraftingService");
const EquipmentService_1 = require("../services/EquipmentService");
const ConsumableService_1 = require("../services/ConsumableService");
const CultivationService_1 = require("../services/CultivationService");
const MarketService_1 = require("../services/MarketService");
const CombatService_1 = require("../services/CombatService");
const GameCatalog_1 = require("../config/GameCatalog");
const JourneyService_1 = require("../services/JourneyService");
const StorageService_1 = require("../services/StorageService");
const InventoryRepository_1 = require("../database/repositories/InventoryRepository");
const ItemInstanceService_1 = require("../services/ItemInstanceService");
const RuntimeSystemsService_1 = require("../services/RuntimeSystemsService");
const permissions_1 = require("../config/permissions");
const WorldEventGameplayService_1 = require("../services/WorldEventGameplayService");
const AuctionService_1 = require("../services/AuctionService");
const AppearanceService_1 = require("../services/AppearanceService");
const OwnerControlService_1 = require("../services/OwnerControlService");
const OwnerUIService_1 = require("../services/OwnerUIService");
const OwnerAdvancedService_1 = require("../services/OwnerAdvancedService");
const OwnerApprovalService_1 = require("../services/OwnerApprovalService");
const DungeonPartyService_1 = require("../services/DungeonPartyService");
const PlayerSectService_1 = require("../services/PlayerSectService");
const RelationshipRuntimeService_1 = require("../services/RelationshipRuntimeService");
const ActivityRuntimeService_1 = require("../services/ActivityRuntimeService");
const TowerService_1 = require("../services/TowerService");
const RealmNpcVisitService_1 = require("../services/RealmNpcVisitService");
const SystemRegistry_1 = require("../config/SystemRegistry");
const OperationalHardeningService_1 = require("../services/OperationalHardeningService");
function parse(customId) { const k = customId.lastIndexOf('_'); const left = customId.slice(0, k), uid = customId.slice(k + 1); const p = left.slice(2).split(':'); return { action: p.shift() || '', extra: p.join(':'), uid }; }
async function dispatchInteraction(client, i) {
    if (i.isChatInputCommand()) {
        if (!i.deferred && !i.replied)
            await i.deferReply({ flags: discord_js_1.MessageFlags.Ephemeral });
        const c = client.commands.get(i.commandName);
        if (c)
            await c.execute(client, i);
        else
            await i.editReply('Lệnh này chưa được đăng ký.');
        return;
    }
    if (i.isModalSubmit() && i.customId.startsWith('ttmarketsellmodal_')) {
        const uid = i.customId.slice('ttmarketsellmodal_'.length);
        if (i.user.id !== uid) {
            await i.reply({ content: 'Đây không phải giao diện của đạo hữu.', flags: discord_js_1.MessageFlags.Ephemeral });
            return;
        }
        const qty = Number(i.fields.getTextInputValue('qty')), price = Number(i.fields.getTextInputValue('price')), item = i.fields.getTextInputValue('item');
        const r = MarketService_1.marketService.create(uid, item, qty, price);
        await i.reply({ content: r.message, flags: discord_js_1.MessageFlags.Ephemeral });
        return;
    }
    if (i.isModalSubmit() && i.customId.startsWith('ttauctioncreatemodal:')) {
        const { extra, uid } = parse(i.customId);
        if (i.user.id !== uid)
            return void await i.reply({ content: 'Đây không phải giao diện của đạo hữu.', flags: discord_js_1.MessageFlags.Ephemeral });
        const r = AuctionService_1.auctionService.create(uid, extra, Number(i.fields.getTextInputValue('price')), Number(i.fields.getTextInputValue('hours')));
        await i.reply({ content: r.message, flags: discord_js_1.MessageFlags.Ephemeral });
        return;
    }
    if (i.isModalSubmit() && i.customId.startsWith('ttauctionbidmodal:')) {
        const { extra, uid } = parse(i.customId);
        if (i.user.id !== uid)
            return void await i.reply({ content: 'Đây không phải giao diện của đạo hữu.', flags: discord_js_1.MessageFlags.Ephemeral });
        const r = AuctionService_1.auctionService.bid(uid, Number(extra), Number(i.fields.getTextInputValue('amount')));
        await i.reply({ content: r.message, flags: discord_js_1.MessageFlags.Ephemeral });
        return;
    }
    if (i.isModalSubmit() && i.customId.startsWith('ttappearancemodal:')) {
        const { extra, uid } = parse(i.customId);
        if (i.user.id !== uid)
            return void await i.reply({ content: 'Đây không phải giao diện của đạo hữu.', flags: discord_js_1.MessageFlags.Ephemeral });
        const r = AppearanceService_1.appearanceService.update(uid, extra, i.fields.getTextInputValue('url'));
        await i.reply({ content: r.message, flags: discord_js_1.MessageFlags.Ephemeral });
        return;
    }
    if (i.isModalSubmit() && i.customId.startsWith('ttsectcreatemodal_')) {
        const uid = i.customId.slice('ttsectcreatemodal_'.length);
        if (i.user.id !== uid)
            return void await i.reply({ content: 'Đây không phải giao diện của đạo hữu.', flags: discord_js_1.MessageFlags.Ephemeral });
        const r = PlayerSectService_1.playerSectService.create(uid, i.fields.getTextInputValue('name'), `ui:sect:create:${uid}:${i.id}`);
        await i.reply({ content: r.message, flags: discord_js_1.MessageFlags.Ephemeral });
        return;
    }
    if (i.isModalSubmit() && i.customId.startsWith('ttannouncementmodal:')) {
        const { extra, uid } = parse(i.customId);
        if (i.user.id !== uid || !(0, permissions_1.isBotOwner)(uid))
            return void await i.reply({ content: 'Thiên Thư không nhận chủ.', flags: discord_js_1.MessageFlags.Ephemeral });
        const r = OwnerControlService_1.ownerControlService.announce(uid, extra, i.fields.getTextInputValue('content'));
        if (r.ok && i.channel?.isSendable())
            await i.channel.send(r.message);
        await i.reply({ content: r.ok ? 'Đã ban bố cáo thị.' : r.message, flags: discord_js_1.MessageFlags.Ephemeral });
        return;
    }
    if (i.isModalSubmit() && i.customId.startsWith('ttownerassetmodal:')) {
        const { extra, uid } = parse(i.customId), [op, asset] = extra.split('~');
        if (i.user.id !== uid || !(0, permissions_1.isBotOwner)(uid))
            return void await i.reply({ content: 'Thiên Thư không nhận chủ.', flags: discord_js_1.MessageFlags.Ephemeral });
        const target = i.fields.getTextInputValue('target'), amount = Number(i.fields.getTextInputValue('amount')), r = asset === 'CPLT' ? OwnerApprovalService_1.ownerApprovalService.previewCplt(uid, target, op, amount) : OwnerControlService_1.ownerControlService.adjustCurrency(uid, target, asset, op, amount);
        if (asset === 'CPLT' && r.ok)
            await i.reply({ components: [(0, OwnerUIService_1.ownerMutationConfirmView)(uid, r, 'ownerhighconfirm')], flags: 32832 });
        else
            await i.reply({ content: r.message, flags: discord_js_1.MessageFlags.Ephemeral });
        return;
    }
    if (i.isModalSubmit() && i.customId.startsWith('ttowneritemmodal:')) {
        const { extra, uid } = parse(i.customId);
        if (i.user.id !== uid || !(0, permissions_1.isBotOwner)(uid))
            return void await i.reply({ content: 'Thiên Thư không nhận chủ.', flags: discord_js_1.MessageFlags.Ephemeral });
        const r = OwnerControlService_1.ownerControlService.adjustItem(uid, i.fields.getTextInputValue('target'), i.fields.getTextInputValue('item'), extra, Number(i.fields.getTextInputValue('amount')));
        await i.reply({ content: r.message, flags: discord_js_1.MessageFlags.Ephemeral });
        return;
    }
    if (i.isModalSubmit() && i.customId.startsWith('ttownerplayermodal:')) {
        const { extra, uid } = parse(i.customId);
        if (i.user.id !== uid || !(0, permissions_1.isBotOwner)(uid))
            return void await i.reply({ content: 'Thiên Thư không nhận chủ.', flags: discord_js_1.MessageFlags.Ephemeral });
        const r = OwnerAdvancedService_1.ownerAdvancedService.previewPlayer(uid, i.fields.getTextInputValue('target'), extra, i.fields.getTextInputValue('value'), i.fields.getTextInputValue('reason'));
        if (r.ok)
            await i.reply({ components: [(0, OwnerUIService_1.ownerMutationConfirmView)(uid, r)], flags: 32832 });
        else
            await i.reply({ content: r.message, flags: discord_js_1.MessageFlags.Ephemeral });
        return;
    }
    if (i.isModalSubmit() && i.customId.startsWith('ttownercontentmodal:')) {
        const { extra, uid } = parse(i.customId);
        if (i.user.id !== uid || !(0, permissions_1.isBotOwner)(uid))
            return void await i.reply({ content: 'Thiên Thư không nhận chủ.', flags: discord_js_1.MessageFlags.Ephemeral });
        const id = i.fields.getTextInputValue('definition_id'), v = i.fields.getTextInputValue('kind'), data = i.fields.getTextInputValue('data');
        if (extra !== 'DRAFT' && data.trim() !== 'CONFIRM')
            return void await i.reply({ content: 'Phải nhập đúng `CONFIRM`.', flags: discord_js_1.MessageFlags.Ephemeral });
        const r = extra === 'DRAFT' ? OwnerAdvancedService_1.ownerAdvancedService.draftContent(uid, id, v, data) : OwnerApprovalService_1.ownerApprovalService.previewContent(uid, id, Number(v), extra);
        if (extra !== 'DRAFT' && r.ok)
            await i.reply({ components: [(0, OwnerUIService_1.ownerMutationConfirmView)(uid, r, 'ownerhighconfirm')], flags: 32832 });
        else
            await i.reply({ content: r.message, flags: discord_js_1.MessageFlags.Ephemeral });
        return;
    }
    if (i.isModalSubmit() && i.customId.startsWith('ttownerrepairmodal_')) {
        const uid = i.customId.slice('ttownerrepairmodal_'.length);
        if (i.user.id !== uid || !(0, permissions_1.isBotOwner)(uid))
            return void await i.reply({ content: 'Thiên Thư không nhận chủ.', flags: discord_js_1.MessageFlags.Ephemeral });
        const parts = i.fields.getTextInputValue('reason').split('|'), r = OwnerApprovalService_1.ownerApprovalService.previewRepair(uid, i.fields.getTextInputValue('target'), i.fields.getTextInputValue('field'), Number(i.fields.getTextInputValue('value')), parts[0]?.trim() || '', parts[1]?.trim() || '', i.fields.getTextInputValue('key'));
        if (r.ok)
            await i.reply({ components: [(0, OwnerUIService_1.ownerMutationConfirmView)(uid, r, 'ownerhighconfirm')], flags: 32832 });
        else
            await i.reply({ content: r.message, flags: discord_js_1.MessageFlags.Ephemeral });
        return;
    }
    if (i.isUserSelectMenu() && i.customId.startsWith('ttpvpselect')) {
        const { uid } = parse(i.customId);
        if (i.user.id !== uid) {
            await i.reply({ content: 'Đây không phải ngọc giản của đạo hữu.', flags: discord_js_1.MessageFlags.Ephemeral });
            return;
        }
        const r = CombatService_1.combatService.pvp(uid, i.values[0]);
        await (0, ui_1.safeUpdate)(i, (0, TuTienUIService_1.pvpView)(uid));
        await i.followUp({ content: r.message, flags: discord_js_1.MessageFlags.Ephemeral });
        return;
    }
    if (i.isUserSelectMenu() && i.customId.startsWith('ttpartyinvite_select')) {
        const { uid } = parse(i.customId);
        if (i.user.id !== uid)
            return void await i.reply({ content: 'Đây không phải giao diện của đạo hữu.', flags: discord_js_1.MessageFlags.Ephemeral });
        const r = DungeonPartyService_1.dungeonPartyService.invite(uid, i.values[0]);
        await (0, ui_1.safeUpdate)(i, (0, TuTienUIService_1.partyView)(uid));
        await i.followUp({ content: r.message, flags: discord_js_1.MessageFlags.Ephemeral });
        return;
    }
    if (i.isUserSelectMenu() && i.customId.startsWith('ttdaoluproposeselect')) {
        const { uid } = parse(i.customId);
        if (i.user.id !== uid)
            return void await i.reply({ content: 'Đây không phải giao diện của đạo hữu.', flags: discord_js_1.MessageFlags.Ephemeral });
        const r = RelationshipRuntimeService_1.relationshipRuntime.proposePartner(uid, i.values[0]);
        await (0, ui_1.safeUpdate)(i, (0, TuTienUIService_1.relationsView)(uid));
        await i.followUp({ content: r.message, flags: discord_js_1.MessageFlags.Ephemeral });
        return;
    }
    if (i.isUserSelectMenu() && i.customId.startsWith('ttmentorproposeselect')) {
        const { uid } = parse(i.customId);
        if (i.user.id !== uid)
            return void await i.reply({ content: 'Đây không phải giao diện của đạo hữu.', flags: discord_js_1.MessageFlags.Ephemeral });
        const r = RelationshipRuntimeService_1.mentorshipRuntime.propose(uid, i.values[0]);
        await (0, ui_1.safeUpdate)(i, (0, TuTienUIService_1.relationsView)(uid));
        await i.followUp({ content: r.message, flags: discord_js_1.MessageFlags.Ephemeral });
        return;
    }
    if (!i.isButton() || !i.customId.startsWith('tt'))
        return;
    const { action, extra, uid } = parse(i.customId);
    if (i.user.id !== uid) {
        await i.reply({ content: 'Đây không phải ngọc giản của đạo hữu.', flags: discord_js_1.MessageFlags.Ephemeral });
        return;
    }
    if (!SystemRegistry_1.UI_ACTIONS.includes(action)) {
        await i.reply({ content: 'Nút này không còn hiệu lực hoặc thuộc phiên bản giao diện cũ.', flags: discord_js_1.MessageFlags.Ephemeral });
        return;
    }
    if (OwnerControlService_1.ownerControlService.maintenanceLocked() && !action.startsWith('owner')) {
        await i.reply({ content: 'Thiên hạ đang trong maintenance để xác nhận reset; thao tác gameplay tạm khóa.', flags: discord_js_1.MessageFlags.Ephemeral });
        return;
    }
    if (!UserRepository_1.userRepository.get(uid) && !action.startsWith('owner')) {
        await i.reply({ content: 'Đạo hữu chưa nhập thế. Hãy dùng /taonhanvat trước.', flags: discord_js_1.MessageFlags.Ephemeral });
        return;
    }
    if (action === 'marketsell' || action === 'instsell') {
        await i.showModal((0, ui_1.sellModal)(uid, action === 'instsell' ? extra : ''));
        return;
    }
    if (action === 'auctioncreate') {
        await i.showModal((0, ui_1.auctionCreateModal)(uid, extra));
        return;
    }
    if (action === 'auctionbid') {
        const [l, min] = extra.split('~');
        await i.showModal((0, ui_1.auctionBidModal)(uid, Number(l), Number(min)));
        return;
    }
    if (action === 'appearanceavatar' || action === 'appearancethumb') {
        await i.showModal((0, ui_1.appearanceModal)(uid, action === 'appearanceavatar' ? 'avatar_url' : 'thumbnail_url'));
        return;
    }
    if (action === 'sectcreateform') {
        await i.showModal((0, ui_1.sectCreateModal)(uid));
        return;
    }
    if (action === 'ownerannounceform') {
        if (!(0, permissions_1.isBotOwner)(uid))
            throw new Error('OWNER_ONLY');
        await i.showModal((0, ui_1.announcementModal)(uid, extra));
        return;
    }
    if (action === 'ownerassetform') {
        if (!(0, permissions_1.isBotOwner)(uid))
            throw new Error('OWNER_ONLY');
        const [op, asset] = extra.split('~');
        await i.showModal((0, ui_1.ownerAssetModal)(uid, op, asset));
        return;
    }
    if (action === 'owneritemform') {
        if (!(0, permissions_1.isBotOwner)(uid))
            throw new Error('OWNER_ONLY');
        await i.showModal((0, ui_1.ownerItemModal)(uid, extra));
        return;
    }
    if (action === 'ownerplayerform') {
        if (!(0, permissions_1.isBotOwner)(uid))
            throw new Error('OWNER_ONLY');
        await i.showModal((0, ui_1.ownerPlayerModal)(uid, extra));
        return;
    }
    if (action === 'ownercontentform') {
        if (!(0, permissions_1.isBotOwner)(uid))
            throw new Error('OWNER_ONLY');
        await i.showModal((0, ui_1.ownerContentModal)(uid, extra));
        return;
    }
    if (action === 'ownerrepairform') {
        if (!(0, permissions_1.isBotOwner)(uid))
            throw new Error('OWNER_ONLY');
        await i.showModal((0, ui_1.ownerRepairModal)(uid));
        return;
    }
    let view, notice = '';
    switch (action) {
        case 'ownerhighconfirm': {
            if (!(0, permissions_1.isBotOwner)(uid))
                throw new Error('OWNER_ONLY');
            const [mid, nonce] = extra.split('~'), r = OwnerApprovalService_1.ownerApprovalService.confirm(uid, mid, nonce);
            notice = r.message;
            view = (0, OwnerUIService_1.ownerView)(uid);
            break;
        }
        case 'home':
            view = (0, TuTienUIService_1.homeView)(uid);
            break;
        case 'profile':
            view = (0, TuTienUIService_1.profileView)(uid);
            break;
        case 'system':
            view = (0, TuTienUIService_1.systemView)(uid);
            break;
        case 'appearancereset':
            notice = AppearanceService_1.appearanceService.resetThumbnail(uid).message;
            view = (0, TuTienUIService_1.systemView)(uid);
            break;
        case 'dongphu':
            view = (0, TuTienUIService_1.dongPhuView)(uid);
            break;
        case 'langtieuvisit':
            view = (0, TuTienUIService_1.langTieuRealmVisitView)(uid, extra);
            break;
        case 'langtieuvisitchoice': {
            const [visit, choice] = extra.split('~');
            notice = RealmNpcVisitService_1.realmNpcVisitService.choose(uid, visit, choice).message;
            view = (0, TuTienUIService_1.langTieuRealmVisitView)(uid, visit);
            break;
        }
        case 'langtieuvisitclose':
            notice = RealmNpcVisitService_1.realmNpcVisitService.close(uid, extra).message;
            view = (0, TuTienUIService_1.dongPhuView)(uid);
            break;
        case 'inventory':
            view = (0, TuTienUIService_1.inventoryView)(uid);
            break;
        case 'storage':
            view = (0, TuTienUIService_1.storageView)(uid);
            break;
        case 'bagcrafts':
            view = (0, TuTienUIService_1.bagCraftView)(uid);
            break;
        case 'bagcraft':
            notice = StorageService_1.storageService.craft(uid, extra).message;
            view = (0, TuTienUIService_1.bagCraftView)(uid);
            break;
        case 'bagswitch':
            notice = StorageService_1.storageService.switchBag(uid, Number(extra)).message;
            view = (0, TuTienUIService_1.storageView)(uid);
            break;
        case 'baglearn':
            notice = StorageService_1.storageService.learn(uid, extra).message;
            view = (0, TuTienUIService_1.bagCraftView)(uid);
            break;
        case 'temporary':
            view = (0, TuTienUIService_1.temporaryView)(uid);
            break;
        case 'tempclaim':
            notice = InventoryRepository_1.inventoryRepository.claimTemporary(uid, extra).message;
            view = (0, TuTienUIService_1.temporaryView)(uid);
            break;
        case 'tempvault':
            notice = InventoryRepository_1.inventoryRepository.moveTemporaryToVault(uid, extra).message;
            view = (0, TuTienUIService_1.temporaryView)(uid);
            break;
        case 'vault':
            view = (0, TuTienUIService_1.vaultView)(uid);
            break;
        case 'vaultclaim':
            notice = InventoryRepository_1.inventoryRepository.claimVault(uid, extra).message;
            view = (0, TuTienUIService_1.vaultView)(uid);
            break;
        case 'instequip':
            notice = ItemInstanceService_1.itemInstanceService.equip(uid, extra).message;
            view = (0, TuTienUIService_1.inventoryView)(uid);
            break;
        case 'instrepair':
            notice = ItemInstanceService_1.itemInstanceService.repair(uid, extra).message;
            view = (0, TuTienUIService_1.inventoryView)(uid);
            break;
        case 'instclaim':
            notice = ItemInstanceService_1.itemInstanceService.claim(uid, extra).message;
            view = (0, TuTienUIService_1.inventoryView)(uid);
            break;
        case 'instvault':
            notice = ItemInstanceService_1.itemInstanceService.moveToVault(uid, extra).message;
            view = (0, TuTienUIService_1.temporaryView)(uid);
            break;
        case 'wardrestore':
            notice = ItemInstanceService_1.itemInstanceService.restoreWard(uid, extra).message;
            view = (0, TuTienUIService_1.inventoryView)(uid);
            break;
        case 'heirloom':
            view = (0, TuTienUIService_1.heirloomView)(uid);
            break;
        case 'heirloomidentify':
            notice = ItemInstanceService_1.itemInstanceService.identifyHeirloom(uid, extra).message;
            view = (0, TuTienUIService_1.heirloomView)(uid);
            break;
        case 'instances':
            view = (0, TuTienUIService_1.instanceLedgerView)(uid);
            break;
        case 'cultivation':
            view = (0, TuTienUIService_1.cultivationView)(uid);
            break;
        case 'meditate':
            notice = CultivationService_1.cultivationService.meditate(uid).message;
            view = action === 'meditate' ? (0, TuTienUIService_1.dongPhuView)(uid) : (0, TuTienUIService_1.cultivationView)(uid);
            break;
        case 'breakthrough':
            notice = CultivationService_1.cultivationService.breakthrough(uid).message;
            view = (0, TuTienUIService_1.dongPhuView)(uid);
            break;
        case 'lingcan':
            view = (0, TuTienUIService_1.lineageView)(uid, 'lingcan');
            break;
        case 'qiling':
            view = (0, TuTienUIService_1.lineageView)(uid, 'qiling');
            break;
        case 'pet':
            view = (0, TuTienUIService_1.lineageView)(uid, 'pet');
            break;
        case 'mount':
            view = (0, TuTienUIService_1.lineageView)(uid, 'mount');
            break;
        case 'ycanh':
            view = (0, TuTienUIService_1.lineageView)(uid, 'ycanh');
            break;
        case 'daotam':
            view = (0, TuTienUIService_1.lineageView)(uid, 'daotam');
            break;
        case 'tongmon':
            view = (0, TuTienUIService_1.sectView)(uid);
            break;
        case 'sectjoin':
            notice = RuntimeSystemsService_1.sectRuntime.join(uid, extra).message;
            view = (0, TuTienUIService_1.sectView)(uid);
            break;
        case 'sectleave':
            notice = (RuntimeSystemsService_1.sectRuntime.get(uid)?.sect_id?.startsWith('ps:') ? PlayerSectService_1.playerSectService.leave(uid) : RuntimeSystemsService_1.sectRuntime.leave(uid)).message;
            view = (0, TuTienUIService_1.sectView)(uid);
            break;
        case 'sectactivity':
            notice = RuntimeSystemsService_1.sectRuntime.activity(uid).message;
            view = (0, TuTienUIService_1.sectView)(uid);
            break;
        case 'playersectmission':
            notice = `Đã nạp ${PlayerSectService_1.playerSectService.ensureDailyMission(uid).length} nhiệm vụ riêng.`;
            view = (0, TuTienUIService_1.sectView)(uid);
            break;
        case 'ranking':
            view = (0, TuTienUIService_1.rankingView)(uid);
            break;
        case 'lingtian':
            view = (0, TuTienUIService_1.farmView)(uid);
            break;
        case 'farmplant':
            notice = RuntimeSystemsService_1.farmRuntime.plant(uid, Number(extra)).message;
            view = (0, TuTienUIService_1.farmView)(uid);
            break;
        case 'farmharvest':
            notice = RuntimeSystemsService_1.farmRuntime.harvest(uid, Number(extra)).message;
            view = (0, TuTienUIService_1.farmView)(uid);
            break;
        case 'relations':
            view = (0, TuTienUIService_1.relationsView)(uid);
            break;
        case 'asklt':
            view = (0, TuTienUIService_1.askLangTieuView)(uid, extra || 'small_talk');
            break;
        case 'daoluaccept':
            notice = RelationshipRuntimeService_1.relationshipRuntime.acceptPartner(uid, extra).message;
            view = (0, TuTienUIService_1.relationsView)(uid);
            break;
        case 'daoluconfirm':
            notice = RelationshipRuntimeService_1.relationshipRuntime.confirmPartner(uid, extra).message;
            view = (0, TuTienUIService_1.relationsView)(uid);
            break;
        case 'daoludissolve':
            notice = RelationshipRuntimeService_1.relationshipRuntime.dissolve(uid).message;
            view = (0, TuTienUIService_1.relationsView)(uid);
            break;
        case 'songtupropose':
            notice = RelationshipRuntimeService_1.relationshipRuntime.proposeDual(uid, Number(extra)).message;
            view = (0, TuTienUIService_1.relationsView)(uid);
            break;
        case 'songtuconfirm':
            notice = RelationshipRuntimeService_1.relationshipRuntime.confirmDual(uid, extra).message;
            view = (0, TuTienUIService_1.relationsView)(uid);
            break;
        case 'mentorconfirm':
            notice = RelationshipRuntimeService_1.mentorshipRuntime.confirm(uid, extra).message;
            view = (0, TuTienUIService_1.relationsView)(uid);
            break;
        case 'npccompinvite':
            notice = RelationshipRuntimeService_1.npcCompanionRuntime.invite(uid, extra, `free_roam:${uid}:${Date.now()}`).message;
            view = (0, TuTienUIService_1.relationsView)(uid);
            break;
        case 'npccompsettle': {
            const [npc, activity] = extra.split('~');
            notice = RelationshipRuntimeService_1.npcCompanionRuntime.settle(uid, npc, activity, 'Kết thúc chuyến Đồng Hành từ giao diện Duyên Phận.').message;
            view = (0, TuTienUIService_1.relationsView)(uid);
            break;
        }
        case 'journey':
            view = (0, TuTienUIService_1.journeyView)(uid);
            break;
        case 'jstart': {
            const r = JourneyService_1.journeyService.start(uid, extra);
            notice = r.ok ? 'Đã khởi hành Cơ Duyên.' : r.message;
            view = (0, TuTienUIService_1.journeyView)(uid);
            break;
        }
        case 'jpage':
            view = (0, TuTienUIService_1.journeyView)(uid, '', Number(extra) || 0);
            break;
        case 'jchoice': {
            const [jid, choice] = extra.split('~');
            const r = JourneyService_1.journeyService.choose(uid, jid, choice);
            notice = r.message;
            view = (0, TuTienUIService_1.journeyView)(uid);
            break;
        }
        case 'jpause': {
            const r = JourneyService_1.journeyService.pause(uid, extra);
            notice = r.message;
            view = (0, TuTienUIService_1.homeView)(uid);
            break;
        }
        case 'world':
            view = (0, TuTienUIService_1.worldView)(uid);
            break;
        case 'branch':
            view = (0, TuTienUIService_1.branchView)(uid, extra);
            break;
        case 'act': {
            const r = WorldService_1.worldService.act(uid, extra);
            notice = r.message;
            const loc = GameCatalog_1.LOCATIONS.find(x => x.id === extra);
            view = loc ? (0, TuTienUIService_1.branchView)(uid, loc.branch) : (0, TuTienUIService_1.worldView)(uid);
            break;
        }
        case 'craft':
            view = (0, TuTienUIService_1.craftView)(uid);
            break;
        case 'recipes': {
            const [kind, p = '0'] = extra.split(':');
            view = (0, TuTienUIService_1.recipesView)(uid, kind, Number(p) || 0);
            break;
        }
        case 'recipedetail':
            view = (0, TuTienUIService_1.recipeDetailView)(uid, extra);
            break;
        case 'craftdo': {
            const [rid, n = '1'] = extra.split('~'), r = CraftingService_1.craftingService.craftMany(uid, rid, Number(n));
            notice = r.message;
            view = (0, TuTienUIService_1.recipeDetailView)(uid, rid);
            break;
        }
        case 'equip':
            notice = EquipmentService_1.equipmentService.equip(uid, extra).message;
            view = (0, TuTienUIService_1.inventoryView)(uid);
            break;
        case 'use':
            notice = ConsumableService_1.consumableService.use(uid, extra).message;
            view = (0, TuTienUIService_1.inventoryView)(uid);
            break;
        case 'duty':
            view = (0, TuTienUIService_1.dutyView)(uid);
            break;
        case 'dutyclaim2':
            notice = RuntimeSystemsService_1.dutyRuntime.claim(uid, extra).message;
            view = (0, TuTienUIService_1.dutyView)(uid);
            break;
        case 'raredutyresolve':
            notice = ActivityRuntimeService_1.rareDutyRuntime.resolve(uid, extra, `ui:rare:${uid}:${extra}`).message;
            view = (0, TuTienUIService_1.dutyView)(uid);
            break;
        case 'dutyexchange':
            notice = MarketService_1.marketService.exchangeToken(uid, 'tranhai_lenh').message;
            view = (0, TuTienUIService_1.dutyView)(uid);
            break;
        case 'knowledge':
            view = (0, TuTienUIService_1.knowledgeView)(uid);
            break;
        case 'encycat': {
            const [t, p = '0'] = extra.split(':');
            view = (0, TuTienUIService_1.encyListView)(uid, t, Number(p) || 0);
            break;
        }
        case 'ency':
            view = (0, TuTienUIService_1.encyEntryView)(uid, extra);
            break;
        case 'shop':
            view = (0, TuTienUIService_1.shopView)(uid);
            break;
        case 'npcshop':
            view = (0, TuTienUIService_1.npcShopView)(uid);
            break;
        case 'npcbuy':
            notice = MarketService_1.marketService.buyNpc(uid, extra).message;
            view = (0, TuTienUIService_1.npcShopView)(uid);
            break;
        case 'cpltshop':
            view = (0, TuTienUIService_1.cpltShopView)(uid);
            break;
        case 'cpltbuy':
            notice = MarketService_1.marketService.buyCplt(uid, extra).message;
            view = (0, TuTienUIService_1.cpltShopView)(uid);
            break;
        case 'market':
            view = (0, TuTienUIService_1.marketView)(uid);
            break;
        case 'marketbuy':
            notice = MarketService_1.marketService.buy(uid, Number(extra)).message;
            view = (0, TuTienUIService_1.marketView)(uid);
            break;
        case 'marketcancel':
            notice = MarketService_1.marketService.cancel(uid, Number(extra)).message;
            view = (0, TuTienUIService_1.marketView)(uid);
            break;
        case 'auction':
            view = (0, TuTienUIService_1.auctionView)(uid);
            break;
        case 'eventattack':
            notice = WorldEventGameplayService_1.worldEventGameplay.attack(uid).message;
            view = (0, TuTienUIService_1.eventsView)(uid);
            break;
        case 'eventheal':
            notice = WorldEventGameplayService_1.worldEventGameplay.healNpc(uid).message;
            view = (0, TuTienUIService_1.eventsView)(uid);
            break;
        case 'eventbreach':
            notice = WorldEventGameplayService_1.worldEventGameplay.breach(uid, extra).message;
            view = (0, TuTienUIService_1.eventsView)(uid);
            break;
        case 'combat':
            view = (0, TuTienUIService_1.combatView)(uid);
            break;
        case 'combatexchange':
            notice = MarketService_1.marketService.exchangeToken(uid, 'xichduc_lenh').message;
            view = (0, TuTienUIService_1.combatView)(uid);
            break;
        case 'bosses':
            view = (0, TuTienUIService_1.bossesView)(uid);
            break;
        case 'bossattack':
            notice = CombatService_1.combatService.attackBoss(uid, extra).message;
            view = (0, TuTienUIService_1.bossesView)(uid);
            break;
        case 'realms':
            view = (0, TuTienUIService_1.realmsView)(uid);
            break;
        case 'realmenter':
            notice = CombatService_1.combatService.secretRealm(uid, extra).message;
            view = (0, TuTienUIService_1.realmsView)(uid);
            break;
        case 'party':
            view = (0, TuTienUIService_1.partyView)(uid);
            break;
        case 'partycreate':
            notice = DungeonPartyService_1.dungeonPartyService.create(uid, extra).message;
            view = (0, TuTienUIService_1.partyView)(uid);
            break;
        case 'partyjoin':
            notice = DungeonPartyService_1.dungeonPartyService.join(uid, extra).message;
            view = (0, TuTienUIService_1.partyView)(uid);
            break;
        case 'partyready':
            notice = DungeonPartyService_1.dungeonPartyService.ready(uid).message;
            view = (0, TuTienUIService_1.partyView)(uid);
            break;
        case 'partystart':
            notice = DungeonPartyService_1.dungeonPartyService.start(uid).message;
            view = (0, TuTienUIService_1.partyView)(uid);
            break;
        case 'partyroute':
            notice = DungeonPartyService_1.dungeonPartyService.chooseRoute(uid, extra).message;
            view = (0, TuTienUIService_1.partyView)(uid);
            break;
        case 'partysettle':
            notice = DungeonPartyService_1.dungeonPartyService.settleRoom(uid).message;
            view = (0, TuTienUIService_1.partyView)(uid);
            break;
        case 'partyheal': {
            const v = DungeonPartyService_1.dungeonPartyService.view(uid), targets = v?.members.filter((x) => x.hp < x.max_hp).map((x) => x.user_id) || [];
            notice = DungeonPartyService_1.dungeonPartyService.healAtCheckpoint(uid, targets).message;
            view = (0, TuTienUIService_1.partyView)(uid);
            break;
        }
        case 'events':
            view = (0, TuTienUIService_1.eventsView)(uid);
            break;
        case 'anomalyact':
            notice = ActivityRuntimeService_1.anomalyRuntime.act(uid, extra).message;
            view = (0, TuTienUIService_1.eventsView)(uid);
            break;
        case 'compfeed':
            notice = RuntimeSystemsService_1.companionRuntime.feed(uid, Number(extra)).message;
            view = (0, TuTienUIService_1.dongPhuView)(uid);
            break;
        case 'compadvance':
            notice = RuntimeSystemsService_1.companionRuntime.advance(uid, Number(extra)).message;
            view = (0, TuTienUIService_1.dongPhuView)(uid);
            break;
        case 'compequip':
            notice = RuntimeSystemsService_1.companionRuntime.equip(uid, Number(extra)).message;
            view = (0, TuTienUIService_1.dongPhuView)(uid);
            break;
        case 'qilinurture':
            notice = RuntimeSystemsService_1.qilingRuntime.nurture(uid, extra).message;
            view = (0, TuTienUIService_1.lineageView)(uid, 'qiling');
            break;
        case 'intentpractice': {
            const [k, s] = extra.split('~');
            notice = RuntimeSystemsService_1.intentRuntime.practice(uid, k, s).message;
            view = (0, TuTienUIService_1.lineageView)(uid, k === 'Y_CANH' ? 'ycanh' : 'daotam');
            break;
        }
        case 'pvp':
            view = (0, TuTienUIService_1.pvpView)(uid);
            break;
        case 'tower':
            view = (0, TuTienUIService_1.towerView)(uid);
            break;
        case 'towerstart':
            notice = TowerService_1.towerService.start(uid).message;
            view = (0, TuTienUIService_1.towerView)(uid);
            break;
        case 'towerchallenge':
            notice = TowerService_1.towerService.challenge(uid).message;
            view = (0, TuTienUIService_1.towerView)(uid);
            break;
        case 'ownerpanel':
            if (!(0, permissions_1.isBotOwner)(uid))
                throw new Error('OWNER_ONLY');
            view = (0, OwnerUIService_1.ownerView)(uid);
            break;
        case 'ownerannounce':
            if (!(0, permissions_1.isBotOwner)(uid))
                throw new Error('OWNER_ONLY');
            view = (0, OwnerUIService_1.ownerView)(uid, 'announce');
            break;
        case 'ownertest':
            if (!(0, permissions_1.isBotOwner)(uid))
                throw new Error('OWNER_ONLY');
            notice = OwnerControlService_1.ownerControlService.bindTest(uid).message;
            view = (0, OwnerUIService_1.ownerView)(uid);
            break;
        case 'ownerplayers':
            if (!(0, permissions_1.isBotOwner)(uid))
                throw new Error('OWNER_ONLY');
            view = (0, OwnerUIService_1.ownerView)(uid, 'players');
            break;
        case 'ownerplayerconfirm': {
            if (!(0, permissions_1.isBotOwner)(uid))
                throw new Error('OWNER_ONLY');
            const [mid, nonce] = extra.split('~'), r = OwnerAdvancedService_1.ownerAdvancedService.confirmPlayer(uid, mid, nonce);
            notice = r.message;
            view = (0, OwnerUIService_1.ownerView)(uid, 'players');
            break;
        }
        case 'ownerassets':
            if (!(0, permissions_1.isBotOwner)(uid))
                throw new Error('OWNER_ONLY');
            view = (0, OwnerUIService_1.ownerView)(uid, 'assets');
            break;
        case 'ownerworld':
            if (!(0, permissions_1.isBotOwner)(uid))
                throw new Error('OWNER_ONLY');
            view = (0, OwnerUIService_1.ownerView)(uid, 'world');
            break;
        case 'ownerresetpreview': {
            if (!(0, permissions_1.isBotOwner)(uid))
                throw new Error('OWNER_ONLY');
            const r = await OwnerControlService_1.ownerControlService.previewReset(uid);
            if (r.ok)
                view = (0, OwnerUIService_1.ownerResetConfirmView)(uid, r);
            else {
                notice = r.message;
                view = (0, OwnerUIService_1.ownerView)(uid, 'world');
            }
            break;
        }
        case 'ownerresetconfirm': {
            if (!(0, permissions_1.isBotOwner)(uid))
                throw new Error('OWNER_ONLY');
            const [job, nonce] = extra.split('~'), r = OwnerControlService_1.ownerControlService.confirmReset(uid, job, nonce);
            notice = r.message;
            view = (0, OwnerUIService_1.ownerView)(uid);
            break;
        }
        case 'ownercontent':
            if (!(0, permissions_1.isBotOwner)(uid))
                throw new Error('OWNER_ONLY');
            view = (0, OwnerUIService_1.ownerView)(uid, 'content');
            break;
        case 'ownersystem':
            if (!(0, permissions_1.isBotOwner)(uid))
                throw new Error('OWNER_ONLY');
            view = (0, OwnerUIService_1.ownerView)(uid, 'system');
            break;
        case 'ownersystemstatus': {
            if (!(0, permissions_1.isBotOwner)(uid))
                throw new Error('OWNER_ONLY');
            const s = OwnerAdvancedService_1.ownerAdvancedService.status();
            notice = `Epoch ${s.epoch} · maintenance ${s.maintenance ? 'ON' : 'OFF'} · ${s.users} users · ${s.events} active events · ${s.tables} tables`;
            view = (0, OwnerUIService_1.ownerView)(uid, 'system');
            break;
        }
        case 'ownersnapshot': {
            if (!(0, permissions_1.isBotOwner)(uid))
                throw new Error('OWNER_ONLY');
            notice = (await OwnerAdvancedService_1.ownerAdvancedService.snapshot(uid)).message;
            view = (0, OwnerUIService_1.ownerView)(uid, 'system');
            break;
        }
        case 'ownertick':
            if (!(0, permissions_1.isBotOwner)(uid))
                throw new Error('OWNER_ONLY');
            notice = `Đã chạy scheduler; mở ${RuntimeSystemsService_1.eventRuntime.tick().join(', ') || '0'} hoạt động mới.`;
            view = (0, OwnerUIService_1.ownerView)(uid);
            break;
        case 'owneraudit':
            if (!(0, permissions_1.isBotOwner)(uid))
                throw new Error('OWNER_ONLY');
            notice = 'Nhật ký quản trị nằm trong admin_audit.';
            view = (0, OwnerUIService_1.ownerView)(uid);
            break;
        default: throw new Error(`UNHANDLED_UI_ACTION:${action}`);
    }
    await (0, ui_1.safeUpdate)(i, view);
    if (notice)
        await i.followUp({ content: notice, flags: discord_js_1.MessageFlags.Ephemeral });
}
function interactionKey(i) { if (i.isChatInputCommand?.())
    return `command:${i.commandName}`; if (i.customId) {
    const raw = String(i.customId), split = raw.lastIndexOf('_');
    return `component:${raw.slice(0, split < 0 ? 100 : split).slice(0, 100)}`;
} return `interaction:${i.type ?? 'unknown'}`; }
function discordErrorCode(error) { return Number(error?.code ?? error?.rawError?.code ?? error?.cause?.code ?? 0); }
function expiredInteraction(error) { const code = discordErrorCode(error), message = String(error?.message ?? ''); return code === 10062 || code === 40060 || /Unknown interaction|already been acknowledged/i.test(message); }
async function respond(i, content) { const payload = { content, flags: discord_js_1.MessageFlags.Ephemeral }; if (i.replied || i.deferred)
    await i.followUp(payload);
else
    await i.reply(payload); }
async function onInteraction(client, i) {
    const interactionId = String(i.id || ''), userId = String(i.user?.id || ''), actionKey = interactionKey(i);
    let received = false;
    try {
        if (userId && !OperationalHardeningService_1.operationalHardeningService.allow(userId, actionKey)) {
            await respond(i, 'Thao tác quá nhanh. Hãy chờ một nhịp rồi thử lại.');
            return;
        }
        if (interactionId && userId) {
            received = OperationalHardeningService_1.operationalHardeningService.beginInteraction(interactionId, userId, actionKey);
            if (!received) {
                await respond(i, 'Thao tác này đã được tiếp nhận; không thực hiện lần thứ hai.');
                return;
            }
        }
        await dispatchInteraction(client, i);
        if (received)
            OperationalHardeningService_1.operationalHardeningService.completeInteraction(interactionId);
    }
    catch (error) {
        if (received)
            OperationalHardeningService_1.operationalHardeningService.failInteraction(interactionId, error);
        const ownerDenied = error instanceof Error && error.message === 'OWNER_ONLY';
        if (expiredInteraction(error)) {
            console.warn('[interaction-expired]', { interactionId, actionKey, user: userId });
            return;
        }
        if (!ownerDenied)
            console.error('[interaction-error]', { kind: i.type, customId: i.customId, command: i.commandName, user: userId, error });
        try {
            await respond(i, ownerDenied ? 'Thiên Thư không nhận chủ.' : 'Thao tác gặp lỗi hiển thị. Hãy mở lại giao diện và kiểm tra trạng thái trước khi thử lại.');
        }
        catch (replyError) {
            if (!expiredInteraction(replyError))
                console.error('[interaction-error-response-failed]', replyError);
        }
    }
}
