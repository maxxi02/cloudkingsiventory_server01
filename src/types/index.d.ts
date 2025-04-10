declare namespace NodeJS {
  interface Process {
    env: Record<string, string>;
    // Add other process properties you need
  }

  interface ErrorConstructor {
    captureStackTrace?(targetObject: object, constructorOpt?: Function): void;
  }
}

declare var process: NodeJS.Process;
