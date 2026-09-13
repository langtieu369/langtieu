export const UI_ACTIONS=[
 'home','profile','inventory','cultivation','meditate','world','branch','act','craft','recipes','craftdo','equip','use','duty','dutyclaim','dutyexchange',
 'knowledge','encycat','ency','shop','npcshop','npcbuy','cpltshop','cpltbuy','market','marketsell','marketbuy','marketcancel','combat','combatexchange','bosses','bossattack','realms','realmenter','pvp','pvpselect'
] as const;
export const FEATURES=[
 {id:'cultivation',name:'Tu Luyện',route:'cultivation'},{id:'world',name:'Thiên Mang Sơn Hạ',route:'world'},{id:'duty',name:'Trấn Hải Các',route:'duty'},
 {id:'shop',name:'Nhất Phẩm Các',route:'shop'},{id:'market',name:'Kim Vân Đài',route:'market'},{id:'knowledge',name:'Tử Hà Các',route:'knowledge'},
 {id:'combat',name:'Xích Dực Các',route:'combat'},{id:'boss',name:'Cường Địch',route:'bosses'},{id:'secret_realm',name:'Bí Cảnh',route:'realms'},
 {id:'pvp',name:'Luận Võ',route:'pvp'},{id:'craft',name:'Bách Nghệ',route:'craft'},{id:'inventory',name:'Linh Nang',route:'inventory'},{id:'profile',name:'Hồ Sơ',route:'profile'}
] as const;
export function auditSystemAccess(){const set=new Set<string>(UI_ACTIONS);return FEATURES.filter(f=>!set.has(f.route)).map(f=>`${f.name}: không có nút/lối vào ${f.route}`)}
