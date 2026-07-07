import { PartialType } from '@nestjs/mapped-types';

import { AddClientsDto } from './add-clients.dto';

export class EditClientDto extends PartialType(AddClientsDto) {}
