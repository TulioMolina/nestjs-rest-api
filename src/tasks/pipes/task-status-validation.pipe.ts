import { PipeTransform, BadRequestException } from '@nestjs/common';
import { TaskStatus } from '../task-status.enum';

export class TaskStatusValidationPipe implements PipeTransform {
  readonly allowedStatuses = [
    TaskStatus.IN_PROGRESS,
    TaskStatus.COMPLETED,
    TaskStatus.OPEN,
  ];

  transform(value: any) {
    value = value.toUpperCase();
    if (!this.isStatusValid(value)) {
      throw new BadRequestException(`"${value} is invalid status"`);
    }
    return value;
  }

  private isStatusValid(status: any) {
    return this.allowedStatuses.some(allowedStatus => status === allowedStatus);
  }
}
