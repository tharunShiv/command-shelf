/**
 * Copy text to clipboard with comment prefix to prevent accidental execution
 */
export async function copyCommandToClipboard(
  command: string,
  commandName: string
): Promise<void> {
  const commentedCommand = `# ${command}`;

  try {
    await navigator.clipboard.writeText(commentedCommand);
  } catch (error) {
    // Fallback for browsers that don't support clipboard API
    const textarea = document.createElement("textarea");
    textarea.value = commentedCommand;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand("copy");
    } finally {
      document.body.removeChild(textarea);
    }
  }
}
