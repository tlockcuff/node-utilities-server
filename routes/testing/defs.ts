export interface Result { passed: number, failed: number }
export enum TestStatus { FAILED, PASSED }
export interface Test { name: string, status: TestStatus, duration?: number, err?: string, stack?: string }
export interface Module {
    title: string
    tests: Array<Test>
}