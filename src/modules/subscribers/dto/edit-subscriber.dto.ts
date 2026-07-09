import { PartialType } from '@nestjs/mapped-types';

import { AddSubscriberDto } from './add-subscriber.dto';

export class EditSubscriberDto extends PartialType(AddSubscriberDto) {}
