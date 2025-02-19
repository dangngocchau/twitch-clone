import { Resolver } from '@nestjs/graphql';
import { AccountService } from './account.service';

@Resolver('Account')
export class AccountResolver {
  constructor(private readonly accountService: AccountService) {}
}
