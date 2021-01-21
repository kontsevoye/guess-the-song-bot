import { MatcherInterface } from "../types";

export default class Any implements MatcherInterface {
  getCmp = (): string => "*";

  isCompatible = (): boolean => true;
}
