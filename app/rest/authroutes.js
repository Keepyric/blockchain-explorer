/**
 *    SPDX-License-Identifier: Apache-2.0
 */

const passport = require('passport');

const User = require('../platform/fabric/models/User');

const { responder } = require('./requestutils');

const authroutes = async function(router, platform) {
  const proxy = platform.getProxy();

  /** *
   Network list
   GET /networklist -> /login
   curl -i 'http://<host>:<port>/networklist'
   */
  router.get(
    '/networklist',
    responder(async req => {
      const networkList = await proxy.networkList(req);
      return { networkList };
    })
  );

  /** *
  Login
  POST /login -> /login
  curl -X POST -H 'Content-Type: routerlication/json' -d '{ 'user': '<user>', 'password': '<password>', 'network': '<network>' }' -i 'http://<host>:<port>/login'
  */
  router.post('/login', async (req, res, next) => {
    console.log('req.body', req.body);
    return passport.authenticate('local-login', (err, token, userData) => {
      if (err) {
        if (err.name === 'IncorrectCredentialsError') {
          return res.status(400).json({
            success: false,
            message: err.message
          });
        }
        return res.status(400).json({
          success: false,
          message: 'Could not process the form.'
        });
      }
      return res.json({
        status: 200,
        success: true,
        message: 'You have successfully logged in!',
        token,
        user: userData
      });
    })(req, res, next);
  });

  /** *
  Logout
  POST /logout -> /logout
  curl -X POST -H 'Content-Type: routerlication/json' -i 'http://<host>:<port>/logout'
  */
  router.post('/logout', async (req, res) => {
    // TODO: invalidate jwt token
    console.log(`user logged out`);
  });

  /** *
    Register
    POST /register -> /register
    curl -X POST -H 'Content-Type: application/json' -d '{ 'user': '<user>', 'password': '<password>', 'affiliation': '<affiliation>', 'roles': '<roles>' }' -i 'http://<host>:<port>/api/register'
    *
    */
  router.post(
    '/register',
    responder(async req => {
      //:user/:password/:affiliation/:roles
      const reqUser = await new User(req.body).asJson();
      return await proxy.register(reqUser);
    })
  );

  /** *
    Enroll
    POST /enroll -> /enroll
    curl -X POST -H 'Content-Type: application/json' -d '{ 'user': '<user>', 'password': '<password>', 'affiliation': '<affiliation>', 'roles': '<roles>' }' -i 'http://<host>:<port>/api/enroll'
    *
    */
  router.post(
    '/enroll',
    responder(async req => {
      const reqUser = await new User(req.body).asJson();
      return await proxy.enroll(reqUser);
    })
  );
}; //end authroutes()
module.exports = authroutes;