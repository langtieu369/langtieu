import db from '../database/database';

export type CasinoGame = 'taixiu' | 'chanle' | 'doanso';

class CasinoService {
  ensureWallet(userId: string) {
    db.prepare(`INSERT OR IGNORE INTO casino_wallets(user_id,tokens,total_wagered,total_won,games_played) VALUES(?,100,0,0,0)`).run(userId);
    return this.wallet(userId)!;
  }

  wallet(userId: string) {
    return db.prepare(`SELECT * FROM casino_wallets WHERE user_id=?`).get(userId) as any || null;
  }

  adjust(userId: string, amount: number) {
    const w = this.ensureWallet(userId);
    const next = Math.max(0, Number(w.tokens) + amount);
    db.prepare(`UPDATE casino_wallets SET tokens=? WHERE user_id=?`).run(next, userId);
    return next;
  }

  playTaiXiu(userId: string, choice: 'tai' | 'xiu', stake: number) {
    const w = this.ensureWallet(userId);
    const err = this.validateStake(w.tokens, stake); if (err) return { ok:false, message:err };
    const dice = [1,2,3].map(() => 1 + Math.floor(Math.random()*6));
    const total = dice.reduce((a,b)=>a+b,0);
    const result: 'tai'|'xiu' = total >= 11 ? 'tai' : 'xiu';
    const win = choice === result;
    const delta = win ? stake : -stake;
    this.settle(userId, stake, win ? stake : 0, delta);
    return { ok:true, message:`🎲 **${dice.join(' · ')}** = **${total}** → **${result === 'tai' ? 'Tài' : 'Xỉu'}**\n${win ? `✨ Thắng **${stake} Casino Token**.` : `🌫️ Mất **${stake} Casino Token**.`}\nVí hiện tại: **${this.ensureWallet(userId).tokens} token**.` };
  }

  playChanLe(userId: string, choice: 'chan'|'le', stake: number) {
    const w = this.ensureWallet(userId);
    const err = this.validateStake(w.tokens, stake); if (err) return { ok:false, message:err };
    const n = 1 + Math.floor(Math.random()*100);
    const result: 'chan'|'le' = n % 2 === 0 ? 'chan' : 'le';
    const win = choice === result;
    const delta = win ? stake : -stake;
    this.settle(userId, stake, win ? stake : 0, delta);
    return { ok:true, message:`🪙 Con số hiện ra: **${n}** → **${result === 'chan' ? 'Chẵn' : 'Lẻ'}**\n${win ? `✨ Thắng **${stake} Casino Token**.` : `🌫️ Mất **${stake} Casino Token**.`}\nVí hiện tại: **${this.ensureWallet(userId).tokens} token**.` };
  }

  playDoanSo(userId: string, guess: number, stake: number) {
    const w = this.ensureWallet(userId);
    const err = this.validateStake(w.tokens, stake); if (err) return { ok:false, message:err };
    if (!Number.isInteger(guess) || guess < 1 || guess > 6) return {ok:false,message:'Số dự đoán phải từ 1 đến 6.'};
    const n = 1 + Math.floor(Math.random()*6);
    const win = n === guess;
    const profit = win ? stake * 4 : 0; // nhận lãi 4x, tổng số dư tăng 4x stake
    const delta = win ? profit : -stake;
    this.settle(userId, stake, profit, delta);
    return { ok:true, message:`🎴 Đạo hữu chọn **${guess}**, kết quả là **${n}**.\n${win ? `✨ Trúng! Nhận lãi **${profit} Casino Token**.` : `🌫️ Không trúng, mất **${stake} Casino Token**.`}\nVí hiện tại: **${this.ensureWallet(userId).tokens} token**.` };
  }

  private validateStake(balance: number, stake: number) {
    if (!Number.isInteger(stake) || stake <= 0) return 'Mức cược phải là số nguyên dương.';
    if (stake > balance) return `Không đủ Casino Token. Hiện có **${balance}**.`;
    return '';
  }

  private settle(userId:string, wager:number, won:number, delta:number) {
    const tx = db.transaction(() => {
      db.prepare(`UPDATE casino_wallets SET tokens=MAX(0,tokens+?),total_wagered=total_wagered+?,total_won=total_won+?,games_played=games_played+1 WHERE user_id=?`).run(delta,wager,won,userId);
      db.prepare(`INSERT INTO casino_history(user_id,wager,delta,created_at) VALUES(?,?,?,?)`).run(userId,wager,delta,Math.floor(Date.now()/1000));
    });
    tx();
  }
}

export const casinoService = new CasinoService();
