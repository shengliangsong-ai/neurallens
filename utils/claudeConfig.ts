import Anthropic from '@anthropic-ai/sdk';

export function getClaudeKey(): string | null {
  return localStorage.getItem('CLAUDE_API_KEY');
}

export function promptForClaudeKey(): boolean {
   window.dispatchEvent(new Event('MISSING_API_KEY')); // Reuse the same modal
   return false;
}

export function getClaudeClient(): Anthropic {
   const key = getClaudeKey();
   if (!key || key.trim() === '') {
      promptForClaudeKey();
      throw new Error("A Claude API Key is required. Please set it in the App Settings.");
   }
   return new Anthropic({ 
     apiKey: key,
     dangerouslyAllowBrowser: true
   });
}
