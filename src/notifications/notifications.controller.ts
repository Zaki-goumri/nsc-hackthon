import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Sse, MessageEvent } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Observable, Subject } from 'rxjs';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  private notificationSubject = new Subject<MessageEvent>();

  @Sse('sse')
  sse(): Observable<MessageEvent> {
    return this.notificationSubject.asObservable();
  }

  @Post('test')
  sendTestNotification() {
    this.notificationSubject.next({ data: 'test' });
    return { message: 'Test notification sent' };
  }

  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  findAll() {
    return this.notificationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
    return this.notificationsService.update(+id, updateNotificationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(+id);
  }
}
