import { UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, BadRequestException, Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { QueryProductDto } from './dto/query-product.dto.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Products')
@Controller({ path: 'products', version: '1' })
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Menambahkan produk baru (Hanya Seller)' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('seller')
  @Post()
  create(@Body() createProductDto: CreateProductDto, @Req() req: any) {
    return this.productsService.create(createProductDto, req.user);
  }

  @ApiOperation({ summary: 'Melihat semua katalog produk (Dengan Pencarian & Pagination' })
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
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Req() req: any) {
    return this.productsService.update(+id, updateProductDto, req.user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hapus produk (Hanya Seller)' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('seller')
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any,) {
    return this.productsService.remove(+id, req.user);
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
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `product-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return callback(new BadRequestException('Format file tidak didukung! hanya boleh JPG, JPEG, PNG, WEBP'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('File gambar wajib diunggah!');
    }
    return this.productsService.updateImage(+id, file.filename, req.user);
  }
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Memulihkan produk yang pernah di hapus (Restore)' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('seller')
  @Patch(':id/restore')
  restore(@Param('id') id: string, @Req() req: any) {
    return this.productsService.restore(+id, req.user);
  }
}
