// src/whattsup/whattsup.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { WhattsupService } from './whattsup.service';

@Controller('whattsup')
export class WhattsupController {
  constructor(private readonly whattsupService: WhattsupService) {}

  @Post('send')
  async send(@Body() body: { to: string; message: string }) {
    return this.whattsupService.sendText(body.to, body.message);
  }
}