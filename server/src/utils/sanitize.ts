export class Sanitizer {
    public static html(input: string): string {
        return String(input)
            .replace(/<[^>]*>/g, '')
            .trim(); // Remove HTML tags
    }

    static string(input: string): string {
        // Remove leading and trailing whitespace, and replace multiple spaces with a single space
        return input.trim().replace(/\s+/g, ' ');
    }

    static email(input: string): string {
        // Basic email sanitization to remove spaces and convert to lowercase
        // remove the pattern where users add + tags in email
        input = input.replace(/\+[^@]*/, '');
        return input.trim().toLowerCase();
    }

    static password(input: string): string {
        // Basic password sanitization (e.g., trimming whitespace)
        return input.trim();
    }
    static number(input: any): number {
        const num = Number(input);
        if (isNaN(num)) {
            throw new Error('Invalid number input');
        }
        return num;
    }
}

// const e = "something+test@example.com"
// const sanitizedEmail = Sanitizer.email(e);
// console.log(sanitizedEmail); // Output: "something@example.com"
