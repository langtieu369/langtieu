"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.realmNpcVisitService = exports.REALM_NPC_VISITS = void 0;
const database_1 = __importDefault(require("../database/database"));
const DialogueService_1 = require("./DialogueService");
exports.REALM_NPC_VISITS = [
    { id: 'CD.ONBOARDING.THAT_MON_BAI_THIEP.V1', realmRank: -1, title: 'Thất Môn Bái Thiếp', credentialId: 'THAT_MON_BAI_THIEP',
        opening: 'Vừa trở về Động Phủ, ngươi đã nhận ra bên ngoài có người đang đợi. Lăng Tiêu đứng trước hiên, trong tay cầm một xấp thiếp mỏng. Thấy ngươi, cậu khẽ nâng chúng lên.\n\n“Về rồi à?”\n\n“Ta có thứ tiện đường mang cho ngươi.”\n\nCậu đưa xấp thiếp sang. “Bái Thiếp. Ngươi đã đi lại trong Thiên Hạ một đoạn rồi. Nếu sau này muốn tìm một nơi bái nhập, ít nhất cũng nên biết mình có thể đi đâu.”',
        actions: [
            { id: 'ASK_SEVEN_SECTS', label: 'Thất Đại là gì?', response: '“Trong những truyền thừa hiện còn trên đời, Thất Đại là bảy tông môn người tu hành thường nghe đến nhất: Vạn Linh Tự, Hoa Chân, Phù Đồ Cung, Diễm Linh Cốc, Bất Vu Sơn, Huyền Nguyên và Ma Kiếm Tông.” Lăng Tiêu đặt xấp thiếp xuống. “Thiếp chỉ giúp ngươi tìm đến đúng cửa. Có được nhận hay không, vẫn phải theo luật của từng môn.”' },
            { id: 'ASK_RECOMMENDATION', label: 'Ngươi muốn ta chọn một nơi?', response: '“Ta chọn thay ngươi làm gì?” Lăng Tiêu hỏi lại rất tự nhiên. “Pháp họ truyền, việc họ làm, người họ nhận — tự xem cho kỹ. Thấy nơi nào hợp thì hỏi nơi đó.” Cậu ngừng một chút. “Không muốn vào cũng chẳng sao.”' },
            { id: 'ASK_HUA_ZHEN', label: 'Vậy ta vào Hoa Chân cùng ngươi?', response: '“Muốn vào thì cứ xem cho kỹ trước đã.” Lăng Tiêu không tỏ vẻ vui hay phản đối. “Đừng vì ta ở đó mà chọn. Người phải tu pháp của họ về sau là ngươi, đâu phải ta.”' },
            { id: 'KEEP_FOR_LATER', label: 'Ta để sau rồi xem', response: '“Không vội.” Lăng Tiêu đẩy xấp thiếp về phía ngươi. “Thiếp cứ giữ lấy. Khi nào muốn xem thì xem.”' }
        ],
        closing: 'Trước khi rời đi, Lăng Tiêu chỉ vào xấp thiếp trên bàn. “Nó không phải thư bảo lãnh của ta. Cầm nó tới sơn môn, ngươi vẫn phải tự trả lời điều họ muốn hỏi.” Cậu nghĩ một chút rồi nói thêm: “Như vậy mới phải.”',
        memoryKey: 'lang_tieu_that_mon_bai_thiep', fact: 'that_mon_bai_thiep_received', log: 'Sau những ngày đầu bước vào Thiên Hạ, Lăng Tiêu từng tới Động Phủ và mang cho ngươi một bộ Bái Thiếp của Thất Đại.' },
    { id: 'LT-REALM-HOP-THE-01', realmRank: 6, title: 'Ngoài Hiên Có Người',
        opening: 'Khi ngươi mở cửa, Lăng Tiêu đang ngồi trên bậc đá ngoài hiên, một tay chống cằm, tay kia giữ chén trà đã tự rót từ lúc nào. Thấy ngươi nhìn sang, cậu nâng chén lên thay lời chào.\n\n“Khí tức đã liền thành một mạch rồi. Ta đứng ngoài một lúc, không nghe động tĩnh gì đáng ngại nên vào đây ngồi trước.”\n\nCậu nhìn quanh động phủ, rồi bổ sung rất tự nhiên: “Ấm trà của ngươi nguội nhanh thật.”',
        actions: [
            { id: 'ASK_REASON', label: 'Ngươi tới chỉ để xem ta?', response: '“Ừ. Cũng không hẳn chỉ để xem.” Lăng Tiêu đặt chén xuống. “Người mới vào Hợp Thể thường quen điều động linh khí như trước, đến lúc thu tay mới nhận ra mọi thứ đã theo mình đi xa quá. Ta muốn biết ngươi có còn nhớ cách dừng hay không.” Cậu nhìn ngươi một lượt rồi cười. “Xem ra vẫn nhớ. Vậy ta đỡ phải ngồi đây nói chuyện nghiêm túc.”' },
            { id: 'OFFER_TEA', label: 'Ngồi xuống, ta pha ấm khác', response: 'Lăng Tiêu nhích sang chừa chỗ, hoàn toàn không có ý khách sáo. “Được. Nhưng để ta pha. Ngươi vừa Hợp Thể, đừng dùng đạo lực hâm trà rồi làm nứt luôn cái bàn.” Cậu nói xong mới liếc chiếc bàn một cái. “Ta không chắc nó chịu nổi ngươi bây giờ đâu.”' },
            { id: 'ADMIT_UNSTEADY', label: 'Ta vẫn chưa quen cảnh giới này', response: '“Không quen mới đúng.” Lăng Tiêu đáp ngay, không hề tỏ vẻ ngạc nhiên. “Nếu vừa bước qua đã thấy mọi thứ thuận tay, ta mới phải xem lại ngươi có bỏ quên phần nào phía sau không.” Cậu gõ nhẹ ngón tay lên thành chén. “Cứ dùng chậm hơn một nhịp. Cảnh giới là của ngươi rồi, không ai giành mất.”' }
        ],
        closing: 'Trước khi rời đi, Lăng Tiêu đứng ngoài sân nhìn lại một lần. “Lần sau gặp, nếu ngươi lỡ tay làm bay mái động phủ, ta sẽ gọi Trường Minh tới kéo nó về. Hắn từng nhận việc ấy rồi.” Nói xong, cậu phất tay, ung dung xuống núi.',
        memoryKey: 'lang_tieu_visit_hop_the', fact: 'lang_tieu_witnessed_hop_the', log: 'Ngày đầu sau khi bước vào Hợp Thể, Lăng Tiêu đã tới Động Phủ. Hai người không luận đại đạo; chỉ ngồi bên một ấm trà nguội và nói về việc biết dừng đúng lúc.' },
    { id: 'LT-REALM-DO-KIEP-01', realmRank: 8, title: 'Trước Khi Mây Kiếp Tới',
        opening: 'Lăng Tiêu đến vào một ngày trời rất trong. Cậu không mang lễ vật, cũng không hỏi khi nào ngươi định dẫn kiếp. Chỉ tới khi hai người đã đi hết một vòng quanh động phủ, cậu mới ngẩng nhìn khoảng trời phía trên.\n\n“Độ Kiếp rồi.”\n\nGiọng cậu không nặng nề. Cậu cúi xuống nhặt một nhánh cây chắn lối, tiện tay đặt sang bên. “Từ giờ người tới tìm ngươi sẽ hay nói chuyện sống chết, thiên mệnh, thành tiên. Nghe nhiều sẽ mệt. Cho nên hôm nay ta không nói mấy chuyện ấy.”',
        actions: [
            { id: 'ASK_FEAR', label: 'Ngươi không hỏi ta có sợ sao?', response: 'Lăng Tiêu nghiêng đầu nhìn ngươi. “Ngươi sợ thì cứ sợ. Kiếp lôi đâu có nhẹ hơn chỉ vì ngươi giả vờ bình thản.” Cậu bước thêm vài bước rồi nói tiếp: “Đến lúc cần người đứng ngoài trận, báo ta một tiếng. Ta không thay ngươi chịu kiếp, nhưng ít nhất có thể giữ cho kẻ khác đừng chạy vào làm rối.”' },
            { id: 'ASK_PURPOSE', label: 'Vậy hôm nay ngươi tới làm gì?', response: '“Tới xem ngươi vẫn còn là ngươi không.” Lăng Tiêu đáp, như thể đó là việc hiển nhiên. “Cảnh giới cao thêm, người quanh mình dễ đổi cách nói chuyện. Nếu ai cũng nhìn ngươi như một trận thiên kiếp sắp rơi, lâu dần rất phiền.” Cậu khẽ cười. “Ta tới trước để giành phần nói chuyện bình thường.”' },
            { id: 'WALK_SILENTLY', label: 'Vậy cùng đi thêm một vòng', response: '“Được.” Lăng Tiêu không hỏi thêm. Hai người đi chậm quanh động phủ, lúc dừng sửa một viên đá lệch, lúc tránh một nhánh cây thấp. Mây trên trời vẫn trôi như mọi ngày. Gần hết vòng, cậu mới nói: “Sau này nếu ngươi thành tiên, con đường này chắc vẫn phải tự quét thôi.”' }
        ],
        closing: 'Ra tới cổng, Lăng Tiêu quay lại: “Ta nói không bàn chuyện Độ Kiếp, nhưng vẫn phải dặn một câu. Đến ngày ấy, đừng biến mất không báo ai.” Cậu ngừng một chút rồi nói tiếp, giọng vẫn nhẹ như thường. “Không phải để người khác ngăn ngươi. Chỉ để những người muốn chờ biết nên đứng ở đâu.”',
        memoryKey: 'lang_tieu_visit_do_kiep', fact: 'lang_tieu_witnessed_do_kiep', log: 'Khi ngươi bước vào Độ Kiếp, Lăng Tiêu đã tới Động Phủ vào một ngày trời trong. Cậu không nói chuyện thiên mệnh, chỉ dặn rằng đến ngày dẫn kiếp, đừng biến mất mà không báo cho những người muốn chờ.' }
];
const definition = (id) => exports.REALM_NPC_VISITS.find(x => x.id === id);
exports.realmNpcVisitService = {
    onRealmReached(uid, rank) { const d = exports.REALM_NPC_VISITS.find(x => x.realmRank === rank); if (!d)
        return null; database_1.default.prepare("INSERT OR IGNORE INTO realm_npc_visits(user_id,visit_id,npc_id,realm_rank,state,current_node,triggered_at) VALUES(?,?,? ,?,'WAITING_RETURN','OPENING',?)").run(uid, d.id, 'lang_tieu', rank, Date.now()); return d.id; },
    ensureOnboarding(uid) { const eligible = database_1.default.prepare("SELECT 1 FROM onboarding_milestones WHERE user_id=? AND milestone='SO_NHAP_COMPLETED'").get(uid), member = database_1.default.prepare('SELECT 1 FROM sect_memberships WHERE user_id=?').get(uid), done = database_1.default.prepare("SELECT 1 FROM realm_npc_visits WHERE user_id=? AND visit_id='CD.ONBOARDING.THAT_MON_BAI_THIEP.V1'").get(uid); if (eligible && !member && !done)
        database_1.default.prepare("INSERT INTO realm_npc_visits(user_id,visit_id,npc_id,realm_rank,state,current_node,triggered_at,armed_at) VALUES(?,?,?,-1,'AVAILABLE','OPENING',?,?)").run(uid, 'CD.ONBOARDING.THAT_MON_BAI_THIEP.V1', 'lang_tieu', Date.now(), Date.now()); },
    enterDongPhu(uid) { this.ensureOnboarding(uid); const available = this.pending(uid); if (available)
        return available; const waiting = database_1.default.prepare("SELECT * FROM realm_npc_visits WHERE user_id=? AND state='WAITING_RETURN' ORDER BY realm_rank LIMIT 1").get(uid); if (waiting) {
        database_1.default.prepare("UPDATE realm_npc_visits SET state='AVAILABLE',armed_at=? WHERE user_id=? AND visit_id=? AND state='WAITING_RETURN'").run(Date.now(), uid, waiting.visit_id);
        return null;
    } return this.pending(uid); },
    pending(uid) { const row = database_1.default.prepare("SELECT * FROM realm_npc_visits WHERE user_id=? AND state IN ('AVAILABLE','CLOSING') ORDER BY realm_rank LIMIT 1").get(uid); return row ? { ...row, definition: definition(row.visit_id) } : null; },
    choose(uid, visitId, choiceId) { const row = database_1.default.prepare("SELECT * FROM realm_npc_visits WHERE user_id=? AND visit_id=? AND state='AVAILABLE'").get(uid, visitId), d = definition(visitId), a = d?.actions.find(x => x.id === choiceId); if (!row || !d || !a)
        return { ok: false, message: 'Lựa chọn này không còn hiệu lực.' }; const r = database_1.default.prepare("UPDATE realm_npc_visits SET state='CLOSING',current_node='CLOSING',choice_id=? WHERE user_id=? AND visit_id=? AND state='AVAILABLE'").run(choiceId, uid, visitId); return r.changes ? { ok: true, message: a.response } : { ok: false, message: 'Cảnh gặp vừa thay đổi; hãy mở lại.' }; },
    close(uid, visitId) { const row = database_1.default.prepare("SELECT * FROM realm_npc_visits WHERE user_id=? AND visit_id=? AND state='CLOSING'").get(uid, visitId), d = definition(visitId); if (!row || !d)
        return { ok: false, message: 'Cảnh gặp chưa thể khép lại.' }; database_1.default.transaction(() => { database_1.default.prepare("UPDATE realm_npc_visits SET state='RESOLVED',current_node='END',resolved_at=? WHERE user_id=? AND visit_id=? AND state='CLOSING'").run(Date.now(), uid, visitId); if (d.credentialId)
        database_1.default.prepare("INSERT OR IGNORE INTO player_credentials(user_id,credential_id,state,source_ref,granted_at) VALUES(?,?,'ACTIVE',?,?)").run(uid, d.credentialId, `realm_visit:${visitId}`, Date.now()); DialogueService_1.dialogueService.remember(uid, 'lang_tieu', d.memoryKey, { summary: d.log, choice: row.choice_id, event: d.title }); DialogueService_1.dialogueService.grantFact(uid, 'lang_tieu', d.fact); database_1.default.prepare('INSERT OR IGNORE INTO knowledge_provenance(user_id,fact_key,source_kind,source_ref,confidence,learned_at) VALUES(?,?,?,?,?,?)').run(uid, d.fact, 'OBSERVED', `realm_visit:${visitId}`, 'confirmed', Date.now()); database_1.default.prepare('INSERT OR IGNORE INTO travel_log_entries(user_id,entry_key,title,body,created_at) VALUES(?,?,?,?,?)').run(uid, `realm_visit:${visitId}`, d.title, d.log, Date.now()); })(); return { ok: true, message: d.credentialId ? 'Đã nhận Tín Vật 《Thất Môn Bái Thiếp》. Con đường tìm hiểu và xin bái nhập Thất Đại đã mở.' : 'Cuộc gặp đã được ghi vào Vân Du Lục và ký ức chung với Lăng Tiêu.' }; },
    view(uid, visitId) { const row = visitId ? database_1.default.prepare("SELECT * FROM realm_npc_visits WHERE user_id=? AND visit_id=? AND state IN ('AVAILABLE','CLOSING')").get(uid, visitId) : this.pending(uid); if (!row)
        return null; const d = definition(row.visit_id); if (!d)
        return null; const action = d.actions.find(x => x.id === row.choice_id); return { row, definition: d, text: row.state === 'CLOSING' ? `${action?.response || ''}\n\n${d.closing}` : d.opening, actions: row.state === 'AVAILABLE' ? d.actions : [] }; },
    audit() { const e = [], ids = new Set(exports.REALM_NPC_VISITS.map(x => x.id)); for (const id of ['CD.ONBOARDING.THAT_MON_BAI_THIEP.V1', 'LT-REALM-HOP-THE-01', 'LT-REALM-DO-KIEP-01'])
        if (!ids.has(id))
            e.push(`${id}: thiếu cảnh ghé thăm canon`); if (exports.REALM_NPC_VISITS.filter(x => x.id.startsWith('LT-REALM')).map(x => x.realmRank).join(',') !== '6,8')
        e.push('Lăng Tiêu realm visits phải đúng Hợp Thể và Độ Kiếp'); for (const d of exports.REALM_NPC_VISITS) {
        if (!d.actions.length || new Set(d.actions.map(x => x.id)).size !== d.actions.length)
            e.push(`${d.id}: action thiếu hoặc trùng`);
        if (!d.memoryKey || !d.fact || !d.log)
            e.push(`${d.id}: thiếu continuity state`);
    } return e; }
};
