import db from '../database';import {ITEMS} from '../../config/GameCatalog';
export class InventoryRepository{
 add(uid:string,item:string,q=1){if(q<=0)return;db.prepare(`INSERT INTO inventories(user_id,item_id,quantity) VALUES(?,?,?) ON CONFLICT(user_id,item_id) DO UPDATE SET quantity=quantity+excluded.quantity`).run(uid,item,q)}
 remove(uid:string,item:string,q=1){const n=this.quantity(uid,item);if(n<q||q<=0)return false;if(n===q)db.prepare('DELETE FROM inventories WHERE user_id=? AND item_id=?').run(uid,item);else db.prepare('UPDATE inventories SET quantity=quantity-? WHERE user_id=? AND item_id=?').run(q,uid,item);return true}
 quantity(uid:string,item:string){return (db.prepare('SELECT quantity FROM inventories WHERE user_id=? AND item_id=?').get(uid,item) as any)?.quantity??0}
 equipped(uid:string,item:string){return !!(db.prepare('SELECT is_equipped FROM inventories WHERE user_id=? AND item_id=?').get(uid,item) as any)?.is_equipped}
 getUserInventory(uid:string){return (db.prepare('SELECT item_id,quantity,is_equipped FROM inventories WHERE user_id=? AND quantity>0 ORDER BY item_id').all(uid) as any[]).map(x=>({...x,...ITEMS[x.item_id]}))}
}
export const inventoryRepository=new InventoryRepository();
