import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategyService extends PassportStrategy(
  Strategy,
  'google',
) {
  constructor() {
    super();
  }
}
