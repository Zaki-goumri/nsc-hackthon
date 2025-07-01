import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';

@Injectable()
export class RiskService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async analyzeRisk(name: string, product_category: string): Promise<any> {
    const baseUrl = this.configService.get<string>('aiUrl');
    console.log(baseUrl);
    const url = `${baseUrl}/risk`;
    const payload = { name, product_category };
    const response: AxiosResponse = await this.httpService.axiosRef.post(
      url,
      payload,
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
    return response.data;
  }
}
