"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveRareFire = resolveRareFire;
exports.qualityBand = qualityBand;
exports.applyFireQuality = applyFireQuality;
const RareFireCatalog_1 = require("../config/RareFireCatalog");
const masteryFactor = { so_dan: .7, thuan_hoa: .85, tri_tinh: .95, hop_dung: 1 };
const intersect = (a, b = []) => a.filter(x => b.includes(x));
function resolveRareFire(fireId, profile, mastery = 'so_dan') {
    if (!fireId || !profile)
        return { fireId: null, compatibility: 'kha_dung', allowed: true, qualityModifier: 0, difficultyModifier: 0, specialtyBudget: 0, matchedTraits: [], opposedTraits: [], specialties: [], reason: 'Phàm Hỏa hoặc recipe không yêu cầu Bản Tính.' };
    const fire = RareFireCatalog_1.RARE_FIRE_BY_ID[fireId];
    if (!fire)
        return { fireId, compatibility: 'cam_dung', allowed: false, qualityModifier: 0, difficultyModifier: 0, specialtyBudget: 0, matchedTraits: [], opposedTraits: [], specialties: [], reason: 'Dị Hỏa không tồn tại trong catalog.' };
    const forbidden = intersect(fire.nature, profile.forbidden);
    if (forbidden.length)
        return { fireId, compatibility: 'cam_dung', allowed: false, qualityModifier: 0, difficultyModifier: 0, specialtyBudget: 0, matchedTraits: [], opposedTraits: forbidden, specialties: [], reason: `Bản Tính bị cấm: ${forbidden.join(', ')}.` };
    const matched = intersect(fire.nature, profile.preferred), opposed = intersect(fire.nature, profile.opposed);
    if (opposed.length) {
        const difficulty = Math.min(15, 6 + opposed.length * 2);
        return { fireId, compatibility: 'nghich_tinh', allowed: true, qualityModifier: -6, difficultyModifier: difficulty, specialtyBudget: 0, matchedTraits: matched, opposedTraits: opposed, specialties: [], reason: 'Nghịch Tính: không nhận specialty và tăng yêu cầu kiểm soát.' };
    }
    let compatibility = 'kha_dung';
    if (matched.length >= 2)
        compatibility = 'dong_tinh';
    else if (matched.length === 1)
        compatibility = 'thuan_tinh';
    else if (intersect(fire.nature, profile.allowed).length)
        compatibility = 'kha_dung';
    const factor = masteryFactor[mastery], base = compatibility === 'dong_tinh' ? 10 : compatibility === 'thuan_tinh' ? 6 : 0;
    const specialtyBudget = Math.round(base * factor), qualityModifier = profile.qualityEligible === false ? 0 : compatibility === 'dong_tinh' ? 4 : compatibility === 'thuan_tinh' ? 2 : 0;
    return { fireId, compatibility, allowed: true, qualityModifier, difficultyModifier: fire.controlCost, specialtyBudget, matchedTraits: matched, opposedTraits: [], specialties: base ? fire.specialties[profile.domain] : [], reason: base ? 'Hỏa Tính tương hợp với quy trình.' : 'Dùng được như nguồn nhiệt nhưng không có specialty.' };
}
function qualityBand(score) { return score >= 90 ? 'peak' : score >= 75 ? 'excellent' : score >= 60 ? 'fine' : score >= 45 ? 'standard' : 'fail'; }
function applyFireQuality(baseScore, resolution) {
    const score = Math.max(0, Math.min(100, baseScore + resolution.qualityModifier));
    return { score, band: qualityBand(score), baseBand: qualityBand(baseScore) };
}
