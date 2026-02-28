import type { MSGraphClientV3 } from '@microsoft/sp-http';
import type { User } from '../models';

type GraphResponse<T> = {
  value: T[];
  '@odata.nextLink'?: string;
};

const SELECT_FIELDS = 'displayName,givenName,surname,department,jobTitle,companyName,mail,mobilePhone,businessPhones,userPrincipalName';

export const createUserService = (graphClient: MSGraphClientV3): { getAll: () => Promise<User[]> } => ({

  async getAll(): Promise<User[]> {
    const collected: User[] = [];

    const response: GraphResponse<User> = await graphClient
      .api('/users')
      .select(SELECT_FIELDS)
      .top(100)
      .get();

    collected.push(...response.value);
    let nextLink = response['@odata.nextLink'];

    while (nextLink) {
      const nextResponse: GraphResponse<User> = await graphClient
        .api(nextLink)
        .get();

      collected.push(...nextResponse.value);
      nextLink = nextResponse['@odata.nextLink'];
    }

    return collected;
  }
});
