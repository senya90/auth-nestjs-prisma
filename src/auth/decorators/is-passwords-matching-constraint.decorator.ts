import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator'

import { TEXT } from '../../libs/common/constants/text.js'
import { RegisterDTO } from '../dto/register.dto.js'

@ValidatorConstraint({ name: 'IsPasswordsMatching', async: false })
export class IsPasswordsMatchingConstraint implements ValidatorConstraintInterface {
  validate(passwordRepeat: string, args?: ValidationArguments) {
    const registerDto = args?.object as RegisterDTO
    return registerDto.password === passwordRepeat
  }
  defaultMessage() {
    return TEXT.VALIDATION.PASSWORD.NOT_MATCH
  }
}
