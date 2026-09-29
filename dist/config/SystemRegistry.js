"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FEATURES = exports.UI_ACTIONS = void 0;
exports.auditSystemAccess = auditSystemAccess;
exports.UI_ACTIONS = [
    'home', 'profile', 'system', 'appearanceavatar', 'appearancethumb', 'appearancereset', 'inventory', 'storage', 'bagcrafts', 'baglearn', 'bagcraft', 'bagswitch', 'temporary', 'tempclaim', 'tempvault', 'vault', 'vaultclaim', 'instances', 'instsell', 'instequip', 'instrepair', 'instclaim', 'instvault', 'wardrestore', 'heirloom', 'heirloomidentify', 'cultivation', 'meditate', 'breakthrough', 'world', 'branch', 'act', 'craft', 'recipes', 'recipedetail', 'craftdo', 'equip', 'use', 'duty', 'dutyexchange',
    'knowledge', 'encycat', 'ency', 'shop', 'npcshop', 'npcbuy', 'cpltshop', 'cpltbuy', 'market', 'marketsell', 'marketbuy', 'marketcancel', 'auction', 'auctioncreate', 'auctionbid', 'combat', 'combatexchange', 'bosses', 'bossattack', 'realms', 'realmenter', 'pvp', 'pvpselect',
    'relations', 'asklt', 'journey', 'jstart', 'jpage', 'jchoice', 'jpause',
    'dongphu', 'tongmon', 'sectjoin', 'sectleave', 'sectactivity', 'ranking', 'lingtian', 'farmplant', 'farmharvest', 'dutyclaim2', 'party', 'partycreate', 'partyjoin', 'partyready', 'partystart', 'partyheal', 'events', 'eventattack', 'eventheal', 'eventbreach', 'compfeed', 'compadvance', 'compequip', 'qilinurture', 'intentpractice', 'lingcan', 'qiling', 'pet', 'mount', 'ycanh', 'daotam', 'ownerpanel', 'ownerhighconfirm', 'ownerplayers', 'ownerplayerform', 'ownerplayerconfirm', 'ownerassets', 'ownerassetform', 'owneritemform', 'ownerworld', 'ownerresetpreview', 'ownerresetconfirm', 'ownercontent', 'ownercontentform', 'ownerannounce', 'ownerannounceform', 'ownertest', 'ownersystem', 'ownersystemstatus', 'ownersnapshot', 'ownerrepairform', 'ownertick', 'owneraudit',
    'sectcreateform', 'playersectmission', 'partyinvite_select', 'partyroute', 'partysettle', 'daoluproposeselect', 'daoluaccept', 'daoluconfirm', 'daoludissolve', 'songtupropose', 'songtuconfirm', 'mentorproposeselect', 'mentorconfirm', 'npccompinvite', 'npccompsettle', 'raredutyresolve', 'anomalyact', 'tower', 'towerstart', 'towerchallenge',
    'langtieuvisit', 'langtieuvisitchoice', 'langtieuvisitclose'
];
exports.FEATURES = [
    { id: 'cultivation', name: 'Tu Luyện', route: 'cultivation' }, { id: 'world', name: 'Thiên Mang Sơn Hạ', route: 'world' }, { id: 'duty', name: 'Trấn Hải Các', route: 'duty' },
    { id: 'shop', name: 'Nhất Phẩm Các', route: 'shop' }, { id: 'market', name: 'Kim Vân Đài', route: 'market' }, { id: 'knowledge', name: 'Tử Hà Các', route: 'knowledge' },
    { id: 'combat', name: 'Xích Dực Các', route: 'combat' }, { id: 'boss', name: 'Cường Địch', route: 'bosses' }, { id: 'secret_realm', name: 'Bí Cảnh', route: 'realms' },
    { id: 'pvp', name: 'Luận Võ', route: 'pvp' }, { id: 'craft', name: 'Bách Nghệ', route: 'craft' }, { id: 'inventory', name: 'Túi Càn Khôn', route: 'inventory' }, { id: 'profile', name: 'Hồ Sơ', route: 'profile' },
    { id: 'journey', name: 'Cơ Duyên', route: 'journey' }, { id: 'sect', name: 'Tông Môn', route: 'tongmon' }, { id: 'relations', name: 'Duyên Phận', route: 'relations' }, { id: 'tower', name: 'Vấn Chiến Tháp', route: 'tower' }, { id: 'ranking', name: 'Bảng Phong Thần', route: 'ranking' }, { id: 'farm', name: 'Linh Điền', route: 'lingtian' }, { id: 'pets', name: 'Linh Thú', route: 'pet' }, { id: 'mounts', name: 'Toạ Kỵ', route: 'mount' }, { id: 'spirit', name: 'Khí Linh', route: 'qiling' }, { id: 'events', name: 'World Event', route: 'events' }
];
function auditSystemAccess() { const set = new Set(exports.UI_ACTIONS); return exports.FEATURES.filter(f => !set.has(f.route)).map(f => `${f.name}: không có nút/lối vào ${f.route}`); }
