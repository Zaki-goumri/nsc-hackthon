import { Idb } from './db.type';
import { IRedis } from './redis.interface';
import { IJwt } from './jwt.type';
import { IMail } from './mail.type';
import { IElasticSearch } from './elasticsearch.type';
export interface IConfig {
  db: Idb;
  redis: IRedis;
  jwt: IJwt;
  mail:IMail;
  elasticSearch:IElasticSearch
}
