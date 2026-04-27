export function exportToMarkdown(input: { title: string; plainText?: string }) {
  return `# ${input.title}\n\n${input.plainText ?? ""}`;
}
