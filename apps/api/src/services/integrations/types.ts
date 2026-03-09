export interface ActionItemData {
    title: string;
    description?: string;
    dueDate?: string;
    assignee?: string;
}

export interface IntegrationConfig {
    platform: 'trello' | 'jira' | 'asana';
    connected: boolean;
    boardName?: string;
    projectName?: string;
}
