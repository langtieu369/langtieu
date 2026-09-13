import {ChatInputCommandInteraction,SlashCommandBuilder} from 'discord.js';
import {Command} from '../../structures/Command';
import {TuTienClient} from '../../client/TuTienClient';
import {userRepository} from '../../database/repositories/UserRepository';

function validImageUrl(value:string|null){
  if(!value)return '';
  try{const u=new URL(value);return ['http:','https:'].includes(u.protocol)?u.toString():''}catch{return ''}
}

export default class TaoNhanVat extends Command{
  constructor(){
    super(new SlashCommandBuilder()
      .setName('taonhanvat')
      .setDescription('Lập đạo hồ và bước vào Thương Mang Thiên Hạ')
      .addStringOption(o=>o.setName('dao_hieu').setDescription('Đạo hiệu của bạn').setRequired(true))
      .addStringOption(o=>o.setName('anh_ava').setDescription('Link ảnh đại diện hiển thị ở góc phải /tutien').setRequired(false))
      .addStringOption(o=>o.setName('anh_thumbnail').setDescription('Link ảnh lớn hiển thị ở đầu giao diện /tutien').setRequired(false))
    );
  }
  async execute(_:TuTienClient,i:ChatInputCommandInteraction){
    if(userRepository.get(i.user.id))return i.editReply('Đạo danh đã lập, không thể nhập thế lần nữa.');
    const n=i.options.getString('dao_hieu',true).trim().slice(0,32);
    const rawAvatar=i.options.getString('anh_ava');
    const rawThumb=i.options.getString('anh_thumbnail');
    const avatar=validImageUrl(rawAvatar)||i.user.displayAvatarURL({extension:'png',size:256});
    const thumbnail=validImageUrl(rawThumb);
    if(rawAvatar&&!validImageUrl(rawAvatar))return i.editReply('❌ Link **ảnh ava** không hợp lệ. Hãy dùng link bắt đầu bằng `http://` hoặc `https://`.');
    if(rawThumb&&!thumbnail)return i.editReply('❌ Link **ảnh thumbnail** không hợp lệ. Hãy dùng link bắt đầu bằng `http://` hoặc `https://`.');
    userRepository.create(i.user.id,n,avatar,thumbnail);
    return i.editReply(`✨ **${n}** — đạo danh đã nhập Thiên Lục. Cảnh giới khởi đầu: **Luyện Khí**.${thumbnail?'\n🖼️ Ảnh thumbnail đã được ghi vào đạo hồ.':''}\n🪞 Ảnh đại diện đã được ghi vào đạo hồ.\nDùng **/tutien** để bước vào Thương Mang Thiên Hạ.\n— Tô Cảnh Huyền`);
  }
}
