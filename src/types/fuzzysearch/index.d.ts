/// <reference types="node" />

declare module "fuzzysearch" {
  export default function fuzzysearch(
    needle: string,
    haystack: string
  ): boolean;
}
