const { User } = require('../../../models/user');
const request = require('supertest');

let server;

describe('auth middleware', () => {
  beforeEach(() => {
    server = require('../../../index');
    token = new User().generateAuthToken();
    console.log("TOKEN: \n", token);
  });
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

  it('should return 401 if no token is provided', async () => {
    token = '';

    const res = await exec();

    expect(res.status).toBe(401);
  });

  it('should return 401 if token is provided but the user doesnt exist', async () => {
    const res = await exec();

    expect(res.status).toBe(401);
  });

  it('should return 400 if token is invalid', async () => {
    token = 'a';

    const res = await exec();

    expect(res.status).toBe(400);
  });
  /*TODO: Write the valid path
    it('should return 200 if token is valid', async () => {
      const res = await exec();
  
      expect(res.status).toBe(200);
    });*/
});