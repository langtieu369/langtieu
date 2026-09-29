"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dbPath = path_1.default.join(process.cwd(), 'data', 'discord-interaction-harness.sqlite');
for (const f of [dbPath, dbPath + '-wal', dbPath + '-shm'])
    try {
        fs_1.default.unlinkSync(f);
    }
    catch { }
process.env.DB_PATH = dbPath;
const { initDatabase } = require('./database/database'), db = require('./database/database').default;
const { userRepository } = require('./database/repositories/UserRepository');
const { UI_ACTIONS } = require('./config/SystemRegistry');
const { ITEMS, LOCATIONS, RECIPES, SECRET_REALMS, BOSSES } = require('./config/GameCatalog');
const { onInteraction } = require('./events/interactionCreate');
const TaoNhanVat = require('./commands/general/taonhanvat').default, Tutien = require('./commands/general/tutien').default, ThienThu = require('./commands/general/thienthu').default;
const { BOT_OWNER_ID } = require('./config/permissions');
function ok(v, m) { if (!v)
    throw new Error(m); }
initDatabase();
const handler = fs_1.default.readFileSync(path_1.default.join(process.cwd(), 'src', 'events', 'interactionCreate.ts'), 'utf8');
const handled = new Set();
for (const m of handler.matchAll(/case'([^']+)'/g))
    handled.add(m[1]);
for (const m of handler.matchAll(/action==='([^']+)'/g))
    handled.add(m[1]);
for (const x of ['pvpselect', 'partyinvite_select', 'daoluproposeselect', 'mentorproposeselect'])
    handled.add(x);
const missing = UI_ACTIONS.filter(x => !handled.has(x)), unregistered = [...handled].filter(x => !UI_ACTIONS.includes(x));
ok(!missing.length, `Registry có action không được dispatch: ${missing.join(', ')}`);
ok(!unregistered.length, `Handler có action chưa đăng ký: ${unregistered.join(', ')}`);
ok(new Set(UI_ACTIONS).size === UI_ACTIONS.length, 'UI_ACTIONS bị trùng');
const extra = { branch: 'mining', act: LOCATIONS[0].id, recipes: 'alchemy:0', recipedetail: RECIPES[0].id, craftdo: `${RECIPES[0].id}~1`, equip: 'weapon_0', use: 'pill_0', encycat: 'item:0', ency: Object.keys(ITEMS)[0], npcbuy: Object.keys(ITEMS)[0], cpltbuy: 'none', marketbuy: '999999', marketcancel: '999999', auctioncreate: 'missing-instance', auctionbid: '999999~1', bossattack: BOSSES[0].id, realmenter: SECRET_REALMS[0].id, sectjoin: 'hoa_chan', farmplant: '1', farmharvest: '1', dutyclaim2: 'missing', raredutyresolve: 'missing', eventbreach: 'TRAN_AP', compfeed: '999999', compadvance: '999999', compequip: '999999', qilinurture: 'missing', intentpractice: 'Y_CANH~kiem_y', partycreate: SECRET_REALMS[0].id, partyjoin: 'missing', partyroute: 'THAN_TRONG', anomalyact: 'missing', jstart: 'missing', jpage: '0', jchoice: 'missing~OBSERVE', jpause: 'missing', asklt: 'small_talk', songtupropose: '30', daoluaccept: 'missing', daoluconfirm: 'missing', songtuconfirm: 'missing', mentorconfirm: 'missing', npccompinvite: 'lang_tieu', npccompsettle: 'lang_tieu~missing', langtieuvisit: 'missing', langtieuvisitchoice: 'missing~ASK', langtieuvisitclose: 'missing', baglearn: 'storage_bag_2', bagcraft: 'storage_bag_2', bagswitch: '9999', tempclaim: 'missing', tempvault: 'missing', vaultclaim: 'missing', instsell: 'missing', instequip: 'missing', instrepair: 'missing', instclaim: 'missing', instvault: 'missing', wardrestore: 'missing', heirloomidentify: 'missing', partyinvite_select: '', pvpselect: '', daoluproposeselect: '', mentorproposeselect: '', ownerannounceform: 'tranhai', ownerassetform: 'GRANT~LT', owneritemform: 'GRANT', ownerplayerform: 'SET_TUVI', ownercontentform: 'DRAFT', ownerhighconfirm: 'missing~bad', ownerplayerconfirm: 'missing~bad', ownerresetconfirm: 'missing~bad' };
const selectActions = new Set(['pvpselect', 'partyinvite_select', 'daoluproposeselect', 'mentorproposeselect']);
const modalActions = new Set(['marketsell', 'instsell', 'auctioncreate', 'auctionbid', 'appearanceavatar', 'appearancethumb', 'sectcreateform', 'ownerannounceform', 'ownerassetform', 'owneritemform', 'ownerplayerform', 'ownercontentform', 'ownerrepairform']);
const safeOwner = new Set(['ownerpanel', 'ownerannounce', 'ownerplayers', 'ownerassets', 'ownerworld', 'ownercontent', 'ownersystem', 'ownersystemstatus', 'owneraudit', ...modalActions].filter(x => x.startsWith('owner')));
function seed(uid) { userRepository.create(uid, uid); db.prepare('UPDATE users SET level=300,tu_vi=999999,exp_needed=1,hp=5000,max_hp=5000,mp=500,max_mp=500,atk=500,def=300,speed=200,stamina=500,coin_ha_pham=1000000,knb=10000 WHERE discord_id=?').run(uid); db.prepare("INSERT OR IGNORE INTO player_credentials(user_id,credential_id,state,source_ref,granted_at) VALUES(?,'THAT_MON_BAI_THIEP','ACTIVE','HARNESS',?)").run(uid, Date.now()); }
seed(BOT_OWNER_ID);
function mock(customId, userId, kind = 'button') {
    const calls = [];
    const i = { id: `ix-${Math.random()}`, token: 'token', customId, user: { id: userId }, type: 3, replied: false, deferred: false, values: ['missing'], client: { rest: { post: async (_route, payload) => { calls.push(['update', payload]); i.replied = true; } } }, isChatInputCommand: () => false, isModalSubmit: () => false, isUserSelectMenu: () => kind === 'select', isButton: () => kind === 'button', reply: async (x) => { calls.push(['reply', x]); i.replied = true; }, followUp: async (x) => { calls.push(['followUp', x]); }, showModal: async (x) => { calls.push(['modal', x.toJSON()]); i.replied = true; } };
    return { i, calls };
}
function validateJson(x, where) { const walk = (v) => { if (!v || typeof v !== 'object')
    return; if (typeof v.custom_id === 'string') {
    ok(v.custom_id.length >= 1 && v.custom_id.length <= 100, `${where}: custom_id ${v.custom_id.length}/100`);
    if (v.custom_id.startsWith('tt') && !v.custom_id.includes('modal')) {
        const left = v.custom_id.slice(2, v.custom_id.lastIndexOf('_')), action = left.split(':')[0];
        ok(UI_ACTIONS.includes(action), `${where}: component sinh action chưa đăng ký ${action}`);
    }
} if (typeof v.label === 'string')
    ok(v.label.length <= 80, `${where}: label ${v.label.length}/80`); if (Array.isArray(v.components) && v.type === 1)
    ok(v.components.length <= 5, `${where}: action row vượt 5 component`); for (const z of Object.values(v))
    if (Array.isArray(z))
        z.forEach(walk);
    else
        walk(z); }; walk(x); }
async function slash(command, userId, values = {}) { const calls = []; const i = { commandName: command.data.name, user: { id: userId, displayAvatarURL: () => `https://example.com/${userId}.png` }, deferred: false, replied: false, options: { getString: (name, required) => values[name] ?? (required ? (() => { throw new Error(`missing ${name}`); })() : null) }, deferReply: async () => { i.deferred = true; }, editReply: async (x) => { calls.push(x); i.replied = true; } }; await onInteraction({ commands: new Map([[command.data.name, command]]) }, { ...i, isChatInputCommand: () => true, isModalSubmit: () => false, isUserSelectMenu: () => false, isButton: () => false }); return calls; }
async function main() {
    const createUid = 'slash-create';
    const createCommand = new TaoNhanVat();
    const createJson = createCommand.data.toJSON();
    ok(!createJson.options?.length, '/taonhanvat phải là zero-option command');
    seed(createUid);
    ok((await slash(new Tutien(), createUid)).length === 1, '/tutien không render');
    ok((await slash(new ThienThu(), BOT_OWNER_ID)).length === 1, '/thienthu Owner không render');
    const denied = await slash(new ThienThu(), createUid);
    ok(String(denied[0]).includes('không nhận chủ'), '/thienthu không chặn non-owner');
    let executed = 0, modals = 0, ownerDenied = 0;
    for (const action of UI_ACTIONS) {
        const isOwner = action.startsWith('owner'), uid = isOwner ? (safeOwner.has(action) ? BOT_OWNER_ID : `intruder-${action}`) : `u-${action}`;
        if (!userRepository.get(uid))
            seed(uid);
        const cid = `tt${action}${extra[action] !== undefined ? `:${extra[action]}` : ''}_${uid}`;
        ok(cid.length <= 100, `${action}: sample custom id vượt 100`);
        const { i, calls } = mock(cid, uid, selectActions.has(action) ? 'select' : 'button');
        await onInteraction({ commands: new Map() }, i);
        ok(calls.length > 0, `${action}: không phản hồi`);
        for (const [kind, payload] of calls) {
            if (payload?.body)
                validateJson(payload.body, action);
            if (kind === 'modal')
                validateJson(payload, action);
        }
        if (modalActions.has(action) && !isOwner) {
            ok(calls.some(x => x[0] === 'modal'), `${action}: modal không mở`);
            modals++;
        }
        if (isOwner && !safeOwner.has(action)) {
            ok(calls.some(x => JSON.stringify(x).includes('không nhận chủ')), `${action}: non-owner không bị chặn`);
            ownerDenied++;
        }
        executed++;
    }
    const wrong = mock('tthome_owner-a', 'owner-b');
    seed('owner-a');
    seed('owner-b');
    await onInteraction({ commands: new Map() }, wrong.i);
    ok(JSON.stringify(wrong.calls).includes('không phải ngọc giản'), 'UI ownership không chặn người khác');
    const stale = mock('ttremovedaction_owner-a', 'owner-a');
    await onInteraction({ commands: new Map() }, stale.i);
    ok(JSON.stringify(stale.calls).includes('không còn hiệu lực'), 'stale custom ID không được từ chối rõ ràng');
    console.log(`✅ Discord Interaction Harness: 3/3 slash · ${executed}/${UI_ACTIONS.length} actions · ${modals} player modals · ${ownerDenied} owner mutation gates · ownership/stale/custom-id/component limits PASS`);
}
main().catch(e => { console.error(e); process.exit(1); });
