import {itemInstanceService} from './ItemInstanceService';
export const equipmentService={
 equip(uid:string,instanceId:string){return itemInstanceService.equip(uid,instanceId)},
 stats(uid:string){return itemInstanceService.stats(uid)}
};
