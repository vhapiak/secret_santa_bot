/**
 * Helper class to build large strings
 */
export class TextBuilder {
    constructor(private data: string) {

    }

    append(text: string): this {
        this.data += ' ' + text;
        return this;
    }

    newLine(text?: string): this {
        this.data += '\n';
        if (text) {
            this.data += text;
        }
        return this;
    }

    text(): string {
        return this.data;
    }
}

export function multiline(text: string = ''): TextBuilder {
    return new TextBuilder(text);
}