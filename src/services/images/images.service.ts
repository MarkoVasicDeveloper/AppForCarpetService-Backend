/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CarpetImages } from "entities/CarpetImages";
import { Repository } from "typeorm";

@Injectable()

export class ImagesService {
    constructor(@InjectRepository(CarpetImages) private readonly carpetImagesService: Repository<CarpetImages>) {}

    async addImage (photo: any) {
        return await this.carpetImagesService.save(photo)
    }
}