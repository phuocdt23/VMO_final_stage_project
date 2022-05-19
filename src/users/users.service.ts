import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { IUser } from './interface/users.interface';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  public async create(createUserDto: CreateUserDto): Promise<IUser> {
    try {
      return await this.userRepository.save(createUserDto);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }
  public async findById(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
    return user;
  }

  public async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        email: email,
      },
    });
    return user;
  }
  public async findByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        username: username,
      },
    });
    return user;
  }

  public async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ id: +id });
      user.name = updateUserDto.name;
      user.email = updateUserDto.email;
      user.username = updateUserDto.username;

      return await this.userRepository.save(user);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }
  public async updateByPassword(
    email: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<any> {
    try {
      if (oldPassword === newPassword)
        return {
          message: 'Your password not changed yet',
          status: 409,
        };
      const user = await this.userRepository.findOne({ email: email });
      const passwordIsValid = bcrypt.compareSync(oldPassword, user.password);
      if (!passwordIsValid == true) {
        return {
          message: 'Invalid password',
          status: 403,
        };
      }
      user.password = bcrypt.hashSync(newPassword, 8);
      return await this.userRepository.save(user);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }
}
