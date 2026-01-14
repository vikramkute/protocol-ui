import { Webview, Uri } from "vscode";
import { HttpRequest } from "../types/HttpRequest";
import { getUri } from "../utilities/getUri";

/**
 * Defines and returns the HTML that should be rendered within a protocol request view (aka webview panel).
 *
 * @param webview A reference to the extension webview
 * @param extensionUri The URI of the directory containing the extension
 * @param request An object representing a request
 * @returns A template string literal containing the HTML that should be
 * rendered within the webview panel
 */
export function getWebviewContent(webview: Webview, extensionUri: Uri, request: HttpRequest) {
  const webviewUri = getUri(webview, extensionUri, ["dist", "webview.js"]);
  const styleUri = getUri(webview, extensionUri, ["dist", "style.css"]);

  webview.onDidReceiveMessage((message: any) => {
    const command = message.command;
    switch (command) {
      case "requestRequestData":
        webview.postMessage({
          command: "receiveDataInWebview",
          payload: JSON.stringify(request),
        });
        break;
    }
  });

  return /*html*/ `
    <!DOCTYPE html>
    <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="${styleUri}">
          <title>${request.url}</title>
      </head>
      <body id="webview-body">
        <div class="api-tester">
          <div class="request-section">
            <div class="url-bar">
              <select id="methodSelect" class="method-select">
                <option value="GET" ${request.method === 'GET' ? 'selected' : ''}>GET</option>
                <option value="POST" ${request.method === 'POST' ? 'selected' : ''}>POST</option>
                <option value="PUT" ${request.method === 'PUT' ? 'selected' : ''}>PUT</option>
                <option value="PATCH" ${request.method === 'PATCH' ? 'selected' : ''}>PATCH</option>
                <option value="DELETE" ${request.method === 'DELETE' ? 'selected' : ''}>DELETE</option>
              </select>
              <input type="text" id="urlInput" placeholder="Enter request URL" class="url-input" value="${request.url === 'New request' ? '' : request.url}" />
              <button id="sendButton">Send</button>
            </div>

            <div class="request-body">
              <div class="section">
                <h3>Headers (JSON)</h3>
                <textarea id="headersInput" class="headers-input" placeholder='{"Content-Type": "application/json"}'>${typeof request.headers === 'string' ? request.headers : JSON.stringify(request.headers)}</textarea>
              </div>

              <div class="section" id="bodySection">
                <h3>Body (JSON)</h3>
                <textarea id="bodyInput" placeholder='{"key": "value"}' class="body-input">${request.body}</textarea>
              </div>
            </div>
          </div>

          <div class="response-section">
            <h3>Response</h3>
            <pre class="response-output" id="responseOutput">${request.response?.body ? `Status: ${request.response?.status}\n\n${request.response?.body}` : `No response yet`}</pre>
          </div>
        </div>
        <script type="module" src="${webviewUri}"></script>
      </body>
    </html>
  `;
}
