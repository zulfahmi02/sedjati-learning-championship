export type Panel = {
    id: number;
    name: string;
    description: string | null;
    judge_id: number | null;
    judge?: JudgeSummary | null;
    participants?: ParticipantSummary[];
    participants_count?: number;
};

export type JudgeSummary = {
    id: number;
    name: string;
    email: string;
};

export type ParticipantSummary = {
    id: number;
    participant_number: string;
    name: string;
};

export type Participant = ParticipantSummary & {
    institution: string | null;
    category: string | null;
    notes: string | null;
    panels?: Pick<Panel, 'id' | 'name'>[];
    scored?: boolean;
};

export type RoundStatus = 'pending' | 'active' | 'locked';

export type Round = {
    id: number;
    name: string;
    sequence: number;
    weight: number;
    status: RoundStatus;
    criteria?: Criterion[];
};

export type Criterion = {
    id: number;
    round_id: number;
    name: string;
    description: string | null;
    weight: number;
    min_score: number;
    max_score: number;
    sequence: number;
};

export type ScoreSheetStatus = 'draft' | 'submitted';

export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
};
