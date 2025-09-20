import { MathOutcome } from "@models/math-outcome";

const API_ENDPOINT = "/api/kuriki/math";



export class KurikiMathematicsAPI {
    static async getOutcome(id: string): Promise<MathOutcome | undefined> {
        const response = await fetch(`${API_ENDPOINT}/outcomes?id=${encodeURIComponent(id)}`);

        if (!response.ok) {
            if (response.status === 404) return undefined;
            throw new Error(`Failed to fetch news: ${response.statusText}`);
        }

        const result = await response.json();
        return new MathOutcome(result.data);
    }

    static async getAllOutcomes(): Promise<MathOutcome[]> {
        const response = await fetch(`${API_ENDPOINT}/outcomes`);

        if (!response.ok) {
            throw new Error(`Failed to fetch news: ${response.statusText}`);
        }

        const result = await response.json();
        return Object.values(result.data).map((item: any) => new MathOutcome(item));
    }
}
