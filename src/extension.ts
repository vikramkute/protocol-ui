import * as vscode from 'vscode';
import { ProtocolDataProvider } from "./providers/ProtocolDataProvider";
import { getWebviewContent } from "./ui/getWebviewContent";
import { HttpRequest } from "./types/HttpRequest";

function truncatePanelTitle(title: string): string {
  return title.length > 15 ? title.substring(0, 15) + "..." : title;
}

export function activate(context: vscode.ExtensionContext) {
  let requests: HttpRequest[] = [];
  let panel: vscode.WebviewPanel | undefined = undefined;

  const protocolDataProvider = new ProtocolDataProvider(requests);

  // Create a tree view to contain the list of protocol requests
  const treeView = vscode.window.createTreeView("protocol.requestsList", {
    treeDataProvider: protocolDataProvider,
    showCollapseAll: false,
  });

  // Command to render a webview-based request view
  const openRequest = vscode.commands.registerCommand("protocol.showRequestDetailView", () => {
    const selectedTreeViewItem = treeView.selection[0];
    const matchingRequest = requests.find((request) => request.id === selectedTreeViewItem.id);

    if (!matchingRequest) {
      vscode.window.showErrorMessage("No matching request found");
      return;
    }
    // ProtocolPanel.render(context.extensionUri, requests, matchingRequest);

    // If no panel is open, create a new one and update the HTML
    if (!panel) {
      panel = vscode.window.createWebviewPanel("noteDetailView", matchingRequest.url, vscode.ViewColumn.One, {
        // Enable JavaScript in the webview
        enableScripts: true,
        // Restrict the webview to only load resources from the `dist` directory
        localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "dist")],
      });
    }

    // If a panel is open, update the HTML with the selected item's content
    panel.title = matchingRequest.url;
    panel.title = truncatePanelTitle(panel.title);
    panel.webview.html = getWebviewContent(panel.webview, context.extensionUri, matchingRequest);

    // If a panel is open and receives an update message, update the requests array and the panel title/html
    panel.webview.onDidReceiveMessage((message) => {
      const command = message.command;
      switch (command) {
        case "updateRequest":
          const request: HttpRequest = message.request;
          const updatedRequestId = request.id;
          const copyOfRequestsArray = [...requests];
          const matchingRequestIndex = copyOfRequestsArray.findIndex((request) => request.id === updatedRequestId);
          copyOfRequestsArray[matchingRequestIndex] = request;
          requests = copyOfRequestsArray;
          protocolDataProvider.refresh(requests);

          if (panel) {
            panel.title = request.url;
            panel.title = truncatePanelTitle(panel.title);
            panel.webview.html = getWebviewContent(panel.webview, context.extensionUri, request);
          }
          break;
      }
    });

    panel.onDidDispose(
      () => {
        // When the panel is closed, cancel any future updates to the webview content
        panel = undefined;
      },
      null,
      context.subscriptions
    );
  });

  // Command to create a new request
  const createRequest = vscode.commands.registerCommand("protocol.createRequest", () => {
    const id = Date.now().toString();
    const newRequest: HttpRequest = {
      id: id,
      url: "New request",
      method: "GET",
      headers: "",
      body: ""
    };
    requests.push(newRequest);
    protocolDataProvider.refresh(requests);
    
    // Select the newly created request in the tree view
    treeView.reveal(newRequest, { select: true, focus: true });

    // Create a panel if one doesn't exist
    if (!panel) {
      panel = vscode.window.createWebviewPanel("noteDetailView", newRequest.url, vscode.ViewColumn.One, {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "dist")],
      });

      // Add message listener for the new panel
      panel.webview.onDidReceiveMessage((message) => {
        const command = message.command;
        switch (command) {
          case "updateRequest":
            const request: HttpRequest = message.request;
            const updatedRequestId = request.id;
            const copyOfRequestsArray = [...requests];
            const matchingRequestIndex = copyOfRequestsArray.findIndex((request) => request.id === updatedRequestId);
            copyOfRequestsArray[matchingRequestIndex] = request;
            requests = copyOfRequestsArray;
            protocolDataProvider.refresh(requests);
            if (panel) {
              panel.title = request.url;
              panel.title = truncatePanelTitle(panel.title);
              panel.webview.html = getWebviewContent(panel.webview, context.extensionUri, request);
            }
            break;
        }
      });

      panel.onDidDispose(
        () => {
          panel = undefined;
        },
        null,
        context.subscriptions
      );
    }

    // Update panel with the new request
    if (panel) {
      panel.title = newRequest.url;
      panel.title = truncatePanelTitle(panel.title);
      panel.webview.html = getWebviewContent(panel.webview, context.extensionUri, newRequest);
    }
  });

  // Command to delete a given request
  const deleteRequest = vscode.commands.registerCommand("protocol.deleteRequest", (node: HttpRequest) => {
    const selectedTreeViewItem = node;
    const selectedRequestIndex = requests.findIndex((request) => request.id === selectedTreeViewItem.id);
    requests.splice(selectedRequestIndex, 1);
    protocolDataProvider.refresh(requests);

    // Close the panel if it's open
    panel?.dispose();
  });

  // Add command to the extension context
  context.subscriptions.push(openRequest);
  context.subscriptions.push(createRequest);
  context.subscriptions.push(deleteRequest);
}

// This method is called when your extension is deactivated
export function deactivate() { }