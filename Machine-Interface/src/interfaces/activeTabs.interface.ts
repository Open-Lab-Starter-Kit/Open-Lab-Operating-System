export interface NavTab {
  icon: string;
  label: string;
  router: string;
}

export interface NavTabs {
  [key: string]: NavTab;
}
