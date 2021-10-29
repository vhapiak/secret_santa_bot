
import { describe, it } from 'mocha';
import { expect } from 'chai';
import * as sinon from 'ts-sinon';

import { User } from '../../src/user/user';
import { generateTargets } from '../../src/commands/impl/launchCommand';

describe('LaunchCommand', () => {
    describe('GenerateTargets', () => {
        it('should generate unique targets', () => {
            const test = (size: number) => {
                const users = new Array(size).fill(null).map((value, index): User => {
                    const user = sinon.stubInterface<User>();
                    user.getId.returns(index);
                    return user;
                });

                const targets = generateTargets(users);
                const notTargetedUsers = users.map(user => user);
                targets.forEach(pair => {
                    expect(pair.target).to.be.not.equal(pair.user);
                    notTargetedUsers.splice(notTargetedUsers.indexOf(pair.target), 1);
                });
                expect(notTargetedUsers.length).to.be.equal(0);
            };

            for (let users = 3; users <= 100; ++users) {
                test(users);
            }
        });
    });
});