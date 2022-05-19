import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
// import { JwtPayload } from './interfaces/jwt.payload';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class LoginService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private async validate(loginDto: LoginDto): Promise<any> {
    return await this.usersService.findByEmail(loginDto.email);
  }

  public async login(
    loginDto: LoginDto,
  ): Promise<any | { status: number; message: string }> {
    return this.validate(loginDto)
      .then((userData) => {
        if (!userData) {
          throw new UnauthorizedException();
        }
        if (!userData.isConfirmed) {
          return {
            message:
              'Your account is not confirmed yet, please check your mail',
            status: 400,
          };
        }

        const passwordIsValid = bcrypt.compareSync(
          loginDto.password,
          userData.password,
        );

        if (!passwordIsValid == true) {
          return {
            message: 'Invalid password',
            status: 400,
          };
        }

        const payload = {
          name: userData.name,
          email: userData.email,
          id: userData.id,
        };

        const accessToken = this.jwtService.sign(payload);

        return {
          expiresIn: 3600,
          accessToken: accessToken,
          user: payload,
          status: 200,
        };
      })
      .catch((err) => {
        throw new HttpException(err, HttpStatus.BAD_REQUEST);
      });
  }

  // public async validateUserByJwt(payload: JwtPayload) {
  //   // This will be used when the user has already logged in and has a JWT
  //   const user = await this.usersService.findByEmail(payload.email);

  //   if (!user) {
  //     throw new UnauthorizedException();
  //   }
  //   return this.createJwtPayload(user);
  // }

  // protected createJwtPayload(user) {
  //   const data: JwtPayload = {
  //     email: user.email,
  //   };

  //   const jwt = this.jwtService.sign(data);

  //   return {
  //     expiresIn: 3600,
  //     token: jwt,
  //   };
  // }
}
