export interface Interactor<Input = void, Output = void> {
    execute(input: Input): Promise<Output>;
}
