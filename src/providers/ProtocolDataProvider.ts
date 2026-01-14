import { Event, EventEmitter, ProviderResult, ThemeIcon, TreeDataProvider, TreeItem } from "vscode";
import { HttpRequest } from "../types/HttpRequest";

// A custom type to keep the code below more tidy
type TreeDataOnChangeEvent = ProtocolRequest | undefined | null | void;

/**
 * An implementation of the TreeDataProvider interface.
 *
 * This class is responsible for managing the tree data that the VS Code
 * TreeView API needs to render a custom tree view.
 *
 * Learn more about Tree Data Providers here:
 * https://code.visualstudio.com/api/extension-guides/tree-view#tree-data-provider
 */
export class ProtocolDataProvider implements TreeDataProvider<ProtocolRequest> {
  private _onDidChangeTreeData = new EventEmitter<TreeDataOnChangeEvent>();
  readonly onDidChangeTreeData: Event<TreeDataOnChangeEvent> = this._onDidChangeTreeData.event;

  data: ProtocolRequest[];

  constructor(requestsData: HttpRequest[]) {
    this.data = requestsData.map((request) => new ProtocolRequest(request.id, request.url));
  }

  refresh(requestsData: HttpRequest[]): void {
    this._onDidChangeTreeData.fire();
    this.data = requestsData.map((request) => new ProtocolRequest(request.id, request.url));
  }

  getTreeItem(element: ProtocolRequest): TreeItem | Thenable<TreeItem> {
    return element;
  }

  getChildren(element?: ProtocolRequest | undefined): ProviderResult<ProtocolRequest[]> {
    if (element === undefined) {
      return this.data;
    }
    return element.children;
  }

  getParent() {
    return null;
  }
}

class ProtocolRequest extends TreeItem {
  children?: ProtocolRequest[];

  constructor(requestId: string, requestTitle: string) {
    super(requestTitle);
    this.id = requestId;
    this.iconPath = new ThemeIcon("request");
    this.command = {
      title: "Open request",
      command: "protocol.showRequestDetailView",
    };
  }
}
