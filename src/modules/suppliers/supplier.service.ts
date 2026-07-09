import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddSupplierDto } from 'src/modules/suppliers/dto/add-supplier.dto';
import { EditSupplierDto } from 'src/modules/suppliers/dto/edit-supplier.dto';
import { Supplier } from 'src/modules/suppliers/supplier.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  async addSupplier(data: AddSupplierDto, userId: number): Promise<Supplier> {
    const existingSupplier = await this.supplierRepository.findOne({
      where: {
        userId,
        name: data.name,
      },
    });

    if (existingSupplier) {
      throw new ConflictException('Supplier with this name already exists.');
    }

    const newSupplier = this.supplierRepository.create({
      ...data,
      userId,
    });

    return await this.supplierRepository.save(newSupplier);
  }

  async getAllSuppliers(userId: number): Promise<Supplier[]> {
    return await this.supplierRepository.find({
      where: { userId },
      order: { name: 'ASC' },
    });
  }

  async getSupplierById(id: number, userId: number): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({
      where: { id, userId },
      relations: ['costs'],
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found or access denied.');
    }

    return supplier;
  }

  async editSupplier(id: number, userId: number, data: EditSupplierDto): Promise<Supplier> {
    const supplier = await this.getSupplierById(id, userId);

    if (data.name && data.name !== supplier.name) {
      const nameExists = await this.supplierRepository.findOne({
        where: { name: data.name, userId },
      });
      if (nameExists) {
        throw new ConflictException('Supplier with this new name already exists.');
      }
    }

    this.supplierRepository.merge(supplier, data);
    return await this.supplierRepository.save(supplier);
  }

  async deleteSupplier(id: number, userId: number): Promise<void> {
    const result = await this.supplierRepository.delete({ id, userId });
    if (result.affected === 0) {
      throw new NotFoundException('Supplier not found or access denied.');
    }
  }
}
