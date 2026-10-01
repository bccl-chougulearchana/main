export interface quickLinksModel {
  status: string;
  data: quickLinksData;
}

export interface quickLinksData {
  navigationLinks: NavigationLink[];
  menu: { [key: string]: string[] };
  quickLinks: string[];
}

export interface NavigationLink {
  name: string;
  url: string;
  route?: string;
  companyUrls?: Record<string, string>;
  icon: string;
  internalExternalCon: boolean;
  quickName: string;
  visible: boolean;
}

