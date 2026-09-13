import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';import { TuTienClient } from '../client/TuTienClient';
export abstract class Command{constructor(public readonly data:SlashCommandBuilder){} abstract execute(client:TuTienClient,i:ChatInputCommandInteraction):Promise<unknown>|unknown;}
