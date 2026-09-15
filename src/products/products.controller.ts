import {
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ForbiddenException,
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { QueryProductDto } from './dto/query-product.dto.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface.js';

@ApiTags('Products')
@Controller({ path: 'products', version: '1' })
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Menambahkan produk baru (Hanya Seller)' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('seller')
  @Post()
  create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.productsService.create(createProductDto, user);
  }

  @ApiOperation({
    summary: 'Melihat semua katalog produk (Dengan Pencarian & Pagination',
  })
  @Get()
  findAll(@Query() query: QueryProductDto) {
    return this.productsService.findAll(query);
  }

  @ApiOperation({ summary: 'Melihat detail satu produk' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update produk (Hanya Seller)' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('seller')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.productsService.update(+id, updateProductDto, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hapus produk (Hanya Seller)' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('seller')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.productsService.remove(+id, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload foto produk (Hanya Seller pemilik produk' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('seller')
  @Post(':id/image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!file) {
      throw new BadRequestException('File gambar wajib diunggah!');
    }

    const magicBytes: Record<string, { signature: number[]; ext: string }[]> = {
      'image/jpeg': [{ signature: [0xFF, 0xD8, 0xFF], ext: '.jpg' }],
      'image/png': [{ signature: [0x89, 0x50, 0x4E, 0x47], ext: '.png' }],
      'image/webp': [{ signature: [0x52, 0x49, 0x46, 0x46], ext: '.webp' }],
    };

    const buffer = file.buffer;
    if (!buffer || buffer.length < 4) {
      throw new BadRequestException('File tidak valid atau kosong!');
    }

    let detectedExt: string | null = null;

    for (const [, signatures] of Object.entries(magicBytes)) {
      for (const { signature, ext } of signatures) {
        const match = signature.every((byte, i) => buffer[i] === byte);
        if (match) {
          if (ext === '.webp') {
            const webpMark = buffer.slice(8, 12).toString('ascii');
            if (webpMark === 'WEBP') {
              detectedExt = ext;
            }
          } else {
            detectedExt = ext;
          }
          break;
        }
      }
      if (detectedExt) break;
    }

    if (!detectedExt) {
      throw new BadRequestException(
        'File bukan gambar valid! Hanya JPG, PNG, dan WEBP yang didukung.',
      );
    }

    const product = await this.productsService.findOne(+id);
    if (product.user?.id !== user.sub) {
      throw new ForbiddenException('Akses ditolak!');
    }
    const uploadDir = './uploads/products';
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `product-${uniqueSuffix}${detectedExt}`;
    writeFileSync(join(uploadDir, filename), buffer);

    return this.productsService.updateImage(+id, filename, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Memulihkan produk yang pernah di hapus (Restore)' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('seller')
  @Patch(':id/restore')
  restore(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.productsService.restore(+id, user);
  }
}
