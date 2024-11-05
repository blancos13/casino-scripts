import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import * as stream from 'stream';
import {
  BadRequestException,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { AttachmentService } from '../../services/attachment/attachment.service';

@ApiTags('Attachment: Service file upload')
@Controller('attachment')
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file): Promise<string> {
    if (!file || !Object.keys(file).length) {
      throw new BadRequestException();
    }

    return await this.attachmentService.create(file);
  }

  @Get('/:id')
  @Header('Content-Disposition', 'attachment;')
  async get(@Param('id') id: string, @Res() response): Promise<any> {
    const buffer = await this.attachmentService.get(id);

    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);

    bufferStream.pipe(response);
  }
}
