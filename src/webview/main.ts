import {
  Button
} from "@vscode/webview-ui-toolkit";
import { HttpRequest } from "../types/HttpRequest";

declare function acquireVsCodeApi<T = any>(): any;

// Get access to the VS Code API from within the webview context
const vscode = acquireVsCodeApi<any>();

// State variables - declared at module level to be accessible in all functions
let responseOutput: HTMLPreElement;
let method = 'GET';
let url = '';
let headers = '{}';
let body = '{}';
let loading = false;

// Just like a regular webpage we need to wait for the webview
// DOM to load before we can reference any of the HTML elements
// or toolkit components
window.addEventListener("load", main);

function main() {
  setVSCodeMessageListener();
  vscode.postMessage({ command: "requestRequestData" });

  // To get improved type annotations/IntelliSense the associated class for
  // a given toolkit component can be imported and used to type cast a reference
  // to the element (i.e. the `as Button` syntax)

  const sendButton = document.getElementById('sendButton') as Button;
  sendButton.addEventListener('click', () => sendRequest(sendButton));

  // new code starts here
  responseOutput = document.getElementById('responseOutput') as HTMLPreElement;
  method = (document.getElementById('methodSelect') as HTMLSelectElement).value || 'GET';
  url = (document.getElementById('urlInput') as HTMLInputElement).value || '';
  headers = (document.getElementById('headersInput') as HTMLTextAreaElement).value || '{}';
  body = (document.getElementById('bodyInput') as HTMLTextAreaElement).value || '{}';
  loading = false;

  const methodSelect = document.getElementById('methodSelect') as HTMLSelectElement;
  const urlInput = document.getElementById('urlInput') as HTMLInputElement;
  const headersInput = document.getElementById('headersInput') as HTMLTextAreaElement;
  const bodyInput = document.getElementById('bodyInput') as HTMLTextAreaElement;

  if (!headersInput.value || headersInput.value.trim() === '') {
    headersInput.value = '{\n  "Content-Type": "application/json"\n}';
    headers = headersInput.value;
  }

  methodSelect.addEventListener('change', (e: Event) => {
    method = (e.target as HTMLSelectElement).value;
  });

  urlInput.addEventListener('input', (e: Event) => {
    url = (e.target as HTMLInputElement).value;
  });

  headersInput.addEventListener('input', (e: Event) => {
    headers = (e.target as HTMLTextAreaElement).value;
  });

  bodyInput.addEventListener('input', (e: Event) => {
    body = (e.target as HTMLTextAreaElement).value;
  });
}

// Stores the currently opened request info so we know the ID when we update it on save
let openedRequest: HttpRequest;

function setVSCodeMessageListener() {
  window.addEventListener("message", (event) => {
    const command = event.data.command;
    const noteData = JSON.parse(event.data.payload);

    switch (command) {
      case "receiveDataInWebview":
        openedRequest = noteData;
        break;
    }
  });
}

// Send request function
async function sendRequest(sendButton: Button): Promise<void> {
  if (loading) {
    return;
  }
  loading = true;
  sendButton.textContent = 'Sending...';
  sendButton.disabled = true;

  try {
    // Parse headers
    let parsedHeaders: Record<string, string> = {};
    try {
      parsedHeaders = JSON.parse(headers || '');
    } catch (e) {
      responseOutput.textContent = 'Error: Invalid JSON in headers\n' + (e as Error).message;
      return;
    }

    // Prepare fetch options
    const options: RequestInit = {
      method: method,
      headers: parsedHeaders
    };

    // Add body if not GET or DELETE
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        const parsedBody = JSON.parse(body || '{}');
        options.body = JSON.stringify(parsedBody);
      } catch (e) {
        responseOutput.textContent = 'Error: Invalid JSON in body\n' + (e as Error).message;
        return;
      }
    }

    // Make the request
    const response: Response = await fetch(url, options);

    // Get response text
    const responseText: string = await response.text();

    // Try to parse as JSON for pretty printing
    let formattedResponse: string;
    const responseHeaders: Record<string, string> = {};
    try {
      formattedResponse = `Status: ${response.status}\n\n${responseText}`;
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      const requestToUpdate = {
        id: openedRequest.id,
        url: url,
        method: method,
        headers: parsedHeaders,
        body: body,
        response: {
          status: response.status,
          headers: responseHeaders,
          body: responseText
        }
      };
      vscode.postMessage({ command: "updateRequest", request: requestToUpdate });
    } catch (e) {
      formattedResponse = `Status: ${response.status}\n\n${responseText}`;
    }

    responseOutput.textContent = formattedResponse;

  } catch (error) {
    responseOutput.textContent = 'Error: ' + (error as Error).message;
  } finally {
    loading = false;
    sendButton.textContent = 'Send';
    sendButton.disabled = false;
  }
}