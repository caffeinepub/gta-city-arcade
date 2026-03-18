import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface HighScore {
    score: bigint;
    playerName: string;
}
export interface backendInterface {
    getHighScores(): Promise<Array<HighScore>>;
    submitHighScore(playerName: string, score: bigint): Promise<void>;
}
