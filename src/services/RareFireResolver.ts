import {FireCompatibility,FireMastery,FireTrait,RARE_FIRE_BY_ID,RecipeFireProfile} from '../config/RareFireCatalog';

export interface FireResolution{
 fireId:string|null;compatibility:FireCompatibility;allowed:boolean;
 qualityModifier:number;difficultyModifier:number;specialtyBudget:number;
 matchedTraits:FireTrait[];opposedTraits:FireTrait[];specialties:string[];reason:string;
}

const masteryFactor:Record<FireMastery,number>={so_dan:.7,thuan_hoa:.85,tri_tinh:.95,hop_dung:1};
const intersect=(a:readonly FireTrait[],b:readonly FireTrait[]=[]):FireTrait[]=>a.filter(x=>b.includes(x));

export function resolveRareFire(fireId:string|null|undefined,profile?:RecipeFireProfile,mastery:FireMastery='so_dan'):FireResolution{
 if(!fireId||!profile)return{fireId:null,compatibility:'kha_dung',allowed:true,qualityModifier:0,difficultyModifier:0,specialtyBudget:0,matchedTraits:[],opposedTraits:[],specialties:[],reason:'Phàm Hỏa hoặc recipe không yêu cầu Bản Tính.'};
 const fire=RARE_FIRE_BY_ID[fireId];
 if(!fire)return{fireId,compatibility:'cam_dung',allowed:false,qualityModifier:0,difficultyModifier:0,specialtyBudget:0,matchedTraits:[],opposedTraits:[],specialties:[],reason:'Dị Hỏa không tồn tại trong catalog.'};
 const forbidden=intersect(fire.nature,profile.forbidden);
 if(forbidden.length)return{fireId,compatibility:'cam_dung',allowed:false,qualityModifier:0,difficultyModifier:0,specialtyBudget:0,matchedTraits:[],opposedTraits:forbidden,specialties:[],reason:`Bản Tính bị cấm: ${forbidden.join(', ')}.`};
 const matched=intersect(fire.nature,profile.preferred),opposed=intersect(fire.nature,profile.opposed);
 if(opposed.length){const difficulty=Math.min(15,6+opposed.length*2);return{fireId,compatibility:'nghich_tinh',allowed:true,qualityModifier:-6,difficultyModifier:difficulty,specialtyBudget:0,matchedTraits:matched,opposedTraits:opposed,specialties:[],reason:'Nghịch Tính: không nhận specialty và tăng yêu cầu kiểm soát.'}}
 let compatibility:FireCompatibility='kha_dung';
 if(matched.length>=2)compatibility='dong_tinh';else if(matched.length===1)compatibility='thuan_tinh';
 else if(intersect(fire.nature,profile.allowed).length)compatibility='kha_dung';
 const factor=masteryFactor[mastery],base=compatibility==='dong_tinh'?10:compatibility==='thuan_tinh'?6:0;
 const specialtyBudget=Math.round(base*factor),qualityModifier=profile.qualityEligible===false?0:compatibility==='dong_tinh'?4:compatibility==='thuan_tinh'?2:0;
 return{fireId,compatibility,allowed:true,qualityModifier,difficultyModifier:fire.controlCost,specialtyBudget,matchedTraits:matched,opposedTraits:[],specialties:base?fire.specialties[profile.domain]:[],reason:base?'Hỏa Tính tương hợp với quy trình.':'Dùng được như nguồn nhiệt nhưng không có specialty.'};
}

export type QualityBand='fail'|'standard'|'fine'|'excellent'|'peak';
export function qualityBand(score:number):QualityBand{return score>=90?'peak':score>=75?'excellent':score>=60?'fine':score>=45?'standard':'fail'}
export function applyFireQuality(baseScore:number,resolution:FireResolution){
 const score=Math.max(0,Math.min(100,baseScore+resolution.qualityModifier));
 return{score,band:qualityBand(score),baseBand:qualityBand(baseScore)};
}
