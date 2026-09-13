import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder
} from 'discord.js';

import { TuTienClient } from '../client/TuTienClient';

export type CommandBuilder =
  | SlashCommandBuilder
  | SlashCommandOptionsOnlyBuilder
  | SlashCommandSubcommandsOnlyBuilder;

export abstract class Command {
  constructor(public readonly data: CommandBuilder) {}

  abstract execute(
    client: TuTienClient,
    interaction: ChatInputCommandInteraction
  ): Promise<unknown> | unknown;
}
