declare var process: {
  env: Record<string, string>;
  exit(code?: number): never;
};

declare namespace NodeJS {
  interface Process {
    env: Record<string, string>;
    exit(code?: number): never;
  }
}

declare namespace Error {
  function captureStackTrace(
    targetObject: object,
    constructorOpt?: Function,
  ): void;
}
