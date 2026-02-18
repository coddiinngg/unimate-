export async function requestClaude(task: string, input: string) {
  return {
    provider: 'claude',
    task,
    output: `Claude mock response for: ${input}`,
  };
}
