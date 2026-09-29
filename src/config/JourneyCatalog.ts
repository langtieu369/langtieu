export type JourneyStatus='DORMANT'|'ELIGIBLE'|'ACTIVE'|'PAUSED'|'WAITING_INPUT'|'WAITING_WORLD_STATE'|'RESOLVED'|'AFTERMATH';
export type ProvenanceKind='OBSERVED'|'HEARD'|'INFERRED'|'SUPPORTED'|'CONFIRMED';
export interface JourneyAction{id:string;label:string;next?:string;resolve?:boolean;requiredFact?:string;setFlags?:Record<string,unknown>}
export interface JourneyNode{id:string;title:string;text:string;actions:JourneyAction[]}
export interface JourneyDefinition{id:string;version:number;title:string;family:string;tone:string[];once:boolean;aliases:string[];entry:{npcId?:string;minRelationship?:string;minSharedMemories?:number};startNode:string;nodes:JourneyNode[];rewardPolicy:string;migration:Record<number,string>}

export const MOON_NAME_JOURNEY_ID='LT-LEGACY-MOON-NAME-01';
export const JOURNEYS:JourneyDefinition[]=[{
 id:MOON_NAME_JOURNEY_ID,version:1,title:'Gọi Tên Dưới Trăng',family:'LT-LEGACY',tone:['lặng','ấm'],once:true,aliases:['gọi tên khi ngắm trăng'],
 entry:{npcId:'lang_tieu',minRelationship:'familiar',minSharedMemories:3},startNode:'MOON_CHOICE',rewardPolicy:'NO_RESOURCE_REWARD',migration:{},
 nodes:[
  {id:'MOON_CHOICE',title:'Một tiếng gọi dưới trăng',text:'Gió đêm lướt qua mái ngói. Người bên cạnh ngửa đầu nhìn trăng, hồi lâu không nói gì. Không hiểu vì sao, ngươi bỗng muốn gọi cậu ấy một tiếng.',actions:[
   {id:'SILENCE',label:'Trầm mặc',next:'SILENCE_END',setFlags:{first_name_choice:'silence'}},{id:'LANG_TIEU',label:'Lăng Tiêu.',next:'LANG_TIEU_END',setFlags:{first_name_choice:'lang_tieu'}},{id:'CANH_HUYEN',label:'Cảnh Huyền.',next:'CANH_HUYEN_SOURCE',requiredFact:'lang_tieu_name_canh_huyen',setFlags:{first_name_choice:'canh_huyen'}}]},
  {id:'SILENCE_END',title:'Trăng vẫn sáng',text:'Một lúc sau, Lăng Tiêu quay sang. “Sao thế?” Cậu đợi một chút rồi lại nhìn lên trời. “Không có gì thì thôi. Ngồi thêm một lát đi.”',actions:[{id:'KEEP_SILENCE',label:'Ngồi thêm một lát',resolve:true,setFlags:{moon_name_outcome:'silence'}}]},
  {id:'LANG_TIEU_END',title:'Lăng Tiêu ở đây',text:'“Ừ?” Lăng Tiêu nghiêng đầu. “Gọi tiểu đạo làm gì?” Thấy ngươi chỉ muốn gọi thử, cậu nhìn sang một lát. “...Ngươi rảnh thật đấy. Lăng Tiêu ở đây. Gọi xong rồi đấy.”',actions:[{id:'ACK_LANG_TIEU',label:'Nhìn trăng tiếp',resolve:true,setFlags:{moon_name_outcome:'lang_tieu'}}]},
  {id:'CANH_HUYEN_SOURCE',title:'Cái tên cũ',text:'Bàn tay đặt trên đầu gối khẽ dừng lại. Một lúc sau, người bên cạnh mới quay sang. “...Ngươi vừa gọi tiểu đạo là gì?” Khi nghe lại cái tên ấy, cậu hỏi: “Ngươi biết cái tên ấy từ đâu?”',actions:[{id:'TELL_SOURCE',label:'Nói lại nguồn mình đã biết',next:'CANH_HUYEN_END'},{id:'RESPECT_BOUNDARY',label:'Nếu ngươi không muốn nói thì thôi',next:'CANH_HUYEN_END'}]},
  {id:'CANH_HUYEN_END',title:'Tên gọi được ghi nhớ',text:'Lăng Tiêu nghe hết, không vội giải thích quá khứ. Cái tên ấy được giữ lại đúng theo điều ngươi thật sự biết, không mở thêm bất cứ bí mật nào ngoài nguồn đã có.',actions:[{id:'CLOSE_MOON',label:'Khép lại đêm ấy',resolve:true,setFlags:{moon_name_outcome:'canh_huyen',lang_tieu_has_acknowledged_name:true}}]}
 ]
}];
export const journeyById=(id:string)=>JOURNEYS.find(j=>j.id===id||j.aliases.includes(id));
export function auditJourneyCatalog(){const errors:string[]=[];const ids=new Set<string>();for(const j of JOURNEYS){if(ids.has(j.id))errors.push(`duplicate journey ${j.id}`);ids.add(j.id);const nodes=new Map(j.nodes.map(n=>[n.id,n]));if(!nodes.has(j.startNode))errors.push(`${j.id}: missing start ${j.startNode}`);for(const n of j.nodes){if(!n.actions.length)errors.push(`${j.id}:${n.id}: no action`);const actions=new Set<string>();for(const a of n.actions){if(actions.has(a.id))errors.push(`${j.id}:${n.id}: duplicate action ${a.id}`);actions.add(a.id);if(!a.resolve&&!a.next)errors.push(`${j.id}:${n.id}:${a.id}: no exit`);if(a.next&&!nodes.has(a.next))errors.push(`${j.id}:${n.id}:${a.id}: dangling ${a.next}`)}}}return errors}
