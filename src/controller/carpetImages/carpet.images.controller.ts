/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Controller, Param, Post, Req, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { PhotoConfig } from "config/photo.config";
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { ApiResponse } from "src/misc/api.restonse";
import * as fileType from 'file-type';
import { CarpetImages } from "entities/CarpetImages";
import { ImagesService } from "src/services/images/images.service";
import * as sharp from 'sharp';

@Controller('api/carpetImages')

export class CarpetImagesController {
    constructor(private readonly carpetImageService: ImagesService) { }

    @Post('add/:id')
    @UseInterceptors(
        FileInterceptor('photo', {
            storage: diskStorage({
                destination: PhotoConfig.destination,
                filename: (req, file, callback) => {
                    const name = file.originalname;

                    const normalizeName = name.replace(' ', '-');

                    const date = new Date()
                    let time = '';
                    time += date.getFullYear();
                    time += '-';
                    time += date.getMonth() + 1;
                    time += '-';
                    time += date.getDay();

                    const randomNumber = new Array(10).fill(0)
                    .map(() => (Math.random() * 9).toFixed(0))
                    .join('');

                    const nameForFile = time + '-' + randomNumber + '-' + normalizeName

                    callback(null, nameForFile)
                }
            }),
            fileFilter: (req, file, callback) => {
                if (!file.originalname.match(/\.(jpg|png)$/)) {
                    req.errorMessage = 'Bad extension';
                    callback(null, false)
                }

                callback(null, true)
            },
            limits: {
                files: 1,
                fileSize: 1024 * 1024
            }
        })
    )
    async addImages (@Param('id') carpetReceptionId: number, @UploadedFile() photo, @Req() req): Promise <CarpetImages | ApiResponse> {
        
        if (req.errorMessage) {
            fs.unlinkSync(photo.path);
            return new ApiResponse('error', -5001, req.errorMessage)
        }
     
        const mimetype = await fileType.fromFile(photo.path);

        if (!(mimetype.mime.includes('png') || mimetype.mime.includes('jpeg'))) {
            fs.unlinkSync(photo.path);
            return new ApiResponse('error', -5002, req.errorMessage)
        }
        
        const image = new CarpetImages();
        image.carpetReceptionId = carpetReceptionId;
        image.imagePath = photo.originalname;

        await this.carpetImageService.addImage(image);

        await sharp(photo.path).resize({
            width: 250,
            height: 250,
            fit: 'cover'
        }).toFile('C:/Users/38160/Desktop/Program/storage/small/' + photo.originalname)

        return image;
    }
}