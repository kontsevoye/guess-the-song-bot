import { Message } from "discord.js";
import { MatcherInterface } from "../types";

export default class StartsWith implements MatcherInterface {
  constructor(private cmp: string) {}

  getCmp(): string {
    return this.cmp;
  }

  isCompatible(m: Message): boolean {
    return m.content.startsWith(this.cmp);
  }
}
