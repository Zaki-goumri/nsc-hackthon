export interface IElasticSearch {
    node: string;
    timeout: number;
    auth: {
      username: string;
      password: string;
    };
  }
  