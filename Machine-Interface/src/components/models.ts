export interface WebsocketMessage {
  msg: string;
}

export interface NavItem {
  icon: string;
  label: string;
  router: string;
}

export interface NavItems {
  files: NavItem;
  controls: NavItem;
  console: NavItem;
}
