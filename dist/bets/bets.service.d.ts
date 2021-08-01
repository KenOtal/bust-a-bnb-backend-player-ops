export declare class BetsService {
    validate(stringAmount: string): boolean;
    validateTargetMultiplier(target: number): boolean;
    calculateWinnings(amount: string, targetMultiplier?: number): string;
}
