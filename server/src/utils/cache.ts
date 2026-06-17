



export default class cache<T> {
    exp: Date;
    value: T | null;

    constructor(value: T | null, exp: number) {
        this.value = value;
        this.exp = new Date(Date.now() + exp);
    }

    isExp(): boolean {
        return this.exp < new Date();
    }

    get(): T | null {
        if (this.isExp()) {
            this.value = null;
            return null;
        }
        return this.value;
    }

    set(value: T, exp?: number) {
        this.value = value;
        if (exp) {
            this.exp = new Date(Date.now() + exp);
        }
    }
}