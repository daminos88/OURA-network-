export class OuraCache {
  private stored: string | null = null;

  save(data: string): void {
    this.stored = data;
  }

  load(): string {
    if (this.stored === null) {
      throw new Error('No cached bundle');
    }
    return this.stored;
  }
}
