import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WhattsupService {
  private readonly token = process.env.WA_ACCESS_TOKEN!;
  private readonly phoneNumberId = process.env.WA_PHONE_NUMBER_ID!;

  constructor(private readonly http: HttpService) {}

  async sendText(
    to: string,
    message: string,
  ): Promise<AxiosResponse<any>> {            
    const url = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: message },
    };

    return firstValueFrom(                      
      this.http.post(url, payload, {
        headers: { Authorization: `Bearer ${this.token}` },
      }),
    );
  }

  async sendMedia(
    to: string,
    mediaId: string,
    caption?: string,
  ): Promise<AxiosResponse<any>> {          
    const url = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`;

    const payload: Record<string, any> = {
      messaging_product: 'whatsapp',
      to,
      type: 'image',
      image: { id: mediaId, caption },
    };

    return firstValueFrom(
      this.http.post(url, payload, {
        headers: { Authorization: `Bearer ${this.token}` },
      }),
    );
  }
}
