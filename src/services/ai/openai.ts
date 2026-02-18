export async function requestOpenAI(task: string, input: string) {
  return {
    provider: 'openai',
    task,
    output: `OpenAI mock response for: ${input}`,
  };
}
