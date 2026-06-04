export interface LevelData {
    char: string;
    dots: number[];
    isBase?: boolean;
    base?: number[];
    msg: string;
    isSpecialNotice?: boolean;
    isMirror?: boolean;
    original?: number[];
    isSpecial?: boolean;
}

export interface QuizUnit {
    q: string;
    a: string[];
    correct: number;
    hint?: string;
}

export interface LevelDatabase {
    [key: string]: LevelData[];
}

export interface QuizBank {
    [key: string]: QuizUnit[];
}

export interface BadgePassport {
    first: boolean;
    middle: boolean;
    last: boolean;
}
