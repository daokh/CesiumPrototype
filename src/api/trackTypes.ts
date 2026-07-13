export interface Track {
    id: number;
    number: string;

    lat: number;
    lon: number;
    altmsl: number;

    speed: number;
    course: number;

    identity: string;
    affiliation: string;
    environment: string;
    platform: string;

    timestamp: number;
}