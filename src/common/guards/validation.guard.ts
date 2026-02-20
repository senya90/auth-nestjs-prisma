import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { validate, ValidationError } from 'class-validator'

@Injectable()
export class ValidationGuard<T extends object> implements CanActivate {
  constructor(private readonly dtoClass: new (...args: any[]) => T) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const body = request.body

    const dto = plainToInstance(this.dtoClass, body)
    const errors: ValidationError[] = await validate(dto)

    if (errors.length > 0) {
      const errorMessages = errors.flatMap((error) => Object.values(error.constraints || {}))
      throw new BadRequestException(errorMessages)
    }

    return true
  }
}
