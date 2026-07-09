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
        userId: userId,
        costsId: data.costsId,
        name: data.name,
      },
    });

    if (existingSupplier) {
      throw new ConflictException(
        'Supplier with this name already exists for the specified cost category.',
      );
    }

    const newSupplier = this.supplierRepository.create({
      ...data,
      userId,
    });

    return await this.supplierRepository.save(newSupplier);
  }

  async editSupplier(supplierId: number, userId: number, data: EditSupplierDto): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({
      where: {
        id: supplierId,
        userId: userId,
      },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found.');
    }

    this.supplierRepository.merge(supplier, data);

    return await this.supplierRepository.save(supplier);
  }

  async getAllSuppliers(userId: number, costsId: number): Promise<Supplier[]> {
    return await this.supplierRepository.find({
      where: {
        userId: userId,
        costsId: costsId,
      },
    });
  }
}
