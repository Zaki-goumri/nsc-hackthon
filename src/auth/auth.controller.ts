import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/requests/sign-in.dto';
import { SignupDto } from './dto/requests/sign-up.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RoleGuard } from './guards/role.guard';
import { USER_ROLES } from 'src/user/types/user-role.type';
import { Roles } from './decorators/role.decorator';
import { AuthDto } from './dto/response/auth-response';
import { User as UserExtractor } from './decorators/user.decorator';
import { User } from 'src/user/entities/user.entity';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

@ApiTooManyRequestsResponse({
  description: 'rate limiting to many messges',
  example: 'ThrottlerException: Too Many Requests',
})
@ApiNotFoundResponse({
  description: 'user with id ${id} not found',
  example: 'user with id ${id} not found',
})
@ApiInternalServerErrorResponse({
  description: 'internal server error',
  example: 'internal server error',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized user or Unauthorized role to do this action ',
  example: 'Role STUDENT is not authorized for this action',
})
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'signin user',
    description: 'generate access and refresh token and redirect him ',
  })
  @ApiOkResponse({ description: 'sing in', type: AuthDto })
  @Post('/signin')
  signin(@Body() signinDto: SigninDto): Promise<AuthDto> {
    return this.authService.signin({ ...signinDto });
  }

  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'signup user',
    description: 'create a new user and save in db and redirect him  ',
  })
  @ApiCreatedResponse({
    description: 'generate access token and refresh token and save him in db a',
    type: AuthDto,
  })
  @ApiConflictResponse({
    description: 'User already exists due to duplicate email or phone number.',
    example: 'user already exist',
  })
  @Post('/signup')
  signup(@Body() signupDto: SignupDto): Promise<AuthDto> {
    return this.authService.signup(signupDto);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('/refresh')
  async generateNewRefreshToken(@UserExtractor() payload: User) {
    return await this.authService.refresh(payload);
  }

  @Post('/forget-password')
  async fotgetPassword(@Body() { email }: { email: string }) {
    return await this.authService.generateOtp(email);
  }
  @UseGuards(AccessTokenGuard)
  @Post('/validate-otp')
  async validateOtp(
    @UserExtractor() user: User,
    @Body() { otp }: { otp: string },
  ) {
    return this.authService.validateOtp(otp, user.id);
  }
}
