import { Test } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';

const mockCredentiaslDto = {
  username: 'test username',
  password: 'test password',
};

describe('UserRepository', () => {
  let userRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UserRepository],
    }).compile();

    userRepository = await module.get<UserRepository>(UserRepository);
  });

  describe('signUp', () => {
    let save;

    beforeEach(() => {
      save = jest.fn();
      userRepository.create = jest.fn().mockReturnValue({ save });
    });

    it('successfully signs up the user', async () => {
      save.mockResolvedValue(undefined);

      await expect(
        userRepository.signUp(mockCredentiaslDto),
      ).resolves.not.toThrow();
    });

    it('throws a conflict exception as username already exists', async () => {
      save.mockRejectedValue({ code: '23505' });

      await expect(userRepository.signUp(mockCredentiaslDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('throws a internal error', async () => {
      save.mockRejectedValue({ code: 'any code' });

      await expect(userRepository.signUp(mockCredentiaslDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('validateUserPassword', () => {
    let user;

    beforeEach(() => {
      userRepository.findOne = jest.fn();

      user = new User();
      user.username = 'TestUsername';
      user.validatePassword = jest.fn();
    });

    it('returns the username as validation is successful', async () => {
      userRepository.findOne.mockResolvedValue(user);
      user.validatePassword.mockResolvedValue(true);

      await expect(
        userRepository.validateUserPassword(mockCredentiaslDto),
      ).resolves.toEqual(user.username);
    });

    it('returns null as the user cannot be found', async () => {
      userRepository.findOne.mockResolvedValue(undefined);

      await expect(
        userRepository.validateUserPassword(mockCredentiaslDto),
      ).resolves.toBeNull();
    });

    it('returns null as password is invalid', async () => {
      userRepository.findOne.mockResolvedValue(user);
      user.validatePassword.mockResolvedValue(false);

      await expect(
        userRepository.validateUserPassword(mockCredentiaslDto),
      ).resolves.toBeNull();
    });
  });

  describe('hashPassword', () => {
    it('calls bcrypt.hash to generate hash', async () => {
      bcrypt.hash = jest.fn().mockResolvedValue('hashed password');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const result = await userRepository.hashPassword(
        'testpassword',
        'testsalt',
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('testpassword', 'testsalt');
      expect(result).toEqual('hashed password');
    });
  });
});
