const { User } = require('../../../models/user');
const request = require('supertest');

let server;

describe('auth middleware', () => {
  beforeEach(() => { server = require('../../../index'); })
  afterEach(async () => {
    await User.remove({});
    await server.close();
  });

  let token;

  const exec = () => {
    return request(server)
      .get('/api/users/me')
      .set('x-auth-token', token)
      .send();
  }

  beforeEach(() => {
    token = new User().generateAuthToken();
  });

  it('should return 401 if no token is provided', async () => {
    token = '';

    const res = await exec();

    expect(res.status).toBe(401);
  });

  it('should return 400 if token is invalid', async () => {
    token = 'a';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 200 if token is valid', async () => {
    const res = await exec();

    expect(res.status).toBe(200);
  });
});