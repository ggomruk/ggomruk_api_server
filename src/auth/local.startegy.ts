import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
@Injectable()
export class LocalStrategyService extends PassportStrategy(Strategy) {
  constructor() {
    super();
  }
}
