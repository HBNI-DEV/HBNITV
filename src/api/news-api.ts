import { News } from "@models/news";

const API_ENDPOINT = "/api/news";

export class NewsAPI {
    static async saveNews(news: News): Promise<void> {
        const response = await fetch(API_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(news.toJSON()),
        });

        if (!response.ok) {
            throw new Error(`Failed to save news: ${response.statusText}`);
        }
    }

    static async getNews(id: string): Promise<News | undefined> {
        const response = await fetch(`${API_ENDPOINT}?id=${encodeURIComponent(id)}`);

        if (!response.ok) {
            if (response.status === 404) return undefined;
            throw new Error(`Failed to fetch news: ${response.statusText}`);
        }

        const result = await response.json();
        return new News(result.data);
    }

    static async getAllNews(): Promise<News[]> {
        const response = await fetch(API_ENDPOINT);

        if (!response.ok) {
            throw new Error(`Failed to fetch news: ${response.statusText}`);
        }

        const result = await response.json();
        return result.data.map((item: any) => new News(item.data));
    }

    static async deleteNews(id: string): Promise<void> {
        const response = await fetch(`${API_ENDPOINT}?id=${encodeURIComponent(id)}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error(`Failed to delete news: ${response.statusText}`);
        }
    }
}
