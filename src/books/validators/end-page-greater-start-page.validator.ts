import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { SingleIntervalDto } from '../dto/single-interval.dto';
@ValidatorConstraint({ name: 'endPageGreaterThanStartPage', async: false })
export class EndPageGreaterThanStartPageConstraint
  implements ValidatorConstraintInterface
{
  validate(endPage: number, args: ValidationArguments) {
    const object = args.object as SingleIntervalDto;
    return endPage > object.startPage;
  }

  defaultMessage(args: ValidationArguments) {
    return 'End page must be greater than start page';
  }
}
