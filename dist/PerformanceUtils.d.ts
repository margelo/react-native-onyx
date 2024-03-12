type Mapping = Record<string, unknown> & {
    key: string;
    displayName: string;
};
declare function setShouldDebugSetState(debug: boolean): void;
/**
 * Provide insights into why a setState() call occurred by diffing the before and after values.
 */
declare function logSetStateCall(mapping: Mapping, previousValue: unknown, newValue: unknown, caller: string, keyThatChanged: string): void;
export { logSetStateCall, setShouldDebugSetState };
